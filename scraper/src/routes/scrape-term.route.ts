import { Router } from 'express';
import { ScraperConfig } from '../config';
import { BrowserQueue } from '../scraping/browser-queue';
import { isAllowedScrapeUrl } from '../scraping/allowlist';
import {
  dismissCookieBanner,
  extractRawOfferPage,
} from '../scraping/rejsy4you-extractor';
import { mapRawToScrapedTerm } from '../scraping/parse-offer-page';
import { PageNotFoundError } from '../scraping/page-not-found.error';

function isConfirmedGoneStatus(status: number): boolean {
  return status === 404 || status === 410;
}

export function createScrapeTermRoute(
  config: ScraperConfig,
  queue: BrowserQueue,
): Router {
  const router = Router();

  router.post('/scrape-term', async (req, res) => {
    const url = req.body?.url;
    const urlIsAllowed =
      typeof url === 'string' &&
      isAllowedScrapeUrl(url, config.allowedScrapeHosts);

    console.log(`[scraper] POST /scrape-term: ${url}`);

    if (!urlIsAllowed) {
      console.warn(
        `[scraper] rejected /scrape-term: URL not on the allowlist - ${url}`,
      );
      res
        .status(400)
        .json({ message: 'URL is missing or not on the allowlist' });
      return;
    }

    try {
      const raw = await queue.enqueue(async (page) => {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
        });
        if (response && isConfirmedGoneStatus(response.status())) {
          throw new PageNotFoundError(url);
        }
        await dismissCookieBanner(page);
        return extractRawOfferPage(page);
      }, `scrape-term (${url})`);

      const result = mapRawToScrapedTerm(raw);
      console.log(
        `[scraper] /scrape-term completed for ${url}: ${result.cabinPrices.length} cabin(s), ${result.siblingLinks.length} sibling link(s)`,
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        console.warn(
          `[scraper] /scrape-term: strona potwierdzona jako nieistniejąca (404/410) - ${url}`,
        );
        res.status(404).json({ message: error.message });
        return;
      }

      console.error(
        `[scraper] /scrape-term failed for ${url}: ${(error as Error).message}`,
      );
      res
        .status(502)
        .json({ message: `Scraping failed: ${(error as Error).message}` });
    }
  });

  return router;
}
