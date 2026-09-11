import { Test } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { ScraperClientService } from '@core/scraper-client/scraper-client.service';
import { AppException } from '@core/errors/app-exception';
import { AuthGuard } from '@core/guards/auth.guard';
import { OfferSyncService } from './offer-sync.service';

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
