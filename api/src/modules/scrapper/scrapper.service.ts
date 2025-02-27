import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { LogService } from '@modules/log/log.service';
import { OfferService } from '@modules/offer/offer.service';
import { Scrapper } from '../../interfaces/scrapper';
import axios from 'axios';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  constructor(
    @Inject(forwardRef(() => OfferService))
    private readonly offerService: OfferService,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
  ) {}

  @Cron('0 2 * * *')
  async CronSyncOffer() {
    const offers = await this.offerService.findAllWithURL();
    let index = 0;

    for (const offer of offers) {
      setTimeout(async () => {
        try {
          await this.offerService.syncOffer(offer.id);
        } catch (error) {
          this.logger.error(`Błąd aktualizacji oferty ${offer.id}`, error);
        }
      }, index * 60000);

      index++;
    }
  }

  @Cron('0 0 */4 * * *')
  async deactivateExpiredOffers() {
    const daysBeforeInactive = parseInt(
      this.configService.get<string>('DAYS_BEFORE_INACTIVE'),
      10,
    );

    if (isNaN(daysBeforeInactive)) {
      this.logger.error('DAYS_BEFORE_INACTIVE nie jest poprawną liczbą');
      return;
    }

    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysBeforeInactive);

    const expiredOffers = await this.offerService.findActiveOffers({
      lessThan: thresholdDate,
    });

    if (expiredOffers.length === 0) {
      return;
    }

    for (const offer of expiredOffers) {
      this.offerService.deactivate(offer);

      const logMessage = `Oferta dezaktywowana: ${offer.id} (Mniej niż ${daysBeforeInactive} dni)`;
      this.logger.log(logMessage);

      await this.logService.createLog(logMessage, 'SYSTEM');
    }
  }

  async scrapSyncOffer(offerId: string, url: string): Promise<Scrapper> {
    try {
      const scraperApiUrl = this.configService.get<string>('SCRAPPER_URL');

      if (!scraperApiUrl) {
        throw new Error(
          'SCRAPER_API_URL is not defined in environment variables',
        );
      }

      const response = await axios.post(scraperApiUrl + '/price-scrap', {
        id: offerId,
        url,
      });

      const { exists, price, pdfUrl } = response.data;
      return { id: offerId, exists, price, pdfUrl };
    } catch (error) {
      console.error('Błąd podczas scrapowania:', error.message || error);
      throw new HttpException(
        'Error while scraping cruise price',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
