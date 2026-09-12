import { Router } from 'express';
import { ScraperConfig } from '../config';
import { BrowserQueue } from '../scraping/browser-queue';
import { isAllowedScrapeUrl } from '../scraping/allowlist';
import { extractRawPriceCheckPage } from '../scraping/rejsy4you-extractor';
import { mapRawToPriceCheck } from '../scraping/parse-offer-page';

export function createPriceCheckRoute(
  config: ScraperConfig,
  queue: BrowserQueue,
): Router {
  const router = Router();

  router.post('/price-check', async (req, res) => {
    const url = req.body?.url;
    const urlIsAllowed =
      typeof url === 'string' &&
      isAllowedScrapeUrl(url, config.allowedScrapeHosts);

    console.log(`[scraper] POST /price-check: ${url}`);

    if (!urlIsAllowed) {
      console.warn(
        `[scraper] rejected /price-check: URL not on the allowlist - ${url}`,
      );
      res
        .status(400)
        .json({ message: 'URL is missing or not on the allowlist' });
      return;
    }

    try {
      const raw = await queue.enqueue(async (page) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        return extractRawPriceCheckPage(page);
      }, `price-check (${url})`);

      const result = mapRawToPriceCheck(raw);
      console.log(
        `[scraper] /price-check result for ${url}: available=${result.available}, cabins=${result.cabinPrices.length}`,
      );
      res.status(200).json(result);
    } catch (error) {
      console.warn(
        `[scraper] /price-check treating as unavailable for ${url}: ${(error as Error).message}`,
      );
      res.status(200).json({ available: false, cabinPrices: [] });
    }
  });

  return router;
}
