import {Browser, chromium} from 'playwright';
import dotenv from "dotenv";
import {generatePdfLink} from '../utils/pdf.utils';

dotenv.config();

const useRemote = process.env.USE_REMOTE_CHROMIUM === 'true';
const wsUrl = process.env.PW_URL;

if (!wsUrl) {
  throw new Error('PLAYWRIGHT_WS_URL is not defined in .env');
}

export const syncOffer = async (url: string): Promise<{ exists: boolean; price?: number, pdfUrl?: string }> => {
  console.log('=========');
  console.log('Rozpoczynam scrappowanie ceny:', url);

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

    const errorElement = await page.$('h2.error__header');
    if (errorElement) {
      const errorText = await errorElement.textContent();

      if (errorText && errorText.includes('udała się w rejs')) {
        await browser.close();
        console.log('Oferta niedostępna');
        return {exists: false};
      }
    }

    const priceText = await page.locator('div.cruise__info div.info__price span').first().innerText();
    const price = parseInt(priceText.replace(/\D/g, ''), 10);
    const pdfUrl = generatePdfLink(page.url())

    await browser.close();
    console.log('Scrapowanie zakończone sukcesem:', price);
    console.log('=========');
    return {exists: true, price, pdfUrl};

  } catch (error) {
    await browser.close();
    console.error('Błąd scrappowania:', error);
    console.log('=========');
    return {exists: false};
  }
};
