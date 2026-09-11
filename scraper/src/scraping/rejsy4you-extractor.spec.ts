import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { dismissCookieBanner, extractRawOfferPage, extractRawPriceCheckPage } from './rejsy4you-extractor';

const fixtureHtml = fs.readFileSync(
  path.join(__dirname, '__fixtures__', 'rejsy4you-offer-page.html'),
  'utf-8',
);

describe('rejsy4you-extractor', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ channel: 'chrome' });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setContent(fixtureHtml, { waitUntil: 'load' });
  });

  afterEach(async () => {
    await page.close();
  });

  it('dismisses the cookie banner when present', async () => {
    await dismissCookieBanner(page);
    const isVisible = await page.isVisible('#c-p-bn');
    expect(isVisible).toBe(false);
  });

  it('does nothing when there is no cookie banner', async () => {
    await page.evaluate(() => document.getElementById('c-p-bn')?.remove());
    await expect(dismissCookieBanner(page)).resolves.not.toThrow();
  });

  it('extracts the full offer page', async () => {
    const raw = await extractRawOfferPage(page);

    expect(raw.titleText).toBe('Rejs Hiszpania, Francja, Włochy');
    expect(raw.shipNameText).toBe('Norwegian Epic');
    expect(raw.companyHrefSlug).toBe('norwegian-cruise-line');
    expect(raw.ogImageContent).toBe('https://rejsy4you.pl/public/upload/2021/10/20/holland_rzym_wlochy_6.jpg');
    expect(raw.pdfHref).toContain('/api/Itineraries/offerPdf?itineraryId=93096&scheduleId=208990');

    expect(raw.itineraryRows).toHaveLength(4);
    expect(raw.itineraryRows[0]).toEqual({
      dayText: '1',
      dateText: '04.10.2026',
      cityText: 'Barcelona',
      arrivalText: '',
      departureText: '17:00',
    });
    expect(raw.itineraryRows[2].cityText).toBe('Dzień na morzu');

    expect(raw.cabinGroupRows).toHaveLength(3);
    expect(raw.cabinGroupRows[0].minPriceText).toContain('614.43');

    expect(raw.otherTermLinks).toHaveLength(3);
    const sameRoute = raw.otherTermLinks.filter((link) => !link.isDifferentRoute);
    expect(sameRoute).toHaveLength(1);
    expect(sameRoute[0].href).toContain('93098_hiszpania-francja-wlochy_208992');
    expect(sameRoute[0].startDateText).toBe('2026-10-18');
    expect(sameRoute[0].endDateText).toBe('2026-10-25');
  });

  it('extracts only the cabin prices for a price-check page', async () => {
    const raw = await extractRawPriceCheckPage(page);
    expect(raw.pageFound).toBe(true);
    expect(raw.cabinGroupRows).toHaveLength(3);
  });
});
