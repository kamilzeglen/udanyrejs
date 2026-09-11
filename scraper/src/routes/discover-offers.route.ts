import { Router } from 'express';
import { ScraperConfig } from '../config';
import { BrowserQueue } from '../scraping/browser-queue';
import { isAllowedScrapeUrl } from '../scraping/allowlist';
import { extractRawListingPage } from '../scraping/rejsy4you-extractor';
import { findShipownerId } from '../scraping/rejsy4you-shipowners';

const LISTING_BASE_URL = 'https://rejsy4you.pl/rejsy';

export function createDiscoverOffersRoute(config: ScraperConfig, queue: BrowserQueue): Router {
  const router = Router();

  router.post('/discover-offers', async (req, res) => {
    const shipownerNames = req.body?.shipownerNames;
    const count = req.body?.count;

    const namesAreValid = Array.isArray(shipownerNames) && shipownerNames.every((name) => typeof name === 'string');
    const countIsValid = typeof count === 'number' && Number.isInteger(count) && count > 0;

    if (!namesAreValid || !countIsValid) {
      res.status(400).json({ message: 'shipownerNames (string[]) and count (positive integer) are required' });
      return;
    }

    console.log(`[scraper] POST /discover-offers: count=${count}, shipownerNames=${shipownerNames.join(', ')}`);

    const matched: { name: string; id: number }[] = [];
    const unmatchedNames: string[] = [];

    for (const name of shipownerNames) {
      const id = findShipownerId(name);
      if (id === null) {
        unmatchedNames.push(name);
        continue;
      }
      matched.push({ name, id });
    }

    const collectedUrls = new Set<string>();
    const exhausted = new Set<number>();
    const pageByShipownerId = new Map<number, number>(matched.map((m) => [m.id, 1]));

    while (collectedUrls.size < count && exhausted.size < matched.length) {
      for (const { id } of matched) {
        if (collectedUrls.size >= count) {
          break;
        }

        if (exhausted.has(id)) {
          continue;
        }

        const currentPage = pageByShipownerId.get(id) as number;

        if (currentPage > config.maxDiscoveryPagesPerHost) {
          exhausted.add(id);
          continue;
        }

        const listingUrl = `${LISTING_BASE_URL}?page=${currentPage}&option=dateAsc&shipowner=${id}`;

        if (!isAllowedScrapeUrl(listingUrl, config.allowedScrapeHosts)) {
          exhausted.add(id);
          continue;
        }

        const raw = await queue.enqueue(async (page) => {
          await page.goto(listingUrl, { waitUntil: 'domcontentloaded' });
          return extractRawListingPage(page);
        }, `discover-offers page ${currentPage} (shipowner ${id})`);

        if (raw.offerHrefs.length === 0) {
          exhausted.add(id);
          continue;
        }

        raw.offerHrefs.forEach((href) => collectedUrls.add(href));
        pageByShipownerId.set(id, currentPage + 1);
      }
    }

    const urls = Array.from(collectedUrls).slice(0, count);
    console.log(
      `[scraper] /discover-offers found ${urls.length} url(s), unmatched shipowners: ${unmatchedNames.join(', ') || 'none'}`,
    );
    res.status(200).json({ urls, unmatchedNames });
  });

  return router;
}
