import { Test } from '@nestjs/testing';
import { OfferTermCleanupCron } from './offer-term-cleanup.cron';
import { OfferService } from './offer.service';
import { SettingsService } from '@modules/settings/settings.service';
import { LogService } from '@modules/log/log.service';

function buildSettings(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    termCleanupEnabled: true,
    cleanupHour: 3,
    cleanupMinute: 0,
    ...overrides,
  };
}

describe('OfferTermCleanupCron.runScheduledCleanupIfDue', () => {
  let cron: OfferTermCleanupCron;
  let offerService: { cleanupPastTerms: jest.Mock };
  let settingsService: { getSettings: jest.Mock };
  let logService: { createLog: jest.Mock };

  beforeEach(async () => {
    offerService = {
      cleanupPastTerms: jest
        .fn()
        .mockResolvedValue({ deletedTermsCount: 0, deletedOffersCount: 0 }),
    };
    settingsService = {
      getSettings: jest.fn().mockResolvedValue(buildSettings()),
    };
    logService = { createLog: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferTermCleanupCron,
        { provide: OfferService, useValue: offerService },
        { provide: SettingsService, useValue: settingsService },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    cron = moduleRef.get(OfferTermCleanupCron);
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T03:00:00.000'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not run when termCleanupEnabled is false, even at the scheduled time', async () => {
    settingsService.getSettings.mockResolvedValue(
      buildSettings({ termCleanupEnabled: false }),
    );

    await cron.runScheduledCleanupIfDue();

    expect(offerService.cleanupPastTerms).not.toHaveBeenCalled();
  });

  it('does not run when the current time does not match the configured schedule', async () => {
    settingsService.getSettings.mockResolvedValue(
      buildSettings({ cleanupHour: 5, cleanupMinute: 30 }),
    );

    await cron.runScheduledCleanupIfDue();

    expect(offerService.cleanupPastTerms).not.toHaveBeenCalled();
  });

  it('runs the cleanup when enabled and the current time matches the schedule', async () => {
    await cron.runScheduledCleanupIfDue();

    expect(offerService.cleanupPastTerms).toHaveBeenCalled();
  });
});

describe('OfferTermCleanupCron.runCleanup', () => {
  let cron: OfferTermCleanupCron;
  let offerService: { cleanupPastTerms: jest.Mock };
  let settingsService: { getSettings: jest.Mock };
  let logService: { createLog: jest.Mock };

  beforeEach(async () => {
    offerService = { cleanupPastTerms: jest.fn() };
    settingsService = { getSettings: jest.fn() };
    logService = { createLog: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferTermCleanupCron,
        { provide: OfferService, useValue: offerService },
        { provide: SettingsService, useValue: settingsService },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    cron = moduleRef.get(OfferTermCleanupCron);
  });

  it('logs a summary with the deleted counts on success', async () => {
    offerService.cleanupPastTerms.mockResolvedValue({
      deletedTermsCount: 3,
      deletedOffersCount: 1,
    });

    await cron.runCleanup();

    expect(logService.createLog).toHaveBeenCalledWith(
      expect.stringContaining('3'),
      'SYSTEM',
    );
    expect(logService.createLog).toHaveBeenCalledWith(
      expect.stringContaining('1'),
      'SYSTEM',
    );
  });

  it('logs an error summary and rethrows when the cleanup fails', async () => {
    offerService.cleanupPastTerms.mockRejectedValue(new Error('db down'));

    await expect(cron.runCleanup()).rejects.toThrow('db down');

    expect(logService.createLog).toHaveBeenCalledWith(
      expect.stringContaining('db down'),
      'SYSTEM',
    );
  });
});
