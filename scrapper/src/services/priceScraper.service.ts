import {chromium} from 'playwright';
import dotenv from "dotenv";

dotenv.config();

const wsUrl = process.env.PW_URL;

if (!wsUrl) {
  throw new Error('PLAYWRIGHT_WS_URL is not defined in .env');
}

export const scrapeCruisePrice = async (url: string): Promise<{ exists: boolean; price?: number }> => {
  console.log('=========');
  console.log('Rozpoczynam scrappowanie ceny:', url);

  const browser = await chromium.connect(wsUrl);
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForSelector('h1.banner__header, h2.error__header', {timeout: 30000});

    const errorElement = await page.$('h2.error__header');
    if (errorElement) {
      await browser.close();
      console.log('Oferta niedostępna');
      return {exists: false};
    }

    const priceText = await page.locator('div.cruise__info div.info__price span').first().innerText();
    const price = parseInt(priceText.replace(/\D/g, ''), 10);

    await browser.close();
    console.log('Scrapowanie zakończone sukcesem:', price);
    console.log('=========');
    return {exists: true, price};

  } catch (error) {
    await browser.close();
    console.error('Błąd scrappowania:', error);
    console.log('=========');
    return {exists: false};
  }
};
