import express from 'express';
import request from 'supertest';
import { createDiscoverOffersRoute } from './discover-offers.route';
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
};

function buildApp(queue: BrowserQueue) {
  const app = express();
  app.use(express.json());
  app.use(createDiscoverOffersRoute(config, queue));
  return app;
}

describe('POST /discover-offers', () => {
  let queue: BrowserQueue;

  beforeEach(() => {
    const fakePage = { goto: jest.fn().mockResolvedValue(undefined) };
    queue = { enqueue: jest.fn((task) => task(fakePage as never)) } as unknown as BrowserQueue;
  });

  it('rejects an invalid body', async () => {
    const response = await request(buildApp(queue)).post('/discover-offers').send({ count: 'not-a-number' });

    expect(response.status).toBe(400);
    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('reports unmatched shipowner names without scraping for them', async () => {
    const response = await request(buildApp(queue))
      .post('/discover-offers')
      .send({ shipownerNames: ['Nieznany Armator'], count: 5 });

    expect(response.status).toBe(200);
    expect(response.body.unmatchedNames).toEqual(['Nieznany Armator']);
    expect(response.body.urls).toEqual([]);
    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('collects offer urls across pages until count is reached', async () => {
    (extractor.extractRawListingPage as jest.Mock)
      .mockResolvedValueOnce({ offerHrefs: ['https://rejsy4you.pl/rejs/1_x_1', 'https://rejsy4you.pl/rejs/2_x_2'] })
      .mockResolvedValueOnce({ offerHrefs: ['https://rejsy4you.pl/rejs/3_x_3'] });

    const response = await request(buildApp(queue))
      .post('/discover-offers')
      .send({ shipownerNames: ['MSC Cruises'], count: 3 });

    expect(response.status).toBe(200);
    expect(response.body.urls).toEqual([
      'https://rejsy4you.pl/rejs/1_x_1',
      'https://rejsy4you.pl/rejs/2_x_2',
      'https://rejsy4you.pl/rejs/3_x_3',
    ]);
    expect(response.body.unmatchedNames).toEqual([]);
    expect(queue.enqueue).toHaveBeenCalledTimes(2);
  });

  it('stops paging a shipowner once its listing page returns no offers', async () => {
    (extractor.extractRawListingPage as jest.Mock)
      .mockResolvedValueOnce({ offerHrefs: ['https://rejsy4you.pl/rejs/1_x_1'] })
      .mockResolvedValueOnce({ offerHrefs: [] });

    const response = await request(buildApp(queue))
      .post('/discover-offers')
      .send({ shipownerNames: ['MSC Cruises'], count: 10 });

    expect(response.body.urls).toEqual(['https://rejsy4you.pl/rejs/1_x_1']);
    expect(queue.enqueue).toHaveBeenCalledTimes(2);
  });
});
