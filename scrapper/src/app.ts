// src/index.ts
import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import {chromium} from "playwright";
import bodyParser from "body-parser";
import cors from "cors";

interface CruiseData {
  day: number;
  date: string | null;
  city: string | null;
  arrivalTime: string | null;
  departureTime: string | null;
}

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4006;

app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:4200', // Domena frontendu
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Dozwolone metody HTTP
    credentials: true, // Jeśli chcesz przesyłać ciasteczka
  })
);

async function scrapeWithPlaywright(url: string) {
  const browser = await chromium.launch({headless: true}); // Uruchom przeglądarkę w trybie headless
  const page = await browser.newPage();

  try {
    await page.goto(url); // Otwórz stronę

    await page.waitForSelector('h1.banner__header'); // Poczekaj na załadowanie elementu

    // Pobierz tytuł strony
    const name = await page.locator('h1.banner__header').nth(0).innerText()

    let price = await page.locator('div.cruise__info div.info__price span').nth(0).innerText();
    price = price.replace(/\s+/g, '');
    price = price.match(/\d+/g)?.join('') || '';

    let startDate = await page.locator('div.info__embark').nth(0).innerText();
    startDate = formatDate(startDate)

    let endDate = await page.locator('div.info__disembark').nth(0).innerText();
    endDate = formatDate(endDate)

    let scrappedShipName = await page.locator('a.info__shipowner-name').nth(0).innerText();

    const scrappedImageFileURL = await page.$eval('.banner', (element) => {
      const style = window.getComputedStyle(element);
      return style.backgroundImage.match(/url\("(.*)"\)/)?.[1];
    });

    console.log('Znaleziony Image: ' + scrappedImageFileURL)
    const scrappedPdfFileURL = generatePdfLink(url);

    const itinerary: CruiseData[] = await page.$$eval(`.cruise-route__table table tbody tr`, (rows) => {
      return rows.map((row) => {
        const columns = row.querySelectorAll('td');

        // Wyciągnij dane z odpowiednich kolumn
        const day = parseInt(columns[0]?.textContent?.trim() || '0', 10);
        const rawDate = columns[1]?.querySelector('div:nth-child(2)')?.textContent?.trim() || null;
        let city = columns[2]?.querySelector('div')?.textContent?.trim() || null;
        const arrivalTime = columns[3]?.querySelector('span')?.textContent?.trim() || null;
        const departureTime = columns[4]?.querySelector('span')?.textContent?.trim() || null;

        if (city) {
          city = city.split(',')[0].trim();
        }

        // Zamień datę na format YYYY-MM-DD
        const formattedDate = rawDate
          ? rawDate.split('.').reverse().join('-') // Zamienia DD.MM.YYYY na YYYY-MM-DD
          : null;

        return {
          day,
          date: formattedDate,
          city,
          arrivalTime,
          departureTime,
        };
      });
    });

    await browser.close();
    return {name, price, startDate, endDate, itinerary, scrappedShipName, scrappedImageFileURL, scrappedPdfFileURL};
  } catch (error) {
    await browser.close();
    throw new Error(`Scraping failed: ${error}`);
  }
}

function formatDate(inputDate: string): string {
  // Miesiące w języku polskim
  const monthMap: { [key: string]: string } = {
    "STYCZEŃ": "01",
    "LUTY": "02",
    "MARZEC": "03",
    "KWIECIEŃ": "04",
    "MAJ": "05",
    "CZERWIEC": "06",
    "LIPIEC": "07",
    "SIERPIEŃ": "08",
    "WRZESIEŃ": "09",
    "PAŹDZIERNIK": "10",
    "LISTOPAD": "11",
    "GRUDZIEŃ": "12",
  };

  // Rozbij tekst na linie
  const parts = inputDate.split("\n");

  // Sprawdź, czy są dokładnie 3 części: dzień, miesiąc, rok
  if (parts.length !== 3) {
    throw new Error("Invalid date format");
  }

  const day = parts[0].trim(); // Dzień
  const month = monthMap[parts[1].trim().toUpperCase()]; // Miesiąc jako numer
  const year = parts[2].trim(); // Rok

  if (!month) {
    throw new Error("Invalid month name");
  }

  // Stwórz datę w formacie YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day.padStart(2, "0")}`;

  // Zwróć datę w formacie ISO 8601
  const date = new Date(formattedDate + "T00:00:00Z");
  return date.toISOString();
}

function generatePdfLink(url: string): string {
  // Poprawione wyrażenie regularne do obsługi obu przypadków
  const regex = /rejs\/(\d+)_.*?_(\d+)(?:\?|$)/;
  const match = url.match(regex);

  if (!match || match.length < 3) {
    throw new Error("Could not extract itineraryId and scheduleId from URL");
  }

  const itineraryId = match[1];
  const scheduleId = match[2];

  // Generowanie linku PDF
  const pdfLink = `https://rejsy4you.pl/api/Itineraries/offerPdf?itineraryId=${itineraryId}&scheduleId=${scheduleId}&agentCode=UR92JS`;
  console.log('Znaleziony PDF: ' + pdfLink)
  return pdfLink;
}



app.post("/scrap", async (req: Request, res: Response) => {
  const {url} = req.body;

  if (!url) {
    console.log('Nie znaleziono URL')
    return;
  }

  console.log("=========")
  console.log("Scrappuje: " + url)

  try {
    const result = await scrapeWithPlaywright(url);
    console.log("=========")
    res.json({url, ...result});
  } catch (error) {
    console.log(error)
    res.status(500).json({error: error});
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
