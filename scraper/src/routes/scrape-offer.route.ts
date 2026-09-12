import { Router } from 'express';
import { ScraperConfig } from '../config';
import { BrowserQueue } from '../scraping/browser-queue';
import { isAllowedScrapeUrl } from '../scraping/allowlist';
import {
  dismissCookieBanner,
  extractRawOfferPage,
} from '../scraping/rejsy4you-extractor';
import {
  mapCabinGroupRows,
  mapRawToScrapedOffer,
} from '../scraping/parse-offer-page';
import { ScrapedTerm } from '../types';
import { PageNotFoundError } from '../scraping/page-not-found.error';

function isConfirmedGoneStatus(status: number): boolean {
  return status === 404 || status === 410;
}

// Skrapuje CAŁĄ rodzinę terminów oferty (primary page + wszyscy siblingi z
// otherTermLinks) w jednym zapytaniu - używane tylko przy pierwszym imporcie
// (discovery/ręczne dodanie oferty). Do odświeżenia już znanego terminu albo
// pobrania jednego nowo odkrytego służy lekki /scrape-term (jedna strona),
// patrz scrape-term.route.ts.
export function createScrapeOfferRoute(
  config: ScraperConfig,
  queue: BrowserQueue,
): Router {
  const router = Router();

  router.post('/scrape-offer', async (req, res) => {
    const url = req.body?.url;
    const urlIsAllowed =
      typeof url === 'string' &&
      isAllowedScrapeUrl(url, config.allowedScrapeHosts);

    console.log(`[scraper] POST /scrape-offer: ${url}`);

    if (!urlIsAllowed) {
      console.warn(
        `[scraper] rejected /scrape-offer: URL not on the allowlist - ${url}`,
      );
      res
        .status(400)
        .json({ message: 'URL is missing or not on the allowlist' });
      return;
    }

    try {
      const primaryRaw = await queue.enqueue(async (page) => {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
        });
        if (response && isConfirmedGoneStatus(response.status())) {
          throw new PageNotFoundError(url);
        }
        await dismissCookieBanner(page);
        return extractRawOfferPage(page);
      }, `scrape-offer primary page (${url})`);

      const result = mapRawToScrapedOffer(
        primaryRaw,
        url,
        config.maxTermsPerScrap,
      );

      const otherTerms = result.terms.slice(1);
      console.log(
        `[scraper] "${result.name}": found ${otherTerms.length} additional same-route term(s) to scrape`,
      );
      const filledOtherTerms: ScrapedTerm[] = [];
      const notFoundUrls: string[] = [];

      for (const [index, term] of otherTerms.entries()) {
        try {
          const { cabinPrices, pdfUrl } = await queue.enqueue(
            async (page) => {
              const response = await page.goto(term.sourceUrl, {
                waitUntil: 'domcontentloaded',
              });
              if (response && isConfirmedGoneStatus(response.status())) {
                throw new PageNotFoundError(term.sourceUrl);
              }
              const raw = await extractRawOfferPage(page);
              return {
                cabinPrices: mapCabinGroupRows(raw.cabinGroupRows),
                pdfUrl: raw.pdfHref || null,
              };
            },
            `scrape-offer term ${index + 1}/${otherTerms.length} (${term.sourceUrl})`,
          );

          filledOtherTerms.push({ ...term, cabinPrices, pdfUrl });
        } catch (error) {
          // Jeden wadliwy sibling (404 albo błąd scrapowania) nie może
          // wywalić całego scrape-offer - po prostu pomijamy go w tym
          // przebiegu, główny termin (url) i tak zostanie zwrócony. Gdy to
          // było POTWIERDZONE 404/410 (nie zwykły błąd sieci/scrapera),
          // zgłaszamy to w notFoundUrls - wywołujący (API) może wtedy
          // bezpiecznie dezaktywować konkretnie ten termin, bez potrzeby
          // osobnego zapytania na jego własny URL.
          if (error instanceof PageNotFoundError) {
            notFoundUrls.push(term.sourceUrl);
          }
          console.warn(
            `[scraper] scrape-offer: pomijam sibling termin ${term.sourceUrl}: ${(error as Error).message}`,
          );
        }
      }

      console.log(
        `[scraper] /scrape-offer completed: "${result.name}" with ${filledOtherTerms.length + 1} term(s)`,
      );
      res.status(200).json({
        ...result,
        terms: [result.terms[0], ...filledOtherTerms],
        notFoundUrls,
      });
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        console.warn(
          `[scraper] /scrape-offer: strona potwierdzona jako nieistniejąca (404/410) - ${url}`,
        );
        res.status(404).json({ message: error.message });
        return;
      }

      console.error(
        `[scraper] /scrape-offer failed for ${url}: ${(error as Error).message}`,
      );
      res
        .status(502)
        .json({ message: `Scraping failed: ${(error as Error).message}` });
    }
  });

  return router;
}
