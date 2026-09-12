import express from 'express';
import request from 'supertest';
import { createFullScrapRoute } from './full-scrap.route';
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
  app.use(createFullScrapRoute(config, queue));
  return app;
}

describe('POST /full-scrap', () => {
  let queue: BrowserQueue;

  beforeEach(() => {
    const fakePage = { goto: jest.fn().mockResolvedValue(undefined) };
    queue = {
      enqueue: jest.fn((task) => task(fakePage as never)),
    } as unknown as BrowserQueue;
    (extractor.dismissCookieBanner as jest.Mock).mockResolvedValue(undefined);
  });

  it('rejects a URL outside the allowlist', async () => {
    const response = await request(buildApp(queue))
      .post('/full-scrap')
      .send({ url: 'https://evil.example.com/x' });

    expect(response.status).toBe(400);
    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('scrapes the primary page and each same-route other term', async () => {
    (extractor.extractRawOfferPage as jest.Mock).mockResolvedValue({
      titleText: 'Rejs testowy',
      shipNameText: 'Testowiec',
      companyHrefSlug: 'test-cruise-line',
      ogImageContent: 'https://rejsy4you.pl/img.jpg',
      pdfHref: 'https://rejsy4you.pl/pdf',
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
    (extractor.extractRawPriceCheckPage as jest.Mock).mockResolvedValue({
      pageFound: true,
      cabinGroupRows: [{ labelText: '▸ wewnętrzna', minPriceText: 'od €120' }],
    });

    const response = await request(buildApp(queue))
      .post('/full-scrap')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Rejs testowy');
    expect(response.body.terms).toHaveLength(2);
    expect(response.body.terms[1].sourceUrl).toBe(
      'https://rejsy4you.pl/rejs/2_x_2',
    );
    expect(response.body.terms[1].cabinPrices).toEqual([
      { label: 'wewnętrzna', price: 120 },
    ]);
    expect(queue.enqueue).toHaveBeenCalledTimes(2);
  });
});
