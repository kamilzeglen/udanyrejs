import { Test } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { ScraperClientService } from '@core/scraper-client/scraper-client.service';
import { AppException } from '@core/errors/app-exception';
import { AuthGuard } from '@core/guards/auth.guard';
import { OfferSyncService } from './offer-sync.service';
import { OfferDiscoveryService } from './offer-discovery.service';
import { CompanyService } from '@modules/company/company.service';

describe('OfferController.scrapeOffer', () => {
  let controller: OfferController;
  let scraperClient: { fullScrap: jest.Mock };

  beforeEach(async () => {
    process.env.ALLOWED_SCRAPE_HOSTS = 'rejsy4you.pl';
    scraperClient = { fullScrap: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        { provide: OfferService, useValue: {} },
        { provide: ScraperClientService, useValue: scraperClient },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
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
    expect(scraperClient.fullScrap).not.toHaveBeenCalled();
  });

  it('returns the scraper response for an allowed URL', async () => {
    scraperClient.fullScrap.mockResolvedValue({
      name: 'Rejs testowy',
      terms: [],
    });

    const result = await controller.scrapeOffer({
      url: 'https://rejsy4you.pl/rejs/1',
    });

    expect(result).toEqual({ name: 'Rejs testowy', terms: [] });
    expect(scraperClient.fullScrap).toHaveBeenCalledWith(
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
        { provide: ScraperClientService, useValue: { fullScrap: jest.fn() } },
        { provide: OfferSyncService, useValue: offerSyncService },
        { provide: OfferDiscoveryService, useValue: {} },
        { provide: CompanyService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OfferController);
  });

  it('syncs the found offer and returns synced: true', async () => {
    const offer = { id: 'offer-1' };
    offerService.findOneById.mockResolvedValue(offer);

    const result = await controller.syncOffer('offer-1');

    expect(offerSyncService.syncOffer).toHaveBeenCalledWith(offer);
    expect(result).toEqual({ synced: true });
  });

  it('throws when the offer does not exist', async () => {
    offerService.findOneById.mockResolvedValue(null);

    await expect(controller.syncOffer('missing')).rejects.toThrow(AppException);
    expect(offerSyncService.syncOffer).not.toHaveBeenCalled();
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
        { provide: ScraperClientService, useValue: { fullScrap: jest.fn() } },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: offerDiscoveryService },
        { provide: CompanyService, useValue: companyService },
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
        { provide: ScraperClientService, useValue: { fullScrap: jest.fn() } },
        { provide: OfferSyncService, useValue: { syncOffer: jest.fn() } },
        { provide: OfferDiscoveryService, useValue: offerDiscoveryService },
        { provide: CompanyService, useValue: { findOneById: jest.fn() } },
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
