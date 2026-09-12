import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OfferDiscoveryService } from './offer-discovery.service';
import { ScrapedOfferDraft } from './scraped-offer-draft.entity';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { ScraperClientService } from '@core/scraper-client/scraper-client.service';
import { CompanyService } from '@modules/company/company.service';
import { ShipService } from '@modules/ship/ship.service';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { ItineraryCityResolverService } from '@modules/offer/itinerary-city-resolver.service';

function buildQueryBuilderMock(result: unknown[]) {
  return {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(result),
    getOne: jest.fn().mockResolvedValue(result[0] ?? null),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(undefined),
  };
}

describe('OfferDiscoveryService', () => {
  let service: OfferDiscoveryService;
  let draftRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let offerRepository: { createQueryBuilder: jest.Mock };
  let offerTermRepository: { createQueryBuilder: jest.Mock };
  let scraperClientService: {
    discoverOffers: jest.Mock;
    scrapeOffer: jest.Mock;
  };
  let companyService: { findAll: jest.Mock };
  let shipService: { findShipsByCompany: jest.Mock };
  let cabinTypeService: { findAllByCompany: jest.Mock };
  let logService: { createLog: jest.Mock };
  let itineraryCityResolverService: { resolve: jest.Mock };

  beforeEach(async () => {
    draftRepository = {
      createQueryBuilder: jest.fn(() => buildQueryBuilderMock([])),
      create: jest.fn((data) => data),
      save: jest.fn((entity) => Promise.resolve({ id: 'draft-1', ...entity })),
    };
    offerRepository = {
      createQueryBuilder: jest.fn(() => buildQueryBuilderMock([])),
    };
    offerTermRepository = {
      createQueryBuilder: jest.fn(() => buildQueryBuilderMock([])),
    };
    scraperClientService = {
      discoverOffers: jest.fn(),
      scrapeOffer: jest.fn(),
    };
    companyService = { findAll: jest.fn().mockResolvedValue([]) };
    shipService = { findShipsByCompany: jest.fn().mockResolvedValue([]) };
    cabinTypeService = { findAllByCompany: jest.fn().mockResolvedValue([]) };
    logService = { createLog: jest.fn().mockResolvedValue(undefined) };
    itineraryCityResolverService = {
      resolve: jest.fn((itinerary) => Promise.resolve(itinerary)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferDiscoveryService,
        {
          provide: getRepositoryToken(ScrapedOfferDraft),
          useValue: draftRepository,
        },
        { provide: getRepositoryToken(Offer), useValue: offerRepository },
        {
          provide: getRepositoryToken(OfferTerm),
          useValue: offerTermRepository,
        },
        { provide: ScraperClientService, useValue: scraperClientService },
        { provide: CompanyService, useValue: companyService },
        { provide: ShipService, useValue: shipService },
        { provide: CabinTypeService, useValue: cabinTypeService },
        { provide: LogService, useValue: logService },
        {
          provide: ItineraryCityResolverService,
          useValue: itineraryCityResolverService,
        },
      ],
    }).compile();

    service = moduleRef.get(OfferDiscoveryService);
  });

  describe('runDiscovery', () => {
    it('logs unmatched shipowner names and skips scraping for them', async () => {
      scraperClientService.discoverOffers.mockResolvedValue({
        urls: [],
        unmatchedNames: ['Nieznany Armator'],
      });

      await service.runDiscovery(['Nieznany Armator'], 5, 'admin@udanyrejs.pl');

      expect(logService.createLog).toHaveBeenCalledWith(
        expect.stringContaining('Nieznany Armator'),
        'admin@udanyrejs.pl',
      );
      expect(scraperClientService.scrapeOffer).not.toHaveBeenCalled();
    });

    it('skips urls that already exist as a draft, an offer, or an offer term', async () => {
      scraperClientService.discoverOffers.mockResolvedValue({
        urls: [
          'https://rejsy4you.pl/rejs/1_x_1',
          'https://rejsy4you.pl/rejs/2_x_2',
        ],
        unmatchedNames: [],
      });
      draftRepository.createQueryBuilder.mockReturnValueOnce(
        buildQueryBuilderMock([
          { sourceUrl: 'https://rejsy4you.pl/rejs/1_x_1' },
        ]),
      );
      scraperClientService.scrapeOffer.mockResolvedValue({
        name: 'Rejs testowy',
        shipName: 'Unknown Ship',
        companyName: 'Unknown Company',
        imageUrl: '',
        itinerary: [],
        terms: [
          {
            startDate: '2027-01-01',
            endDate: '2027-01-08',
            sourceUrl: 'https://rejsy4you.pl/rejs/2_x_2',
            pdfUrl: null,
            cabinPrices: [],
          },
        ],
      });

      await service.runDiscovery(['MSC Cruises'], 5, 'admin@udanyrejs.pl');

      expect(scraperClientService.scrapeOffer).toHaveBeenCalledTimes(1);
      expect(scraperClientService.scrapeOffer).toHaveBeenCalledWith(
        'https://rejsy4you.pl/rejs/2_x_2',
      );
      expect(logService.createLog).toHaveBeenCalledWith(
        expect.stringContaining('https://rejsy4you.pl/rejs/1_x_1'),
        'admin@udanyrejs.pl',
      );
      expect(logService.createLog).toHaveBeenCalledWith(
        expect.stringContaining('już czeka w poczekalni jako inny draft'),
        'admin@udanyrejs.pl',
      );
    });

    it('creates a draft with matched company, ship and cabin type ids', async () => {
      scraperClientService.discoverOffers.mockResolvedValue({
        urls: ['https://rejsy4you.pl/rejs/1_x_1'],
        unmatchedNames: [],
      });
      scraperClientService.scrapeOffer.mockResolvedValue({
        name: 'Rejs testowy',
        shipName: 'MSC Meraviglia',
        companyName: 'MSC Cruises',
        imageUrl: 'https://rejsy4you.pl/img.jpg',
        itinerary: [
          {
            day: 1,
            date: '2027-01-01',
            city: 'Gdynia',
            arrivalTime: '',
            departureTime: '10:00',
          },
        ],
        terms: [
          {
            startDate: '2027-01-01',
            endDate: '2027-01-08',
            sourceUrl: 'https://rejsy4you.pl/rejs/1_x_1',
            pdfUrl: 'https://rejsy4you.pl/pdf-1',
            cabinPrices: [{ label: 'wewnętrzna', price: 100 }],
          },
        ],
      });
      companyService.findAll.mockResolvedValue([
        { id: 'company-1', name: 'MSC Cruises' },
      ]);
      shipService.findShipsByCompany.mockResolvedValue([
        { id: 'ship-1', name: 'MSC Meraviglia' },
      ]);
      cabinTypeService.findAllByCompany.mockResolvedValue([
        { id: 'cabin-1', name: 'wewnętrzna' },
      ]);

      await service.runDiscovery(['MSC Cruises'], 5, 'admin@udanyrejs.pl');

      expect(draftRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Rejs testowy',
          matchedCompanyId: 'company-1',
          matchedShipId: 'ship-1',
          sourceUrl: 'https://rejsy4you.pl/rejs/1_x_1',
          terms: [
            expect.objectContaining({
              pdfUrl: 'https://rejsy4you.pl/pdf-1',
              cabinPrices: [
                {
                  label: 'wewnętrzna',
                  price: 100,
                  matchedCabinTypeId: 'cabin-1',
                },
              ],
            }),
          ],
        }),
      );
    });

    it('logs and continues when scrapeOffer fails for one url', async () => {
      scraperClientService.discoverOffers.mockResolvedValue({
        urls: [
          'https://rejsy4you.pl/rejs/1_x_1',
          'https://rejsy4you.pl/rejs/2_x_2',
        ],
        unmatchedNames: [],
      });
      scraperClientService.scrapeOffer
        .mockRejectedValueOnce(new Error('502 Bad Gateway'))
        .mockResolvedValueOnce({
          name: 'Rejs testowy',
          shipName: 'Unknown Ship',
          companyName: 'Unknown Company',
          imageUrl: '',
          itinerary: [],
          terms: [
            {
              startDate: '2027-01-01',
              endDate: '2027-01-08',
              sourceUrl: 'https://rejsy4you.pl/rejs/2_x_2',
              pdfUrl: null,
              cabinPrices: [],
            },
          ],
        });

      await service.runDiscovery(['MSC Cruises'], 5, 'admin@udanyrejs.pl');

      expect(logService.createLog).toHaveBeenCalledWith(
        expect.stringContaining('502 Bad Gateway'),
        'admin@udanyrejs.pl',
      );
      expect(draftRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDraftById', () => {
    it('throws when the draft does not exist', async () => {
      draftRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilderMock([]),
      );

      await expect(service.getDraftById('missing-id')).rejects.toThrow(
        AppException,
      );
    });
  });

  describe('deleteDraft', () => {
    it('deletes an existing draft and writes an audit log entry', async () => {
      draftRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilderMock([{ id: 'draft-1', name: 'Rejs testowy' }]),
      );

      const result = await service.deleteDraft('draft-1', 'admin@udanyrejs.pl');

      expect(result).toBe(true);
      expect(logService.createLog).toHaveBeenCalledWith(
        expect.stringContaining('Rejs testowy'),
        'admin@udanyrejs.pl',
      );
    });
  });
});
