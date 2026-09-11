import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OfferSyncService } from './offer-sync.service';
import { ScraperClientService } from '@core/scraper-client/scraper-client.service';
import { Offer } from './offer.entity';
import { OfferTermPrice } from './offer-term-price.entity';
import { LogService } from '@modules/log/log.service';
import { OfferService } from './offer.service';

describe('OfferSyncService.syncOffer', () => {
  let service: OfferSyncService;
  let scraperClient: { priceCheck: jest.Mock };
  let offerTermPriceRepository: { save: jest.Mock; delete: jest.Mock };
  let offerService: { deactivateOffer: jest.Mock };
  let logService: { createLog: jest.Mock };

  beforeEach(async () => {
    scraperClient = { priceCheck: jest.fn() };
    offerTermPriceRepository = { save: jest.fn(), delete: jest.fn() };
    offerService = { deactivateOffer: jest.fn() };
    logService = { createLog: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferSyncService,
        { provide: ScraperClientService, useValue: scraperClient },
        {
          provide: getRepositoryToken(OfferTermPrice),
          useValue: offerTermPriceRepository,
        },
        { provide: OfferService, useValue: offerService },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    service = moduleRef.get(OfferSyncService);
  });

  function buildOffer(overrides: Partial<Offer> = {}): Offer {
    return {
      id: 'offer-1',
      offerUrl: 'https://rejsy4you.pl/rejs/1',
      terms: [
        {
          id: 'term-1',
          sourceUrl: 'https://rejsy4you.pl/rejs/1',
          prices: [
            {
              id: 'price-1',
              price: 61443,
              cabinType: { id: 'cabin-1', name: 'wewnętrzna' },
            },
          ],
        },
      ],
      ...overrides,
    } as unknown as Offer;
  }

  it('updates the price when the scraped amount differs', async () => {
    scraperClient.priceCheck.mockResolvedValue({
      available: true,
      cabinPrices: [{ label: 'wewnętrzna', price: 650 }],
    });

    await service.syncOffer(buildOffer());

    expect(offerTermPriceRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'price-1', price: 65000 }),
    );
    expect(logService.createLog).toHaveBeenCalled();
  });

  it('does not touch the price when it is unchanged', async () => {
    scraperClient.priceCheck.mockResolvedValue({
      available: true,
      cabinPrices: [{ label: 'wewnętrzna', price: 614.43 }],
    });

    await service.syncOffer(buildOffer());

    expect(offerTermPriceRepository.save).not.toHaveBeenCalled();
  });

  it('removes a price row whose cabin type disappeared from the term page', async () => {
    scraperClient.priceCheck.mockResolvedValue({
      available: true,
      cabinPrices: [],
    });

    await service.syncOffer(buildOffer());

    expect(offerTermPriceRepository.delete).toHaveBeenCalledWith('price-1');
    expect(logService.createLog).toHaveBeenCalled();
  });

  it('logs a warning and leaves data untouched when a term page is gone', async () => {
    scraperClient.priceCheck.mockImplementation((url: string) => {
      if (url === 'https://rejsy4you.pl/rejs/1-term-gone') {
        return Promise.reject(new Error('502'));
      }
      return Promise.resolve({ available: true, cabinPrices: [] });
    });

    const offer = buildOffer();
    offer.terms[0].sourceUrl = 'https://rejsy4you.pl/rejs/1-term-gone';

    await service.syncOffer(offer);

    expect(offerTermPriceRepository.save).not.toHaveBeenCalled();
    expect(offerTermPriceRepository.delete).not.toHaveBeenCalled();
    expect(offerService.deactivateOffer).not.toHaveBeenCalled();
    expect(logService.createLog).toHaveBeenCalled();
  });

  it('deactivates the offer when the primary offerUrl is gone', async () => {
    scraperClient.priceCheck.mockImplementation((url: string) => {
      if (url === 'https://rejsy4you.pl/rejs/main-gone') {
        return Promise.reject(new Error('502'));
      }
      return Promise.resolve({ available: true, cabinPrices: [] });
    });

    await service.syncOffer(
      buildOffer({ offerUrl: 'https://rejsy4you.pl/rejs/main-gone' }),
    );

    expect(offerService.deactivateOffer).toHaveBeenCalledWith('offer-1', {
      email: 'system@udanyrejs.pl',
    });
    expect(logService.createLog).toHaveBeenCalledWith(
      expect.any(String),
      'SYSTEM',
    );
  });
});
