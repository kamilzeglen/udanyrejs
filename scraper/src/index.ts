import express, { Express } from 'express';
import { loadConfig, ScraperConfig } from './config';
import { createHealthRoute } from './routes/health.route';
import { createInternalAuthMiddleware } from './middleware/internal-auth.middleware';
import { BrowserQueue } from './scraping/browser-queue';
import { createFullScrapRoute } from './routes/full-scrap.route';
import { createPriceCheckRoute } from './routes/price-check.route';
import { createDiscoverOffersRoute } from './routes/discover-offers.route';

export function createApp(config: ScraperConfig, queue: BrowserQueue): Express {
  const app = express();
  app.use(express.json());
  app.use(createHealthRoute());
  app.use(createInternalAuthMiddleware(config));
  app.use(createFullScrapRoute(config, queue));
  app.use(createPriceCheckRoute(config, queue));
  app.use(createDiscoverOffersRoute(config, queue));
  return app;
}

if (require.main === module) {
  require('dotenv').config();
  const config = loadConfig();
  const queue = new BrowserQueue(config);
  const app = createApp(config, queue);

  app.listen(config.port, () => {
    console.log(`[scraper] listening on port ${config.port}`);
    console.log(`[scraper] allowed hosts: ${config.allowedScrapeHosts.join(', ')}`);
    console.log(`[scraper] max terms per scrap: ${config.maxTermsPerScrap}`);
    console.log(`[scraper] delay between requests: ${config.minDelayMs}-${config.maxDelayMs}ms`);
  });
}
