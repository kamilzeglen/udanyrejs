import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OfferService } from './offer.service';
import { OfferSyncService } from './offer-sync.service';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class OfferSyncCron {
  private readonly logger = new Logger(OfferSyncCron.name);

  public constructor(
    private readonly offerService: OfferService,
    private readonly offerSyncService: OfferSyncService,
  ) {}

  @Cron(process.env.SYNC_CRON_EXPRESSION ?? '0 4 * * *')
  public async runSyncForAllOffers(): Promise<void> {
    const offers = await this.offerService.findOffersForSync();
    const delayMs = Number(process.env.SYNC_REQUEST_DELAY_MS ?? 3000);

    for (const offer of offers) {
      try {
        await this.offerSyncService.syncOffer(offer);
      } catch (error) {
        this.logger.error(
          `Sync failed for offer ${offer.id}: ${(error as Error).message}`,
        );
      }

      await wait(delayMs);
    }
  }
}
