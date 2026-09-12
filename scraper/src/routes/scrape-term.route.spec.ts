import express from 'express';
import request from 'supertest';
import { createScrapeTermRoute } from './scrape-term.route';
import { ScraperConfig } from '../config';
import { BrowserQueue } from '../scraping/browser-queue';
import * as extractor from '../scraping/rejsy4you-extractor';

jest.mock('../scraping/rejsy4you-extractor');

const config: ScraperConfig = {
  port: 5010,
  internalToken: 'secret',
  allowedScrapeHosts: ['rejsy4you.pl'],
  maxTermsPerScrap: 100,
  minDelayMs: 0,
  maxDelayMs: 0,
  maxDiscoveryPagesPerHost: 5,
  listingRenderTimeoutMs: 0,
};

function buildApp(queue: BrowserQueue) {
  const app = express();
  app.use(express.json());
  app.use(createScrapeTermRoute(config, queue));
  return app;
}

describe('POST /scrape-term', () => {
  let queue: BrowserQueue;

  beforeEach(() => {
    jest.clearAllMocks();
    const fakePage = {
      goto: jest.fn().mockResolvedValue({ status: () => 200 }),
    };
    queue = {
      enqueue: jest.fn((task) => task(fakePage as never)),
    } as unknown as BrowserQueue;
    (extractor.dismissCookieBanner as jest.Mock).mockResolvedValue(undefined);
  });

  it('rejects a URL outside the allowlist', async () => {
    const response = await request(buildApp(queue))
      .post('/scrape-term')
      .send({ url: 'https://evil.example.com/x' });

    expect(response.status).toBe(400);
    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('scrapes only the requested page - its own dates, cabin prices, PDF and sibling links', async () => {
    (extractor.extractRawOfferPage as jest.Mock).mockResolvedValueOnce({
      titleText: 'Rejs testowy',
      shipNameText: 'Testowiec',
      companyHrefSlug: 'test-cruise-line',
      ogImageContent: 'https://rejsy4you.pl/img.jpg',
      pdfHref: 'https://rejsy4you.pl/pdf-1',
      itineraryRows: [
        {
          dayText: '1',
          dateText: '01.01.2027',
          cityText: 'Gdynia',
          arrivalText: '',
          departureText: '10:00',
        },
        {
          dayText: '8',
          dateText: '08.01.2027',
          cityText: 'Gdynia',
          arrivalText: '08:00',
          departureText: '',
        },
      ],
      cabinGroupRows: [{ labelText: '▸ wewnętrzna', minPriceText: 'od €120' }],
      otherTermLinks: [
        {
          href: 'https://rejsy4you.pl/rejs/2_x_2',
          startDateText: '2027-02-01',
          endDateText: '2027-02-08',
          isDifferentRoute: false,
        },
        {
          href: 'https://rejsy4you.pl/rejs/other-route',
          startDateText: '2027-03-01',
          endDateText: '2027-03-08',
          isDifferentRoute: true,
        },
      ],
    });

    const response = await request(buildApp(queue))
      .post('/scrape-term')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      startDate: '2027-01-01',
      endDate: '2027-01-08',
      cabinPrices: [{ label: 'wewnętrzna', price: 120 }],
      pdfUrl: 'https://rejsy4you.pl/pdf-1',
      siblingLinks: [
        {
          sourceUrl: 'https://rejsy4you.pl/rejs/2_x_2',
          startDate: '2027-02-01',
          endDate: '2027-02-08',
        },
      ],
    });
    expect(queue.enqueue).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when the page confirms the offer is gone (HTTP 404/410)', async () => {
    const fakePage = {
      goto: jest.fn().mockResolvedValue({ status: () => 404 }),
    };
    queue = {
      enqueue: jest.fn((task) => task(fakePage as never)),
    } as unknown as BrowserQueue;

    const response = await request(buildApp(queue))
      .post('/scrape-term')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(404);
    expect(extractor.extractRawOfferPage).not.toHaveBeenCalled();
  });

  it('does not treat a generic scraping failure as a confirmed 404', async () => {
    (extractor.extractRawOfferPage as jest.Mock).mockRejectedValueOnce(
      new Error('selector timeout'),
    );

    const response = await request(buildApp(queue))
      .post('/scrape-term')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(502);
  });
});
