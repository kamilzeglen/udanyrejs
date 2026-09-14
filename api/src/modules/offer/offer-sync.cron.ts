import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OfferService } from './offer.service';
import { OfferSyncService } from './offer-sync.service';
import { SettingsService } from '@modules/settings/settings.service';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class OfferSyncCron {
  private readonly logger = new Logger(OfferSyncCron.name);
  private isRunning = false;

  public constructor(
    private readonly offerService: OfferService,
    private readonly offerSyncService: OfferSyncService,
    private readonly settingsService: SettingsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async runScheduledSyncIfDue(): Promise<void> {
    const settings = await this.settingsService.getSettings();

    if (!settings.scrapingEnabled) {
      return;
    }

    const now = new Date();
    const scheduledTimeMatches =
      now.getHours() === settings.scrapeHour &&
      now.getMinutes() === settings.scrapeMinute;

    if (!scheduledTimeMatches) {
      return;
    }

    await this.runFullSync();
  }

  // Współdzielona przez cron (po sprawdzeniu harmonogramu) i ręczny trigger
  // z panelu admina (POST /offers/sync-now) - obie ścieżki mają identyczny
  // przebieg i to samo zabezpieczenie przed nakładającymi się uruchomieniami.
  public async runFullSync(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        'Synchronizacja już trwa - pominięto kolejne uruchomienie.',
      );
      return;
    }

    this.isRunning = true;
    await this.settingsService.markSyncStarted();

    try {
      const settings = await this.settingsService.getSettings();
      const offers = await this.offerService.findOffersForSync();
      let failedCount = 0;

      for (const offer of offers) {
        try {
          await this.offerSyncService.syncOffer(offer);
        } catch (error) {
          failedCount++;
          this.logger.error(
            `Sync failed for offer ${offer.id}: ${(error as Error).message}`,
          );
        }

        await wait(settings.syncRequestDelayMs);
      }

      await this.settingsService.markSyncFinished(
        'success',
        `Zsynchronizowano ${offers.length - failedCount} z ${offers.length} ofert.`,
      );
    } catch (error) {
      await this.settingsService.markSyncFinished(
        'error',
        `Synchronizacja przerwana błędem: ${(error as Error).message}`,
      );
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}
