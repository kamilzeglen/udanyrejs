import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScraperClientService } from '@core/scraper-client/scraper-client.service';
import { Offer } from './offer.entity';
import { OfferTermPrice } from './offer-term-price.entity';
import { LogService } from '@modules/log/log.service';
import { OfferService } from './offer.service';
import { User } from '@modules/user/user.entity';

const SYSTEM_USER = { email: 'system@udanyrejs.pl' } as User;

function toGrosze(euroPrice: number): number {
  return Math.round(euroPrice * 100);
}

@Injectable()
export class OfferSyncService {
  private readonly logger = new Logger(OfferSyncService.name);

  public constructor(
    private readonly scraperClientService: ScraperClientService,
    @InjectRepository(OfferTermPrice)
    private readonly offerTermPriceRepository: Repository<OfferTermPrice>,
    @Inject(forwardRef(() => OfferService))
    private readonly offerService: OfferService,
    private readonly logService: LogService,
  ) {}

  public async syncOffer(offer: Offer): Promise<void> {
    const primaryUrlIsGone = await this.checkPrimaryUrlIsGone(offer);

    if (primaryUrlIsGone) {
      await this.offerService.deactivateOffer(offer.id, SYSTEM_USER);
      await this.logService.createLog(
        `Oferta "${offer.id}" dezaktywowana - strona źródłowa nie odpowiada.`,
        'SYSTEM',
      );
      return;
    }

    for (const term of offer.terms) {
      await this.syncTerm(offer, term);
    }
  }

  private async checkPrimaryUrlIsGone(offer: Offer): Promise<boolean> {
    try {
      await this.scraperClientService.priceCheck(offer.offerUrl);
      return false;
    } catch (error) {
      this.logger.warn(
        `Primary offer URL check failed for offer ${offer.id}: ${(error as Error).message}`,
      );
      return true;
    }
  }

  private async syncTerm(
    offer: Offer,
    term: Offer['terms'][number],
  ): Promise<void> {
    if (!term.sourceUrl) {
      return;
    }

    let result: {
      available: boolean;
      cabinPrices: { label: string; price: number }[];
    };

    try {
      result = await this.scraperClientService.priceCheck(term.sourceUrl);
    } catch (error) {
      await this.logService.createLog(
        `Termin "${term.id}" oferty "${offer.id}" nie odpowiada podczas synchronizacji: ${(error as Error).message}`,
        'SYSTEM',
      );
      return;
    }

    for (const termPrice of term.prices) {
      const scrapedMatch = result.cabinPrices.find((cabinPrice) =>
        cabinPrice.label
          .toLowerCase()
          .includes(termPrice.cabinType.name.toLowerCase()),
      );

      if (!scrapedMatch) {
        await this.offerTermPriceRepository.delete(termPrice.id);
        await this.logService.createLog(
          `Cena kabiny "${termPrice.cabinType.name}" usunięta z terminu "${term.id}" - zniknęła ze strony źródłowej.`,
          'SYSTEM',
        );
        continue;
      }

      const scrapedPriceInGrosze = toGrosze(scrapedMatch.price);
      const priceChanged = scrapedPriceInGrosze !== termPrice.price;

      if (!priceChanged) {
        continue;
      }

      const previousPrice = termPrice.price;
      termPrice.price = scrapedPriceInGrosze;
      await this.offerTermPriceRepository.save(termPrice);
      await this.logService.createLog(
        `Cena kabiny "${termPrice.cabinType.name}" w terminie "${term.id}" zmieniona z ${previousPrice} na ${scrapedPriceInGrosze} groszy.`,
        'SYSTEM',
      );
    }
  }
}
