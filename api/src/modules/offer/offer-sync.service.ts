import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  ScrapedCabinPrice,
  ScrapedPageNotFoundError,
  ScrapedSiblingLink,
  ScrapedTermPageResponse,
  ScraperClientService,
} from '@core/scraper-client/scraper-client.service';
import { Offer } from './offer.entity';
import { OfferTermPrice } from './offer-term-price.entity';
import { LogService } from '@modules/log/log.service';
import { OfferService } from './offer.service';
import { CabinType } from '@modules/cabin-type/cabin-type.entity';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';
import { PdfFileType } from '../../interfaces/save-update-file-types';
import { findBestMatch } from '@core/utils/fuzzy-match.util';
import { isSameDateRange } from '@core/utils/date-range.util';
import {
  OfferTermDto,
  OfferTermPriceDto,
} from '@modules/offer/dto/offer-term.dto';

function toGrosze(euroPrice: number): number {
  return Math.round(euroPrice * 100);
}

export interface OfferSyncResult {
  offerDeactivated: boolean;
  termsAdded: number;
  termsDeactivated: number;
  termsSkipped: number;
  pdfsUpdated: number;
}

@Injectable()
export class OfferSyncService {
  private readonly logger = new Logger(OfferSyncService.name);

  public constructor(
    private readonly scraperClientService: ScraperClientService,
    @Inject(forwardRef(() => OfferService))
    private readonly offerService: OfferService,
    private readonly cabinTypeService: CabinTypeService,
    private readonly pdfFileService: PdfFileService,
    private readonly logService: LogService,
  ) {}

  // Odróżnia pierwsze, pełne skrapowanie (scrapeOffer - chodzi po CAŁEJ
  // rodzinie terminów, używane tylko przy imporcie/discovery, patrz
  // OfferDiscoveryService i OfferController.scrapeOffer) od cyklicznej/
  // ręcznej synchronizacji: sync ma tylko ODŚWIEŻYĆ dane (cena, daty, PDF)
  // każdego JUŻ znanego terminu pojedynczym lekkim scrapeTerm (jedna strona,
  // bez chodzenia po siblingach) i coś zaktualizować TYLKO gdy faktycznie się
  // zmieniło - nie ma powodu za każdym razem od nowa ściągać PDF czy
  // nadpisywać identycznych cen. Nowy termin (link nieznany z naszej bazy)
  // dostaje pełny scrapeTerm tej JEDNEJ strony, bez uruchamiania całej
  // sekwencji na już istniejących terminach.
  public async syncOffer(offer: Offer): Promise<OfferSyncResult> {
    const cabinTypes = await this.cabinTypeService.findAllByCompany(
      offer.companyId,
    );
    const knownTerms = [...offer.terms];
    const termsToSync = offer.terms.filter(
      (term) => term.sourceUrl && term.isActive,
    );

    let termsAdded = 0;
    let termsDeactivated = 0;
    let termsSkipped = 0;
    let pdfsUpdated = 0;

    const discoveredLinks = new Map<string, ScrapedSiblingLink>();

    // Faza 1: odśwież KAŻDY znany aktywny termin - lekki scrapeTerm (jedna
    // strona), update tylko przy realnej różnicy.
    for (const term of termsToSync) {
      let scraped: ScrapedTermPageResponse;
      try {
        scraped = await this.scraperClientService.scrapeTerm(term.sourceUrl);
      } catch (error) {
        if (error instanceof ScrapedPageNotFoundError) {
          await this.offerService.setTermActive(term.id, false);
          this.logger.warn(
            `Termin "${term.id}" oferty "${offer.id}" dezaktywowany - strona źródłowa potwierdziła 404/410 (oferta zdjęta ze strony).`,
          );
          termsDeactivated++;
          continue;
        }

        // Niepowodzenie komunikacji ze scraperem (timeout, scraper padł,
        // błąd sieci) NIE oznacza że strona źródłowa faktycznie zniknęła -
        // dezaktywacja tylko na tej podstawie byłaby fałszywym alarmem
        // niszczącym żywe terminy. Próbujemy ponownie przy kolejnym syncu.
        this.logger.warn(
          `Termin "${term.id}" oferty "${offer.id}" pominięty w tej synchronizacji - strona źródłowa nie odpowiedziała: ${(error as Error).message}`,
        );
        termsSkipped++;
        continue;
      }

      if (!isSameDateRange(term, scraped)) {
        await this.offerService.updateTermDates(
          term.id,
          scraped.startDate,
          scraped.endDate,
        );
      }

      const priceDtos = this.buildPriceDtos(scraped.cabinPrices, cabinTypes);
      if (!this.pricesUnchanged(term.prices ?? [], priceDtos)) {
        await this.offerService.updateTermPrices(
          term.id,
          offer.companyId,
          priceDtos,
        );
      }

      if (
        scraped.pdfUrl &&
        term.pdfFile?.url !== scraped.pdfUrl &&
        (await this.tryUpdateTermPdf(term.id, scraped.pdfUrl))
      ) {
        pdfsUpdated++;
      }

      for (const sibling of scraped.siblingLinks) {
        discoveredLinks.set(sibling.sourceUrl, sibling);
      }
    }

    // Faza 2: TYLKO naprawdę nowe terminy (link nieznany z naszej bazy,
    // niezależnie czy inny nasz termin jest aktywny czy nie - świadomie
    // nieaktywnego terminu odkrycie go jako sibling nie ma przywracać) -
    // pełny scrapeTerm tej jednej strony, bez dotykania reszty terminów.
    for (const [sourceUrl] of discoveredLinks) {
      if (knownTerms.some((known) => known.sourceUrl === sourceUrl)) {
        continue;
      }

      try {
        const scraped = await this.scraperClientService.scrapeTerm(sourceUrl);
        const newTermDto: OfferTermDto = {
          startDate: scraped.startDate,
          endDate: scraped.endDate,
          sourceUrl,
          prices: this.buildPriceDtos(scraped.cabinPrices, cabinTypes),
        };
        const newTerm = await this.offerService.createDiscoveredTerm(
          offer,
          newTermDto,
        );
        knownTerms.push(newTerm);
        termsAdded++;

        if (
          scraped.pdfUrl &&
          (await this.tryUpdateTermPdf(newTerm.id, scraped.pdfUrl))
        ) {
          pdfsUpdated++;
        }
      } catch (error) {
        if (error instanceof ScrapedPageNotFoundError) {
          // Sibling-link był martwy zanim zdążyliśmy na niego wejść - nic
          // nie tworzymy, to nie jest nasz istniejący termin.
          continue;
        }

        this.logger.warn(
          `Nowo odkryty termin oferty "${offer.id}" (${sourceUrl}) pominięty w tej synchronizacji - strona źródłowa nie odpowiedziała: ${(error as Error).message}`,
        );
        termsSkipped++;
      }
    }

    const offerActive = await this.offerService.recalculateOfferActiveState(
      offer.id,
    );

    await this.logService.createLog(
      `Zsynchronizowano ofertę "${offer.name}" (${offer.id}): ` +
        `${termsAdded} nowy(ch) termin(ów), ${termsDeactivated} dezaktywowany(ch) termin(ów), ` +
        `${termsSkipped} pominięty(ch) z powodu błędu połączenia, ` +
        `${pdfsUpdated} zaktualizowany(ch) PDF` +
        (offerActive
          ? '.'
          : ', oferta dezaktywowana - brak aktywnych terminów.'),
      'SYSTEM',
    );

    return {
      offerDeactivated: !offerActive,
      termsAdded,
      termsDeactivated,
      termsSkipped,
      pdfsUpdated,
    };
  }

