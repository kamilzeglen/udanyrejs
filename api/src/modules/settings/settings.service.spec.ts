import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { Settings } from './settings.entity';
import { LogService } from '@modules/log/log.service';

function buildQueryBuilderMock(result: unknown) {
  return {
    getOneOrFail: jest.fn().mockResolvedValue(result),
  };
}

describe('SettingsService', () => {
  let service: SettingsService;
  let settingsRepository: {
    createQueryBuilder: jest.Mock;
    save: jest.Mock;
  };
  let logService: { createLog: jest.Mock };

  const existingSettings: Settings = {
    id: 'settings-1',
    scrapingEnabled: true,
    scrapeHour: 4,
    scrapeMinute: 0,
    syncRequestDelayMs: 3000,
    lastSyncStartedAt: null,
    lastSyncFinishedAt: null,
    lastSyncStatus: null,
    lastSyncSummary: null,
    termCleanupEnabled: false,
    cleanupHour: 3,
    cleanupMinute: 0,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    settingsRepository = {
      createQueryBuilder: jest.fn(() =>
        buildQueryBuilderMock({ ...existingSettings }),
      ),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    logService = { createLog: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(Settings), useValue: settingsRepository },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    service = moduleRef.get(SettingsService);
  });

  describe('getSettings', () => {
    it('returns the single settings row', async () => {
      const result = await service.getSettings();

      expect(result).toEqual(existingSettings);
    });
  });

  describe('updateSettings', () => {
    it('applies only the provided fields and leaves the rest unchanged', async () => {
      const result = await service.updateSettings({ scrapingEnabled: false }, {
        email: 'admin@udanyrejs.pl',
      } as never);

      expect(result).toEqual(
        expect.objectContaining({
          scrapingEnabled: false,
          scrapeHour: 4,
          scrapeMinute: 0,
          syncRequestDelayMs: 3000,
        }),
      );
      expect(settingsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ scrapingEnabled: false }),
      );
    });

    it('updates the schedule and delay when provided', async () => {
      const result = await service.updateSettings(
        { scrapeHour: 6, scrapeMinute: 30, syncRequestDelayMs: 5000 },
        { email: 'admin@udanyrejs.pl' } as never,
      );

      expect(result).toEqual(
        expect.objectContaining({
          scrapeHour: 6,
          scrapeMinute: 30,
          syncRequestDelayMs: 5000,
        }),
      );
    });

    it('updates termCleanupEnabled when provided', async () => {
      const result = await service.updateSettings(
        { termCleanupEnabled: true },
        { email: 'admin@udanyrejs.pl' } as never,
      );

      expect(result).toEqual(
        expect.objectContaining({ termCleanupEnabled: true }),
      );
    });

    it('updates the cleanup schedule when provided', async () => {
      const result = await service.updateSettings(
        { cleanupHour: 5, cleanupMinute: 45 },
        { email: 'admin@udanyrejs.pl' } as never,
      );

      expect(result).toEqual(
        expect.objectContaining({ cleanupHour: 5, cleanupMinute: 45 }),
      );
    });

    it('logs the change with the acting user email', async () => {
      await service.updateSettings({ scrapingEnabled: false }, {
        email: 'admin@udanyrejs.pl',
      } as never);

      expect(logService.createLog).toHaveBeenCalledWith(
        expect.stringContaining('ustawienia'),
        'admin@udanyrejs.pl',
      );
    });
  });

  describe('markSyncStarted', () => {
    it('sets the running status and start timestamp', async () => {
      await service.markSyncStarted();

      expect(settingsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          lastSyncStatus: 'running',
          lastSyncStartedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('markSyncFinished', () => {
    it('sets the finished status, timestamp and summary', async () => {
      await service.markSyncFinished(
        'success',
        '5 z 5 ofert zsynchronizowanych',
      );

      expect(settingsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          lastSyncStatus: 'success',
          lastSyncFinishedAt: expect.any(Date),
          lastSyncSummary: '5 z 5 ofert zsynchronizowanych',
        }),
      );
    });
  });
});
