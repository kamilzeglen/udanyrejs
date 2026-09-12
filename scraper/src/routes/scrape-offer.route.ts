import { Router } from 'express';
import { ScraperConfig } from '../config';
import { BrowserQueue } from '../scraping/browser-queue';
import { isAllowedScrapeUrl } from '../scraping/allowlist';
import {
  dismissCookieBanner,
  extractRawOfferPage,
  extractRawPriceCheckPage,
} from '../scraping/rejsy4you-extractor';
import {
  mapCabinGroupRows,
  mapRawToFullScrap,
} from '../scraping/parse-offer-page';
import { ScrapedTerm } from '../types';

export function createFullScrapRoute(
  config: ScraperConfig,
  queue: BrowserQueue,
): Router {
  const router = Router();

  router.post('/full-scrap', async (req, res) => {
    const url = req.body?.url;
    const urlIsAllowed =
      typeof url === 'string' &&
      isAllowedScrapeUrl(url, config.allowedScrapeHosts);

    console.log(`[scraper] POST /full-scrap: ${url}`);

    if (!urlIsAllowed) {
      console.warn(
        `[scraper] rejected /full-scrap: URL not on the allowlist - ${url}`,
      );
      res
        .status(400)
        .json({ message: 'URL is missing or not on the allowlist' });
      return;
    }

    try {
      const primaryRaw = await queue.enqueue(async (page) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await dismissCookieBanner(page);
        return extractRawOfferPage(page);
      }, `full-scrap primary page (${url})`);

      const result = mapRawToFullScrap(
        primaryRaw,
        url,
        config.maxTermsPerScrap,
      );

      const otherTerms = result.terms.slice(1);
      console.log(
        `[scraper] "${result.name}": found ${otherTerms.length} additional same-route term(s) to scrape`,
      );
      const filledOtherTerms: ScrapedTerm[] = [];

      for (const [index, term] of otherTerms.entries()) {
        const cabinPrices = await queue.enqueue(
          async (page) => {
            await page.goto(term.sourceUrl, { waitUntil: 'domcontentloaded' });
            const raw = await extractRawPriceCheckPage(page);
            return mapCabinGroupRows(raw.cabinGroupRows);
          },
          `full-scrap term ${index + 1}/${otherTerms.length} (${term.sourceUrl})`,
        );

        filledOtherTerms.push({ ...term, cabinPrices });
      }

      console.log(
        `[scraper] /full-scrap completed: "${result.name}" with ${filledOtherTerms.length + 1} term(s)`,
      );
      res
        .status(200)
        .json({ ...result, terms: [result.terms[0], ...filledOtherTerms] });
    } catch (error) {
      console.error(
        `[scraper] /full-scrap failed for ${url}: ${(error as Error).message}`,
      );
      res
        .status(502)
        .json({ message: `Scraping failed: ${(error as Error).message}` });
    }
  });

  return router;
}