  private pricesUnchanged(
    existingPrices: OfferTermPrice[],
    newPriceDtos: OfferTermPriceDto[],
  ): boolean {
    if (existingPrices.length !== newPriceDtos.length) {
      return false;
    }

    const existingPriceByCabinTypeId = new Map(
      existingPrices.map((price) => [price.cabinTypeId, price.price]),
    );

    return newPriceDtos.every((dto) => {
      if (!dto.cabinTypeId) {
        // Kabina jeszcze nieznana dla tej firmy (dopiero co odkryta na
        // stronie) - z definicji nie może być "bez zmian".
        return false;
      }
      return existingPriceByCabinTypeId.get(dto.cabinTypeId) === dto.price;
    });
  }

  private buildPriceDtos(
    cabinPrices: ScrapedCabinPrice[],
    cabinTypes: CabinType[],
  ): OfferTermPriceDto[] {
    return cabinPrices.map((cabinPrice) => {
      const matchedCabinTypeId = findBestMatch(cabinPrice.label, cabinTypes);
      return matchedCabinTypeId
        ? {
            cabinTypeId: matchedCabinTypeId,
            price: toGrosze(cabinPrice.price),
          }
        : {
            cabinTypeName: cabinPrice.label,
            price: toGrosze(cabinPrice.price),
          };
    });
  }

  private async tryUpdateTermPdf(
    termId: string,
    pdfUrl: string,
  ): Promise<boolean> {
    try {
      const file = await this.pdfFileService.downloadPdfFromUrl(pdfUrl);
      await this.pdfFileService.updatePdfFile(
        termId,
        PdfFileType.TERM,
        file,
        'SYSTEM',
        pdfUrl,
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Nie udało się zaktualizować PDF terminu "${termId}": ${(error as Error).message}`,
      );
      return false;
    }
  }
}
