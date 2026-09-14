import { Test } from '@nestjs/testing';
import { OfferSyncCron } from './offer-sync.cron';
import { OfferService } from './offer.service';
import { OfferSyncService } from './offer-sync.service';
import { SettingsService } from '@modules/settings/settings.service';

function buildSettings(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    scrapingEnabled: true,
    scrapeHour: 4,
    scrapeMinute: 0,
    syncRequestDelayMs: 0,
    ...overrides,
  };
}

describe('OfferSyncCron.runScheduledSyncIfDue', () => {
  let cron: OfferSyncCron;
  let offerService: { findOffersForSync: jest.Mock };
  let offerSyncService: { syncOffer: jest.Mock };
  let settingsService: {
    getSettings: jest.Mock;
    markSyncStarted: jest.Mock;
    markSyncFinished: jest.Mock;
  };
  let systemTime: Date;

  beforeEach(async () => {
    offerService = { findOffersForSync: jest.fn().mockResolvedValue([]) };
    offerSyncService = { syncOffer: jest.fn().mockResolvedValue(undefined) };
    settingsService = {
      getSettings: jest.fn().mockResolvedValue(buildSettings()),
      markSyncStarted: jest.fn().mockResolvedValue(undefined),
      markSyncFinished: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferSyncCron,
        { provide: OfferService, useValue: offerService },
        { provide: OfferSyncService, useValue: offerSyncService },
        { provide: SettingsService, useValue: settingsService },
      ],
    }).compile();

    cron = moduleRef.get(OfferSyncCron);
    systemTime = new Date('2026-01-01T04:00:00.000');
    jest.useFakeTimers().setSystemTime(systemTime);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not run when scrapingEnabled is false, even at the scheduled time', async () => {
    settingsService.getSettings.mockResolvedValue(
      buildSettings({ scrapingEnabled: false }),
    );

    await cron.runScheduledSyncIfDue();

    expect(offerService.findOffersForSync).not.toHaveBeenCalled();
  });

  it('does not run when the current time does not match the configured schedule', async () => {
    settingsService.getSettings.mockResolvedValue(
      buildSettings({ scrapeHour: 5, scrapeMinute: 30 }),
    );

    await cron.runScheduledSyncIfDue();

    expect(offerService.findOffersForSync).not.toHaveBeenCalled();
  });

  it('runs the full sync when enabled and the current time matches the schedule', async () => {
    settingsService.getSettings.mockResolvedValue(
      buildSettings({ scrapeHour: 4, scrapeMinute: 0 }),
    );

    await cron.runScheduledSyncIfDue();

    expect(offerService.findOffersForSync).toHaveBeenCalled();
    expect(settingsService.markSyncStarted).toHaveBeenCalled();
    expect(settingsService.markSyncFinished).toHaveBeenCalledWith(
      'success',
      expect.any(String),
    );
  });
});

describe('OfferSyncCron.runFullSync', () => {
  let cron: OfferSyncCron;
  let offerService: { findOffersForSync: jest.Mock };
  let offerSyncService: { syncOffer: jest.Mock };
  let settingsService: {
    getSettings: jest.Mock;
    markSyncStarted: jest.Mock;
    markSyncFinished: jest.Mock;
  };

  beforeEach(async () => {
    offerService = { findOffersForSync: jest.fn() };
    offerSyncService = { syncOffer: jest.fn().mockResolvedValue(undefined) };
    settingsService = {
      getSettings: jest.fn().mockResolvedValue(buildSettings()),
      markSyncStarted: jest.fn().mockResolvedValue(undefined),
      markSyncFinished: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferSyncCron,
        { provide: OfferService, useValue: offerService },
        { provide: OfferSyncService, useValue: offerSyncService },
        { provide: SettingsService, useValue: settingsService },
      ],
    }).compile();

    cron = moduleRef.get(OfferSyncCron);
  });

  it('syncs every offer with a URL, one at a time, in order', async () => {
    const callOrder: string[] = [];
    offerService.findOffersForSync.mockResolvedValue([
      { id: 'offer-1' },
      { id: 'offer-2' },
    ]);
    offerSyncService.syncOffer.mockImplementation(async (offer) => {
      callOrder.push(offer.id);
    });

    await cron.runFullSync();

    expect(callOrder).toEqual(['offer-1', 'offer-2']);
  });

  it('continues with the next offer when one sync throws', async () => {
    offerService.findOffersForSync.mockResolvedValue([
      { id: 'offer-1' },
      { id: 'offer-2' },
    ]);
    offerSyncService.syncOffer
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined);

    await expect(cron.runFullSync()).resolves.not.toThrow();
    expect(offerSyncService.syncOffer).toHaveBeenCalledTimes(2);
  });

  it('marks the sync as started before running and finished with a success summary after', async () => {
    offerService.findOffersForSync.mockResolvedValue([{ id: 'offer-1' }]);

    await cron.runFullSync();

    expect(settingsService.markSyncStarted).toHaveBeenCalled();
    expect(settingsService.markSyncFinished).toHaveBeenCalledWith(
      'success',
      expect.stringContaining('1'),
    );
  });

  it('marks the sync as finished with an error status when the run itself throws', async () => {
    offerService.findOffersForSync.mockRejectedValue(new Error('db down'));

    await expect(cron.runFullSync()).rejects.toThrow('db down');
    expect(settingsService.markSyncFinished).toHaveBeenCalledWith(
      'error',
      expect.stringContaining('db down'),
    );
  });

  it('skips a concurrent call while a run is already in progress', async () => {
    let resolveFirstSync: () => void;
    const firstSyncPromise = new Promise<void>((resolve) => {
      resolveFirstSync = resolve;
    });
    offerService.findOffersForSync.mockResolvedValue([{ id: 'offer-1' }]);
    offerSyncService.syncOffer.mockReturnValue(firstSyncPromise);

    const firstRun = cron.runFullSync();
    const secondRun = cron.runFullSync();

    resolveFirstSync();
    await Promise.all([firstRun, secondRun]);

    expect(settingsService.markSyncStarted).toHaveBeenCalledTimes(1);
  });
});
