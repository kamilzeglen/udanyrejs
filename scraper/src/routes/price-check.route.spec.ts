import express from 'express';
import request from 'supertest';
import { createPriceCheckRoute } from './price-check.route';
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
};

function buildApp(queue: BrowserQueue) {
  const app = express();
  app.use(express.json());
  app.use(createPriceCheckRoute(config, queue));
  return app;
}

describe('POST /price-check', () => {
  let queue: BrowserQueue;

  beforeEach(() => {
    const fakePage = { goto: jest.fn().mockResolvedValue(undefined) };
    queue = { enqueue: jest.fn((task) => task(fakePage as never)) } as unknown as BrowserQueue;
  });

  it('rejects a URL outside the allowlist', async () => {
    const response = await request(buildApp(queue)).post('/price-check').send({ url: 'https://evil.example.com/x' });
    expect(response.status).toBe(400);
  });

  it('returns available with current cabin prices', async () => {
    (extractor.extractRawPriceCheckPage as jest.Mock).mockResolvedValue({
      pageFound: true,
      cabinGroupRows: [{ labelText: '▸ wewnętrzna', minPriceText: 'od €120' }],
    });

    const response = await request(buildApp(queue))
      .post('/price-check')
      .send({ url: 'https://rejsy4you.pl/rejs/1_x_1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ available: true, cabinPrices: [{ label: 'wewnętrzna', price: 120 }] });
  });

  it('returns unavailable when the page navigation fails', async () => {
    queue.enqueue = jest.fn().mockRejectedValue(new Error('net::ERR_ABORTED'));

    const response = await request(buildApp(queue))
      .post('/price-check')
      .send({ url: 'https://rejsy4you.pl/rejs/gone_x_1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ available: false, cabinPrices: [] });
  });
});
