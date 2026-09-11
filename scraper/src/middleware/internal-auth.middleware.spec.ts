import express from 'express';
import request from 'supertest';
import { createInternalAuthMiddleware } from './internal-auth.middleware';
import { ScraperConfig } from '../config';

function buildApp(config: ScraperConfig) {
  const app = express();
  app.use(createInternalAuthMiddleware(config));
  app.get('/protected', (_req, res) => res.status(200).json({ ok: true }));
  return app;
}

const config: ScraperConfig = {
  port: 5010,
  internalToken: 'secret-token',
  allowedScrapeHosts: ['rejsy4you.pl'],
  maxTermsPerScrap: 100,
  minDelayMs: 0,
  maxDelayMs: 0,
  maxDiscoveryPagesPerHost: 5,
};

describe('internalAuthMiddleware', () => {
  it('rejects requests without the header', async () => {
    const response = await request(buildApp(config)).get('/protected');
    expect(response.status).toBe(401);
  });

  it('rejects requests with the wrong token', async () => {
    const response = await request(buildApp(config))
      .get('/protected')
      .set('X-Internal-Token', 'wrong-token');
    expect(response.status).toBe(401);
  });

  it('allows requests with the correct token', async () => {
    const response = await request(buildApp(config))
      .get('/protected')
      .set('X-Internal-Token', 'secret-token');
    expect(response.status).toBe(200);
  });
});
