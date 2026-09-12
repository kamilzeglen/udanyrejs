import express from 'express';
import request from 'supertest';
import { createScrapeOfferRoute } from './scrape-offer.route';
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
  app.use(createScrapeOfferRoute(config, queue));
  return app;
}

describe('POST /scrape-offer', () => {
  let queue: BrowserQueue;

  beforeEach(() => {
    jest.clearAllMocks();
    const fakePage = { goto: jest.fn().mockResolvedValue(undefined) };
    queue = {
      enqueue: jest.fn((task) => task(fakePage as never)),
    } as unknown as BrowserQueue;
    (extractor.dismissCookieBanner as jest.Mock).mockResolvedValue(undefined);
  });

  it('rejects a URL outside the allowlist', async () => {
    const response = await request(buildApp(queue))
      .post('/scrape-offer')
      .send({ url: 'https://evil.example.com/x' });

    expect(response.status).toBe(400);
    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('scrapes the primary page and each same-route other term, including its own PDF', async () => {
    (extractor.extractRawOfferPage as jest.Mock)
      .mockResolvedValueOnce({
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
        ],
        cabinGroupRows: [
          { labelText: '▸ wewnętrzna', minPriceText: 'od €100' },
        ],
        otherTermLinks: [
          {
            href: 'https://rejsy4you.pl/rejs/2_x_2',
            startDateText: '2027-02-01',
            endDateText: '2027-02-08',
            isDifferentRoute: false,
          },
        ],
      })
      .mockResolvedValueOnce({
        titleText: 'Rejs testowy',
        shipNameText: 'Testowiec',
        companyHrefSlug: 'test-cruise-line',
        ogImageContent: 'https://rejsy4you.pl/img.jpg',
        pdfHref: 'https://rejsy4you.pl/pdf-2',
        itineraryRows: [],
        cabinGroupRows: [
          { labelText: '▸ wewnętrzna', minPriceText: 'od €120' },
        ],
        otherTermLinks: [],
      });

    const response = await request(buildApp(queue))
      .post('/scrape-offer')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Rejs testowy');
    expect(response.body.terms).toHaveLength(2);
    expect(response.body.terms[0].pdfUrl).toBe('https://rejsy4you.pl/pdf-1');
    expect(response.body.terms[1].sourceUrl).toBe(
      'https://rejsy4you.pl/rejs/2_x_2',
    );
    expect(response.body.terms[1].pdfUrl).toBe('https://rejsy4you.pl/pdf-2');
    expect(response.body.terms[1].cabinPrices).toEqual([
      { label: 'wewnętrzna', price: 120 },
    ]);
    expect(queue.enqueue).toHaveBeenCalledTimes(2);
  });

  it('returns 404 when the primary page confirms the offer is gone (HTTP 404/410)', async () => {
    const fakePage = {
      goto: jest.fn().mockResolvedValue({ status: () => 404 }),
    };
    queue = {
      enqueue: jest.fn((task) => task(fakePage as never)),
    } as unknown as BrowserQueue;

    const response = await request(buildApp(queue))
      .post('/scrape-offer')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(404);
    expect(extractor.extractRawOfferPage).not.toHaveBeenCalled();
  });

  it('does not treat a generic scraping failure on the primary page as a confirmed 404', async () => {
    (extractor.extractRawOfferPage as jest.Mock).mockRejectedValueOnce(
      new Error('selector timeout'),
    );

    const response = await request(buildApp(queue))
      .post('/scrape-offer')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(502);
  });

  it('skips a sibling term that comes back 404 instead of failing the whole scrap', async () => {
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
      ],
      cabinGroupRows: [{ labelText: '▸ wewnętrzna', minPriceText: 'od €100' }],
      otherTermLinks: [
        {
          href: 'https://rejsy4you.pl/rejs/2_x_2',
          startDateText: '2027-02-01',
          endDateText: '2027-02-08',
          isDifferentRoute: false,
        },
      ],
    });

    const fakePage = {
      goto: jest
        .fn()
        .mockResolvedValueOnce({ status: () => 200 })
        .mockResolvedValueOnce({ status: () => 404 }),
    };
    queue = {
      enqueue: jest.fn((task) => task(fakePage as never)),
    } as unknown as BrowserQueue;

    const response = await request(buildApp(queue))
      .post('/scrape-offer')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(200);
    expect(response.body.terms).toHaveLength(1);
    expect(response.body.name).toBe('Rejs testowy');
    expect(response.body.notFoundUrls).toEqual([
      'https://rejsy4you.pl/rejs/2_x_2',
    ]);
  });

  it('does not report a sibling in notFoundUrls when it fails for a reason other than a confirmed 404/410', async () => {
    (extractor.extractRawOfferPage as jest.Mock)
      .mockResolvedValueOnce({
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
        ],
        cabinGroupRows: [
          { labelText: '▸ wewnętrzna', minPriceText: 'od €100' },
        ],
        otherTermLinks: [
          {
            href: 'https://rejsy4you.pl/rejs/2_x_2',
            startDateText: '2027-02-01',
            endDateText: '2027-02-08',
            isDifferentRoute: false,
          },
        ],
      })
      .mockRejectedValueOnce(new Error('selector timeout'));

    const response = await request(buildApp(queue))
      .post('/scrape-offer')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(200);
    expect(response.body.terms).toHaveLength(1);
    expect(response.body.notFoundUrls).toEqual([]);
  });
});
