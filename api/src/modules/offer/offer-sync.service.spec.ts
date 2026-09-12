import { Test } from '@nestjs/testing';
import {
  ScrapedPageNotFoundError,
  ScraperClientService,
} from '@core/scraper-client/scraper-client.service';
import { OfferSyncService } from './offer-sync.service';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { LogService } from '@modules/log/log.service';
import { OfferService } from './offer.service';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';

describe('OfferSyncService.syncOffer', () => {
  let service: OfferSyncService;
  let scraperClient: { scrapeTerm: jest.Mock };
  let offerService: {
    setTermActive: jest.Mock;
    updateTermDates: jest.Mock;
    updateTermPrices: jest.Mock;
    createDiscoveredTerm: jest.Mock;
    recalculateOfferActiveState: jest.Mock;
  };
  let cabinTypeService: { findAllByCompany: jest.Mock };
  let pdfFileService: {
    downloadPdfFromUrl: jest.Mock;
    updatePdfFile: jest.Mock;
  };
  let logService: { createLog: jest.Mock };

  const FAR_FUTURE_END = '2099-01-08';
  const FAR_PAST_END = '2000-01-08';

  beforeEach(async () => {
    scraperClient = { scrapeTerm: jest.fn() };
    offerService = {
      setTermActive: jest.fn().mockResolvedValue(undefined),
      updateTermDates: jest.fn().mockResolvedValue(undefined),
      updateTermPrices: jest.fn().mockResolvedValue(undefined),
      createDiscoveredTerm: jest.fn(),
      recalculateOfferActiveState: jest.fn().mockResolvedValue(true),
    };
    cabinTypeService = { findAllByCompany: jest.fn().mockResolvedValue([]) };
    pdfFileService = {
      downloadPdfFromUrl: jest.fn(),
      updatePdfFile: jest.fn(),
    };
    logService = { createLog: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferSyncService,
        { provide: ScraperClientService, useValue: scraperClient },
        { provide: OfferService, useValue: offerService },
        { provide: CabinTypeService, useValue: cabinTypeService },
        { provide: PdfFileService, useValue: pdfFileService },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    service = moduleRef.get(OfferSyncService);
  });

  function buildTerm(overrides: Record<string, unknown> = {}): OfferTerm {
    return {
      id: 'term-1',
      startDate: '2099-01-01',
      endDate: FAR_FUTURE_END,
      sourceUrl: 'https://rejsy4you.pl/rejs/1',
      isActive: true,
      prices: [],
      ...overrides,
    } as unknown as OfferTerm;
  }

  function buildOffer(overrides: Partial<Offer> = {}): Offer {
    return {
      id: 'offer-1',
      name: 'Rejs testowy',
      companyId: 'company-1',
      shipId: 'ship-1',
      terms: [buildTerm()],
      ...overrides,
    } as unknown as Offer;
  }

  function scrapedTerm(overrides: Record<string, unknown> = {}) {
    return {
      startDate: '2099-01-01',
      endDate: FAR_FUTURE_END,
      cabinPrices: [],
      pdfUrl: null,
      siblingLinks: [],
      ...overrides,
    };
  }

  const term2 = () =>
    buildTerm({
      id: 'term-2',
      startDate: '2099-02-01',
      endDate: '2099-02-08',
      sourceUrl: 'https://rejsy4you.pl/rejs/2',
    });

  it('refreshes every known active term with its OWN lightweight scrapeTerm call', async () => {
    scraperClient.scrapeTerm.mockImplementation((url: string) =>
      Promise.resolve(
        url === 'https://rejsy4you.pl/rejs/1'
          ? scrapedTerm()
          : scrapedTerm({ startDate: '2099-02-01', endDate: '2099-02-08' }),
      ),
    );

    await service.syncOffer(buildOffer({ terms: [buildTerm(), term2()] }));

    expect(scraperClient.scrapeTerm).toHaveBeenCalledTimes(2);
    expect(scraperClient.scrapeTerm).toHaveBeenCalledWith(
      'https://rejsy4you.pl/rejs/1',
    );
    expect(scraperClient.scrapeTerm).toHaveBeenCalledWith(
      'https://rejsy4you.pl/rejs/2',
    );
  });

  it('does not touch prices in the database when the scraped price is unchanged', async () => {
    cabinTypeService.findAllByCompany.mockResolvedValue([
      { id: 'cabin-1', name: 'wewnętrzna' },
    ]);
    scraperClient.scrapeTerm.mockResolvedValue(
      scrapedTerm({ cabinPrices: [{ label: 'wewnętrzna', price: 100 }] }),
    );

    await service.syncOffer(
      buildOffer({
        terms: [
          buildTerm({ prices: [{ cabinTypeId: 'cabin-1', price: 10000 }] }),
        ],
      }),
    );

    expect(offerService.updateTermPrices).not.toHaveBeenCalled();
  });

  it('updates prices when the scraped price differs from what is stored', async () => {
    cabinTypeService.findAllByCompany.mockResolvedValue([
      { id: 'cabin-1', name: 'wewnętrzna' },
    ]);
    scraperClient.scrapeTerm.mockResolvedValue(
      scrapedTerm({ cabinPrices: [{ label: 'wewnętrzna', price: 120 }] }),
    );

    await service.syncOffer(
      buildOffer({
        terms: [
          buildTerm({ prices: [{ cabinTypeId: 'cabin-1', price: 10000 }] }),
        ],
      }),
    );

    expect(offerService.updateTermPrices).toHaveBeenCalledWith(
      'term-1',
      'company-1',
      [{ cabinTypeId: 'cabin-1', price: 12000 }],
    );
  });

  it('updates the term dates when the source page reports a different date range', async () => {
    scraperClient.scrapeTerm.mockResolvedValue(
      scrapedTerm({ startDate: '2099-01-02', endDate: '2099-01-09' }),
    );

    await service.syncOffer(buildOffer());

    expect(offerService.updateTermDates).toHaveBeenCalledWith(
      'term-1',
      '2099-01-02',
      '2099-01-09',
    );
  });

  it('does not touch the dates when they match (even as a Date vs a bare date string)', async () => {
    scraperClient.scrapeTerm.mockResolvedValue(scrapedTerm());

    await service.syncOffer(
      buildOffer({
        terms: [
          buildTerm({
            startDate: new Date(2099, 0, 1),
            endDate: new Date(2099, 0, 8),
          }),
        ],
      }),
    );

    expect(offerService.updateTermDates).not.toHaveBeenCalled();
  });

  it('does not redownload the PDF when its URL is unchanged from what is stored', async () => {
    scraperClient.scrapeTerm.mockResolvedValue(
      scrapedTerm({ pdfUrl: 'https://rejsy4you.pl/pdf-1' }),
    );

    const result = await service.syncOffer(
      buildOffer({
        terms: [
          buildTerm({
            pdfFile: { url: 'https://rejsy4you.pl/pdf-1' },
          }),
        ],
      }),
    );

    expect(pdfFileService.downloadPdfFromUrl).not.toHaveBeenCalled();
    expect(result.pdfsUpdated).toBe(0);
  });

  it('redownloads the PDF when its URL changed from what is stored', async () => {
    scraperClient.scrapeTerm.mockResolvedValue(
      scrapedTerm({ pdfUrl: 'https://rejsy4you.pl/pdf-2' }),
    );
    pdfFileService.downloadPdfFromUrl.mockResolvedValue({
      buffer: Buffer.from('x'),
    });

    const result = await service.syncOffer(
      buildOffer({
        terms: [
          buildTerm({
            pdfFile: { url: 'https://rejsy4you.pl/pdf-1' },
          }),
        ],
      }),
    );

    expect(pdfFileService.updatePdfFile).toHaveBeenCalledWith(
      'term-1',
      'term',
      { buffer: Buffer.from('x') },
      'SYSTEM',
      'https://rejsy4you.pl/pdf-2',
    );
    expect(result.pdfsUpdated).toBe(1);
  });

  it('discovers a new term found as a sibling link on a known term page, scraping only that one page', async () => {
    scraperClient.scrapeTerm.mockImplementation((url: string) => {
      if (url === 'https://rejsy4you.pl/rejs/1') {
        return Promise.resolve(
          scrapedTerm({
            siblingLinks: [
              {
                sourceUrl: 'https://rejsy4you.pl/rejs/2',
                startDate: '2099-02-01',
                endDate: '2099-02-08',
              },
            ],
          }),
        );
      }
      return Promise.resolve(
        scrapedTerm({ startDate: '2099-02-01', endDate: '2099-02-08' }),
      );
    });
    offerService.createDiscoveredTerm.mockResolvedValue({
      id: 'term-new',
      startDate: '2099-02-01',
      endDate: '2099-02-08',
    });

    const result = await service.syncOffer(buildOffer());

    expect(scraperClient.scrapeTerm).toHaveBeenCalledTimes(2);
    expect(offerService.createDiscoveredTerm).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'offer-1' }),
      {
        startDate: '2099-02-01',
        endDate: '2099-02-08',
        sourceUrl: 'https://rejsy4you.pl/rejs/2',
        prices: [],
      },
    );
    expect(result.termsAdded).toBe(1);
  });

  it('does not try to recreate a sibling link that already matches an existing term', async () => {
    scraperClient.scrapeTerm.mockImplementation((url: string) => {
      if (url === 'https://rejsy4you.pl/rejs/1') {
        return Promise.resolve(
          scrapedTerm({
            siblingLinks: [
              {
                sourceUrl: 'https://rejsy4you.pl/rejs/2',
                startDate: '2099-02-01',
                endDate: '2099-02-08',
              },
            ],
          }),
        );
      }
      return Promise.resolve(scrapedTerm());
    });

    const existingSibling = buildTerm({
      id: 'term-2',
      startDate: '2099-02-01',
      endDate: '2099-02-08',
      sourceUrl: 'https://rejsy4you.pl/rejs/2',
      isActive: false,
    });

    const result = await service.syncOffer(
      buildOffer({ terms: [buildTerm(), existingSibling] }),
    );

    expect(offerService.createDiscoveredTerm).not.toHaveBeenCalled();
    expect(result.termsAdded).toBe(0);
    // term-2 jest nieaktywny i pominięty w fazie 1 (termsToSync filtruje
    // isActive) - odkrycie go jako sibling w fazie 2 nie ma go przywracać.
    expect(offerService.setTermActive).not.toHaveBeenCalledWith('term-2', true);
  });

  it('deactivates a term whose page confirms 404/410', async () => {
    scraperClient.scrapeTerm.mockRejectedValue(
      new ScrapedPageNotFoundError('https://rejsy4you.pl/rejs/1'),
    );

    const result = await service.syncOffer(buildOffer());

    expect(offerService.setTermActive).toHaveBeenCalledWith('term-1', false);
    expect(result.termsDeactivated).toBe(1);
  });

  it('does not deactivate a term on a transient scraper failure, and retries it next time instead', async () => {
    scraperClient.scrapeTerm.mockRejectedValue(new Error('net::ERR_ABORTED'));

    const result = await service.syncOffer(buildOffer());

    expect(offerService.setTermActive).not.toHaveBeenCalled();
    expect(result.termsSkipped).toBe(1);
  });

  it('does not scrape or touch a term that is already inactive', async () => {
    await service.syncOffer(
      buildOffer({ terms: [buildTerm({ isActive: false })] }),
    );

    expect(scraperClient.scrapeTerm).not.toHaveBeenCalled();
  });

  it('skips terms without a source URL and terms already inactive, without calling the scraper', async () => {
    const result = await service.syncOffer(
      buildOffer({
        terms: [
          buildTerm({ id: 'term-no-url', sourceUrl: null }),
          buildTerm({ id: 'term-inactive', isActive: false }),
        ],
      }),
    );

    expect(scraperClient.scrapeTerm).not.toHaveBeenCalled();
    expect(result).toEqual({
      offerDeactivated: false,
      termsAdded: 0,
      termsDeactivated: 0,
      termsSkipped: 0,
      pdfsUpdated: 0,
    });
  });

  it('silently ignores a newly discovered sibling link that turns out to be 404 by the time it is visited', async () => {
    scraperClient.scrapeTerm.mockImplementation((url: string) => {
      if (url === 'https://rejsy4you.pl/rejs/1') {
        return Promise.resolve(
          scrapedTerm({
            siblingLinks: [
              {
                sourceUrl: 'https://rejsy4you.pl/rejs/2',
                startDate: '2099-02-01',
                endDate: '2099-02-08',
              },
            ],
          }),
        );
      }
      return Promise.reject(
        new ScrapedPageNotFoundError('https://rejsy4you.pl/rejs/2'),
      );
    });

    const result = await service.syncOffer(buildOffer());

    expect(offerService.createDiscoveredTerm).not.toHaveBeenCalled();
    expect(result.termsAdded).toBe(0);
    expect(result.termsSkipped).toBe(0);
  });

  it('counts a newly discovered sibling link as skipped when it fails for a transient reason', async () => {
    scraperClient.scrapeTerm.mockImplementation((url: string) => {
      if (url === 'https://rejsy4you.pl/rejs/1') {
        return Promise.resolve(
          scrapedTerm({
            siblingLinks: [
              {
                sourceUrl: 'https://rejsy4you.pl/rejs/2',
                startDate: '2099-02-01',
                endDate: '2099-02-08',
              },
            ],
          }),
        );
      }
      return Promise.reject(new Error('timeout'));
    });

    const result = await service.syncOffer(buildOffer());

    expect(offerService.createDiscoveredTerm).not.toHaveBeenCalled();
    expect(result.termsSkipped).toBe(1);
  });

  it('deactivates a term whose end date has already passed, using the same source-confirmed 404 rule', async () => {
    scraperClient.scrapeTerm.mockRejectedValue(
      new ScrapedPageNotFoundError('https://rejsy4you.pl/rejs/1'),
    );

    const result = await service.syncOffer(
      buildOffer({
        terms: [buildTerm({ startDate: '2000-01-01', endDate: FAR_PAST_END })],
      }),
    );

    expect(offerService.setTermActive).toHaveBeenCalledWith('term-1', false);
    expect(result.termsDeactivated).toBe(1);
  });

  it('reports the offer as deactivated once none of its terms remain active', async () => {
    scraperClient.scrapeTerm.mockRejectedValue(
      new ScrapedPageNotFoundError('https://rejsy4you.pl/rejs/1'),
    );
    offerService.recalculateOfferActiveState.mockResolvedValue(false);

    const result = await service.syncOffer(buildOffer());

    expect(result.offerDeactivated).toBe(true);
  });
});
