import { Test } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { ScraperClientService } from '@core/scraper-client/scraper-client.service';
import { AppException } from '@core/errors/app-exception';
import { AuthGuard } from '@core/guards/auth.guard';
import { OfferSyncService } from './offer-sync.service';
import { OfferSyncCron } from './offer-sync.cron';
import { OfferDiscoveryService } from './offer-discovery.service';
import { CompanyService } from '@modules/company/company.service';
import { OfferImportExportService } from './offer-import-export.service';

const OFFER_ID = '55555555-5555-4555-8555-555555555555';

describe('OfferController.scrapeOffer', () => {
  let controller: OfferController;
  let scraperClient: { scrapeOffer: jest.Mock };

  beforeEach(async () => {
    process.env.ALLOWED_SCRAPE_HOSTS = 'rejsy4you.pl';
    scraperClient = { scrapeOffer: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: {} },
        { provide: ScraperClientService, useValue: scraperClient },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
        { provide: OfferSyncCron, useValue: { runFullSync: jest.fn() } },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('rejects a URL outside the allowlist without calling the scraper', async () => {
    await expect(
      controller.scrapeOffer({ url: 'https://evil.example.com/x' }),
    ).rejects.toThrow(AppException);
    expect(scraperClient.scrapeOffer).not.toHaveBeenCalled();
  });

  it('returns the scraper response for an allowed URL', async () => {
    scraperClient.scrapeOffer.mockResolvedValue({
      name: 'Rejs testowy',
      terms: [],
    });

    const result = await controller.scrapeOffer({
      url: 'https://rejsy4you.pl/rejs/1',
    });

    expect(result).toEqual({ name: 'Rejs testowy', terms: [] });
    expect(scraperClient.scrapeOffer).toHaveBeenCalledWith(
      'https://rejsy4you.pl/rejs/1',
    );
  });
});

describe('OfferController.syncOffer', () => {
  let controller: OfferController;
  let offerService: { findOneById: jest.Mock };
  let offerSyncService: { syncOffer: jest.Mock };

  beforeEach(async () => {
    offerService = { findOneById: jest.fn() };
    offerSyncService = { syncOffer: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: offerService },
        { provide: ScraperClientService, useValue: { scrapeOffer: jest.fn() } },
        { provide: OfferSyncService, useValue: offerSyncService },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
        { provide: OfferSyncCron, useValue: { runFullSync: jest.fn() } },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('syncs the found offer and returns the sync result', async () => {
    const offer = {
      id: 'offer-1',
      terms: [{ id: 'term-1', sourceUrl: 'https://rejsy4you.pl/rejs/1' }],
    };
    const syncResult = {
      offerDeactivated: false,
      termsAdded: 1,
      termsDeactivated: 0,
      termsSkipped: 0,
      pdfsUpdated: 2,
    };
    offerService.findOneById.mockResolvedValue(offer);
    offerSyncService.syncOffer.mockResolvedValue(syncResult);

    const result = await controller.syncOffer('offer-1');

    expect(offerSyncService.syncOffer).toHaveBeenCalledWith(offer);
    expect(result).toEqual(syncResult);
  });

  it('throws when the offer does not exist', async () => {
    offerService.findOneById.mockResolvedValue(null);

    await expect(controller.syncOffer('missing')).rejects.toThrow(AppException);
    expect(offerSyncService.syncOffer).not.toHaveBeenCalled();
  });

  it('throws instead of syncing an offer that has no term with a source URL', async () => {
    offerService.findOneById.mockResolvedValue({
      id: 'offer-1',
      terms: [{ id: 'term-1', sourceUrl: null }],
    });

    await expect(controller.syncOffer('offer-1')).rejects.toThrow(AppException);
    expect(offerSyncService.syncOffer).not.toHaveBeenCalled();
  });
});

describe('OfferController.removeOffers', () => {
  let controller: OfferController;
  let offerService: { removeOffers: jest.Mock };

  beforeEach(async () => {
    offerService = { removeOffers: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: offerService },
        { provide: ScraperClientService, useValue: { scrapeOffer: jest.fn() } },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
        { provide: OfferSyncCron, useValue: { runFullSync: jest.fn() } },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('delegates the id list and the requesting user to the service', async () => {
    offerService.removeOffers.mockResolvedValue({
      deletedIds: ['offer-1', 'offer-2'],
      failedIds: [],
    });

    const result = await controller.removeOffers(
      { ids: ['offer-1', 'offer-2'] },
      { user: { email: 'admin@udanyrejs.pl' } },
    );

    expect(offerService.removeOffers).toHaveBeenCalledWith(
      ['offer-1', 'offer-2'],
      { email: 'admin@udanyrejs.pl' },
    );
    expect(result).toEqual({
      deletedIds: ['offer-1', 'offer-2'],
      failedIds: [],
    });
  });
});

describe('OfferController.syncOffers (bulk)', () => {
  let controller: OfferController;
  let offerSyncService: { syncOffers: jest.Mock };

  beforeEach(async () => {
    offerSyncService = { syncOffers: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: {} },
        { provide: ScraperClientService, useValue: { scrapeOffer: jest.fn() } },
        { provide: OfferSyncService, useValue: offerSyncService },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
        { provide: OfferSyncCron, useValue: { runFullSync: jest.fn() } },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('delegates the id list to the sync service and returns its summary', async () => {
    const bulkResult = {
      syncedIds: ['offer-1'],
      failedIds: ['offer-2'],
      termsAdded: 1,
      termsDeactivated: 0,
      termsReactivated: 0,
      termsSkipped: 0,
      pdfsUpdated: 0,
    };
    offerSyncService.syncOffers.mockResolvedValue(bulkResult);

    const result = await controller.syncOffers({
      ids: ['offer-1', 'offer-2'],
    });

    expect(offerSyncService.syncOffers).toHaveBeenCalledWith([
      'offer-1',
      'offer-2',
    ]);
    expect(result).toEqual(bulkResult);
  });
});

describe('OfferController.syncTerms (bulk, term-level)', () => {
  let controller: OfferController;
  let offerSyncService: { syncTerms: jest.Mock };

  beforeEach(async () => {
    offerSyncService = { syncTerms: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: {} },
        { provide: ScraperClientService, useValue: { scrapeOffer: jest.fn() } },
        { provide: OfferSyncService, useValue: offerSyncService },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
        { provide: OfferSyncCron, useValue: { runFullSync: jest.fn() } },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('delegates the term id list to the sync service and returns its summary', async () => {
    const bulkResult = {
      syncedIds: ['term-1'],
      failedIds: [],
      reactivatedIds: ['term-1'],
      deactivatedIds: [],
      pdfsUpdated: 0,
    };
    offerSyncService.syncTerms.mockResolvedValue(bulkResult);

    const result = await controller.syncTerms({ termIds: ['term-1'] });

    expect(offerSyncService.syncTerms).toHaveBeenCalledWith(['term-1']);
    expect(result).toEqual(bulkResult);
  });
});

describe('OfferController.discoverOffers', () => {
  let controller: OfferController;
  let offerDiscoveryService: { runDiscovery: jest.Mock };
  let companyService: { findOneById: jest.Mock };

  beforeEach(async () => {
    offerDiscoveryService = {
      runDiscovery: jest.fn().mockResolvedValue(undefined),
    };
    companyService = { findOneById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: {} },
        { provide: ScraperClientService, useValue: { scrapeOffer: jest.fn() } },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: offerDiscoveryService },
        { provide: CompanyService, useValue: companyService },
        { provide: OfferSyncCron, useValue: { runFullSync: jest.fn() } },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('resolves company ids to names and starts discovery without waiting for it', async () => {
    companyService.findOneById.mockResolvedValueOnce({
      id: 'company-1',
      name: 'MSC Cruises',
    });

    const result = await controller.discoverOffers(
      { count: 5, companyIds: ['company-1'] },
      { user: { email: 'admin@udanyrejs.pl' } },
    );

    expect(result).toEqual({ started: true });
    expect(offerDiscoveryService.runDiscovery).toHaveBeenCalledWith(
      ['MSC Cruises'],
      5,
      'admin@udanyrejs.pl',
    );
  });
});

describe('OfferController.syncNow', () => {
  let controller: OfferController;
  let offerSyncCron: { runFullSync: jest.Mock };

  beforeEach(async () => {
    offerSyncCron = { runFullSync: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: {} },
        { provide: ScraperClientService, useValue: { scrapeOffer: jest.fn() } },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
        { provide: OfferSyncCron, useValue: offerSyncCron },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('starts the full sync without waiting for it and returns immediately', async () => {
    const result = await controller.syncNow();

    expect(result).toEqual({ started: true });
    expect(offerSyncCron.runFullSync).toHaveBeenCalled();
  });

  it('does not let a failed background run reject the request', async () => {
    offerSyncCron.runFullSync.mockRejectedValue(new Error('boom'));

    await expect(controller.syncNow()).resolves.toEqual({ started: true });
  });
});

describe('OfferController.listDiscoveryDrafts / getDiscoveryDraft / deleteDiscoveryDraft', () => {
  let controller: OfferController;
  let offerDiscoveryService: {
    listPendingDrafts: jest.Mock;
    getDraftById: jest.Mock;
    deleteDraft: jest.Mock;
  };

  beforeEach(async () => {
    offerDiscoveryService = {
      listPendingDrafts: jest.fn(),
      getDraftById: jest.fn(),
      deleteDraft: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: {} },
        { provide: ScraperClientService, useValue: { scrapeOffer: jest.fn() } },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: offerDiscoveryService },
        { provide: CompanyService, useValue: { findOneById: jest.fn() } },
        { provide: OfferSyncCron, useValue: { runFullSync: jest.fn() } },
        { provide: OfferImportExportService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('lists pending drafts', async () => {
    offerDiscoveryService.listPendingDrafts.mockResolvedValue([
      { id: 'draft-1' },
    ]);
    await expect(controller.listDiscoveryDrafts()).resolves.toEqual([
      { id: 'draft-1' },
    ]);
  });

  it('gets one draft by id', async () => {
    offerDiscoveryService.getDraftById.mockResolvedValue({ id: 'draft-1' });
    await expect(controller.getDiscoveryDraft('draft-1')).resolves.toEqual({
      id: 'draft-1',
    });
    expect(offerDiscoveryService.getDraftById).toHaveBeenCalledWith('draft-1');
  });

  it('deletes a draft', async () => {
    offerDiscoveryService.deleteDraft.mockResolvedValue(true);
    const result = await controller.deleteDiscoveryDraft('draft-1', {
      user: { email: 'admin@udanyrejs.pl' },
    });
    expect(result).toBe(true);
    expect(offerDiscoveryService.deleteDraft).toHaveBeenCalledWith(
      'draft-1',
      'admin@udanyrejs.pl',
    );
  });
});

describe('OfferController import and export', () => {
  function createController() {
    const importExportService = {
      exportToZip: jest.fn(),
      preview: jest.fn(),
      confirm: jest.fn(),
    };
    const controller = new OfferController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      importExportService as any,
    );

    return { controller, importExportService };
  }

  it('parses export ids and sends a ZIP response', async () => {
    const context = createController();
    const archive = Buffer.from('zip');
    const response = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    context.importExportService.exportToZip.mockResolvedValue(archive);

    await context.controller.exportOffers(
      `${OFFER_ID},${OFFER_ID}`,
      response as any,
    );

    expect(context.importExportService.exportToZip).toHaveBeenCalledWith([
      OFFER_ID,
    ]);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/zip',
    );
    expect(response.send).toHaveBeenCalledWith(archive);
  });

  it('rejects preview without a non-empty uploaded file', async () => {
    const context = createController();

    await expect(
      context.controller.previewImportOffers(undefined),
    ).rejects.toThrow(AppException);
    expect(context.importExportService.preview).not.toHaveBeenCalled();
  });

  it('passes a confirmed archive and current user to the service', async () => {
    const context = createController();
    const buffer = Buffer.from('zip');
    const file = { buffer } as Express.Multer.File;
    const user = { email: 'admin@udanyrejs.pl' };
    const expected = { created: ['offer-0'], updated: [], failed: [] };
    context.importExportService.confirm.mockResolvedValue(expected);

    await expect(
      context.controller.confirmImportOffers(file, { user } as any),
    ).resolves.toEqual(expected);
    expect(context.importExportService.confirm).toHaveBeenCalledWith(
      buffer,
      user,
    );
  });
});
