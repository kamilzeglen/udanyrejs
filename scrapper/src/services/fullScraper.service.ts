import {Browser, chromium} from 'playwright';
import {CruiseData, CruiseScrapeResult} from '../interfaces/cruise.interface';
import {formatDate} from '../utils/date.utils';
import {generatePdfLink} from '../utils/pdf.utils';
import dotenv from "dotenv";

dotenv.config();

const useRemote = process.env.USE_REMOTE_CHROMIUM === 'true';
const wsUrl = process.env.PW_URL;

if (!wsUrl) {
  throw new Error('PLAYWRIGHT_WS_URL is not defined in .env');
}

const checkForErrorPage = async (page: any): Promise<boolean> => {
  if (page.isClosed()) return false;

  const errorElement = await page.$('h2.error__header');
  if (!errorElement) return false;

  return errorElement.evaluate((el: HTMLElement) =>
    el.textContent?.includes('udała się w rejs') ?? false
  );
};

const extractCruiseDetails = async (page: any): Promise<CruiseScrapeResult> => {
  const name = await page.locator('h1.wrapper__title').first().innerText();

  let price = await page.locator('div.cruise__info div.info__price span')
    .first()
    .innerText();
  price = price.replace(/\D/g, '');

  const [startDate, endDate] = await Promise.all([
    page.locator('div.info__embark').first().innerText().then(formatDate),
    page.locator('div.info__disembark').first().innerText().then(formatDate)
  ]);

  const scrappedShipName = await page.locator('a.info__shipowner-name')
    .first()
    .innerText();

  const wrapper = await page.$('.wrapper');

  if (!wrapper) {
    throw new Error('Element .wrapper nie został znaleziony');
  }

  const scrappedImageFileURL = await page.$eval('.wrapper', (element: HTMLElement) => {
    const bg = element.style.backgroundImage;
    const match = bg.match(/url\(["']?(.*?)["']?\)/);
    return match ? match[1] : null;
  });

  console.log(scrappedImageFileURL)


  return {
    name,
    price,
    startDate,
    endDate,
    itinerary: await extractItinerary(page),
    scrappedShipName,
    scrappedImageFileURL: "https://rejsy4you.pl/" + scrappedImageFileURL,
    scrappedPdfFileURL: generatePdfLink(page.url())
  };
};

const extractItinerary = async (page: any): Promise<CruiseData[]> => {
  return page.$$eval('.cruise-route__table table tbody tr', (rows: any[]) =>
    rows.map(row => {
      const columns = row.querySelectorAll('td');
      const rawDate = columns[1]?.querySelector('div:nth-child(2)')?.textContent?.trim();

      return {
        day: parseInt(columns[0]?.textContent?.trim() || '0', 10),
        date: rawDate ? rawDate.split('.').reverse().join('-') : null,
        city: columns[2]?.querySelector('div')?.textContent?.trim()?.split(',')[0] || null,
        arrivalTime: columns[3]?.querySelector('span')?.textContent?.trim() || null,
        departureTime: columns[4]?.querySelector('span')?.textContent?.trim() || null
      };
    })
  );
};

export const scrapeFullCruiseData = async (url: string): Promise<CruiseScrapeResult> => {
  console.log('=========');
  console.log('Rozpoczynam scrappowanie:' + url);

  let browser: Browser;

  if (useRemote) {
    if (!wsUrl) {
      throw new Error('WS_CHROMIUM_URL is not defined in .env');
    }
    browser = await chromium.connect(wsUrl);
  } else {
    browser = await chromium.launch();
  }

  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForSelector('h1.wrapper__title, h2.error__header', {timeout: 30000});

    if (await checkForErrorPage(page)) {
      throw new Error('Strona rejsu jest niedostępna');
    }

    const result = await extractCruiseDetails(page);
    await browser.close();
    console.log('Scrapowanie zakończone sukcesem');
    console.log('=========');
    return result;

  } catch (error) {
    await browser.close();
    console.log('Scrapowanie zakończone błedem: ' + error);
    console.log('=========');
    throw new Error(
      `Scraping failed: ${error instanceof Error ? `${error.name} (code: ${'code' in error ? error.code : 'N/A'}): ${error.message}` : error}`
    );

  }
};
