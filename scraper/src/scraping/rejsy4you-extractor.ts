import { Page } from 'playwright';
import { RawOfferPage, RawListingPage } from './raw-types';

export async function dismissCookieBanner(page: Page): Promise<void> {
  const acceptButton = page.locator('#c-p-bn');
  const buttonCount = await acceptButton.count();

  if (buttonCount === 0) {
    return;
  }

  await acceptButton.click({ timeout: 3000 }).catch(() => undefined);
}

export async function extractRawOfferPage(page: Page): Promise<RawOfferPage> {
  return page.evaluate(() => {
    const titleText = document.querySelector('h1')?.textContent?.trim() ?? '';
    const shipNameText =
      document.querySelector('a.info__shipowner-name')?.textContent?.trim() ??
      '';

    const companyHref =
      document.querySelector('a.info__shipowner-logo')?.getAttribute('href') ??
      '';
    const companyHrefSlug = companyHref.replace(/^\/armatorzy\//, '');

    const ogImageContent =
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content') ?? '';

    const pdfAnchor = Array.from(document.querySelectorAll('a')).find((a) =>
      a.href.includes('offerPdf'),
    );
    const pdfHref = pdfAnchor ? pdfAnchor.href : '';

    const itineraryRows = Array.from(
      document.querySelectorAll('table.route-table tbody tr'),
    ).map((row) => {
      const cells = row.querySelectorAll('td');
      const cityCell = cells[2];
      const cityLink = cityCell?.querySelector('a.cruise-route__place');
      const cityText = cityLink
        ? (cityLink.textContent?.trim() ?? '')
        : (cityCell?.querySelector('div')?.textContent?.trim() ?? '');

      return {
        dayText: cells[0]?.textContent?.trim() ?? '',
        dateText:
          cells[1]?.querySelectorAll('div')[1]?.textContent?.trim() ?? '',
        cityText,
        arrivalText: cells[3]?.querySelector('span')?.textContent?.trim() ?? '',
        departureText:
          cells[4]?.querySelector('span')?.textContent?.trim() ?? '',
      };
    });

    const cabinGroupRows = Array.from(
      document.querySelectorAll('table[aria-describedby="legend"] tr.group'),
    ).map((row) => {
      const cells = row.querySelectorAll('td');
      return {
        labelText: cells[0]?.textContent?.trim() ?? '',
        minPriceText:
          cells[1]?.querySelector('.group-min-price')?.textContent?.trim() ??
          '',
      };
    });

    const otherTermLinks = Array.from(
      document.querySelectorAll('a.schedules__element'),
    ).map((link) => {
      const spans = link.querySelectorAll('.schedules__term span');
      const stripWhitespace = (value: string | undefined | null): string =>
        (value ?? '').replace(/\s+/g, '').trim();

      return {
        href: (link as HTMLAnchorElement).href,
        startDateText: stripWhitespace(spans[0]?.textContent),
        endDateText: stripWhitespace(spans[1]?.textContent),
        isDifferentRoute: link.querySelector('.js-different-route') !== null,
      };
    });

    return {
      titleText,
      shipNameText,
      companyHrefSlug,
      ogImageContent,
      pdfHref,
      itineraryRows,
      cabinGroupRows,
      otherTermLinks,
    };
  });
}

export async function extractRawListingPage(
  page: Page,
): Promise<RawListingPage> {
  return page.evaluate(() => {
    const titleLinks = Array.from(
      document.querySelectorAll('cruiselist-item a.cruise-item__title'),
    );
    const offerHrefs = titleLinks.map(
      (link) => (link as HTMLAnchorElement).href,
    );
    return { offerHrefs };
  });
}
