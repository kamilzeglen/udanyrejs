import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OfferService } from './offer.service';
import { SettingsService } from '@modules/settings/settings.service';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class OfferTermCleanupCron {
  private readonly logger = new Logger(OfferTermCleanupCron.name);

  public constructor(
    private readonly offerService: OfferService,
    private readonly settingsService: SettingsService,
    private readonly logService: LogService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async runScheduledCleanupIfDue(): Promise<void> {
    const settings = await this.settingsService.getSettings();

    if (!settings.termCleanupEnabled) {
      return;
    }

    const now = new Date();
    const scheduledTimeMatches =
      now.getHours() === settings.cleanupHour &&
      now.getMinutes() === settings.cleanupMinute;

    if (!scheduledTimeMatches) {
      return;
    }

    await this.runCleanup();
  }

  public async runCleanup(): Promise<void> {
    try {
      const result = await this.offerService.cleanupPastTerms();

      await this.logService.createLog(
        `Usunięto przeszłych terminów: ${result.deletedTermsCount}. ` +
          `Usunięto ofert bez pozostałych terminów: ${result.deletedOffersCount}.`,
        'SYSTEM',
      );
    } catch (error) {
      this.logger.error(
        `Czyszczenie przeszłych terminów nie powiodło się: ${(error as Error).message}`,
      );
      await this.logService.createLog(
        `Czyszczenie przeszłych terminów zakończone błędem: ${(error as Error).message}`,
        'SYSTEM',
      );
      throw error;
    }
  }
}
