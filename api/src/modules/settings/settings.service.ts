import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings, SyncStatus } from '@modules/settings/settings.entity';
import { UpdateSettingsDto } from '@modules/settings/dto/update-settings.dto';
import { User } from '@modules/user/user.entity';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly logService: LogService,
  ) {}

  async getSettings(): Promise<Settings> {
    return await this.settingsRepository
      .createQueryBuilder('settings')
      .getOneOrFail();
  }

  async updateSettings(
    updateSettingsDto: UpdateSettingsDto,
    reqUser: User,
  ): Promise<Settings> {
    const settings = await this.getSettings();

    if (updateSettingsDto.scrapingEnabled !== undefined) {
      settings.scrapingEnabled = updateSettingsDto.scrapingEnabled;
    }

    if (updateSettingsDto.scrapeHour !== undefined) {
      settings.scrapeHour = updateSettingsDto.scrapeHour;
    }

    if (updateSettingsDto.scrapeMinute !== undefined) {
      settings.scrapeMinute = updateSettingsDto.scrapeMinute;
    }

    if (updateSettingsDto.syncRequestDelayMs !== undefined) {
      settings.syncRequestDelayMs = updateSettingsDto.syncRequestDelayMs;
    }

    if (updateSettingsDto.termCleanupEnabled !== undefined) {
      settings.termCleanupEnabled = updateSettingsDto.termCleanupEnabled;
    }

    if (updateSettingsDto.cleanupHour !== undefined) {
      settings.cleanupHour = updateSettingsDto.cleanupHour;
    }

    if (updateSettingsDto.cleanupMinute !== undefined) {
      settings.cleanupMinute = updateSettingsDto.cleanupMinute;
    }

    await this.logService.createLog(
      'Zaktualizowano ustawienia scrapowania',
      reqUser.email,
    );

    return await this.settingsRepository.save(settings);
  }

  async markSyncStarted(): Promise<void> {
    const settings = await this.getSettings();
    settings.lastSyncStartedAt = new Date();
    settings.lastSyncStatus = 'running';
    await this.settingsRepository.save(settings);
  }

  async markSyncFinished(status: SyncStatus, summary: string): Promise<void> {
    const settings = await this.getSettings();
    settings.lastSyncFinishedAt = new Date();
    settings.lastSyncStatus = status;
    settings.lastSyncSummary = summary;
    await this.settingsRepository.save(settings);
  }
}
