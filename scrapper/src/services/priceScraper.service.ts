import {chromium} from 'playwright';

export const scrapeCruisePrice = async (url: string): Promise<{ exists: boolean; price?: number }> => {
  console.log('=========');
  console.log('Rozpoczynam scrappowanie ceny:', url);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForSelector('h1.banner__header, h2.error__header', {timeout: 5000});

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
