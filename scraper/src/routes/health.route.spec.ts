import request from 'supertest';
import { createApp } from '../index';
import { ScraperConfig } from '../config';
import { BrowserQueue } from '../scraping/browser-queue';

const config: ScraperConfig = {
  port: 5010,
  internalToken: 'secret',
  allowedScrapeHosts: ['rejsy4you.pl'],
  maxTermsPerScrap: 100,
  minDelayMs: 0,
  maxDelayMs: 0,
};

describe('GET /health', () => {
  it('returns 200 with status ok, without needing the internal token', async () => {
    const queue = { enqueue: jest.fn() } as unknown as BrowserQueue;
    const app = createApp(config, queue);
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
