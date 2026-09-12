import {
  CabinPrice,
  ScrapedOfferResult,
  ItineraryDay,
  ScrapedTermPageResult,
} from '../types';
import { RawCabinGroupRow, RawOfferPage } from './raw-types';

export function parseDdMmYyyy(text: string): string {
  const [day, month, year] = text.split('.');
  return `${year}-${month}-${day}`;
}

export function parseEuroPrice(text: string): number | null {
  const match = text.match(/€\s*([\d.,]+)/);
  if (!match) {
    return null;
  }

  const numericText = match[1].replace(',', '.');
  return Number.parseFloat(numericText);
}

export function slugToTitleCase(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function mapCabinGroupRows(rows: RawCabinGroupRow[]): CabinPrice[] {
  const prices: CabinPrice[] = [];

  for (const row of rows) {
    const price = parseEuroPrice(row.minPriceText);
    if (price === null) {
      continue;
    }

    const label = row.labelText.replace(/▸/g, '').trim();
    prices.push({ label, price });
  }

  return prices;
}

function mapItineraryRows(rows: RawOfferPage['itineraryRows']): ItineraryDay[] {
  return rows.map((row) => ({
    day: Number.parseInt(row.dayText, 10),
    date: parseDdMmYyyy(row.dateText),
    city: row.cityText.trim(),
    arrivalTime: row.arrivalText.trim(),
    departureTime: row.departureText.trim(),
  }));
}

function derivePrimaryTermDates(itinerary: ItineraryDay[]): {
  startDate: string;
  endDate: string;
} {
  const firstDay = itinerary[0];
  const lastDay = itinerary[itinerary.length - 1];

  return { startDate: firstDay.date, endDate: lastDay.date };
}

export function mapRawToScrapedOffer(
  raw: RawOfferPage,
  sourceUrl: string,
  maxTerms: number,
): ScrapedOfferResult {
  const itinerary = mapItineraryRows(raw.itineraryRows);
  const primaryTermDates = derivePrimaryTermDates(itinerary);

  const otherTerms = raw.otherTermLinks
    .filter((link) => !link.isDifferentRoute)
    .slice(0, Math.max(maxTerms - 1, 0))
    .map((link) => ({
      startDate: link.startDateText,
      endDate: link.endDateText,
      sourceUrl: link.href,
      // Uzupełniane osobno - dopiero po odwiedzeniu własnej strony tego
      // terminu (patrz scrape-offer.route.ts), tak samo jak cabinPrices.
      pdfUrl: null as string | null,
      cabinPrices: [] as CabinPrice[],
    }));

  return {
    name: raw.titleText.trim(),
    shipName: raw.shipNameText.trim(),
    companyName: slugToTitleCase(raw.companyHrefSlug),
    imageUrl: raw.ogImageContent,
    itinerary,
    terms: [
      {
        startDate: primaryTermDates.startDate,
        endDate: primaryTermDates.endDate,
        sourceUrl,
        pdfUrl: raw.pdfHref || null,
        cabinPrices: mapCabinGroupRows(raw.cabinGroupRows),
      },
      ...otherTerms,
    ].slice(0, maxTerms),
  };
}

export function mapRawToScrapedTerm(raw: RawOfferPage): ScrapedTermPageResult {
  const { startDate, endDate } = derivePrimaryTermDates(
    mapItineraryRows(raw.itineraryRows),
  );

  return {
    startDate,
    endDate,
    cabinPrices: mapCabinGroupRows(raw.cabinGroupRows),
    pdfUrl: raw.pdfHref || null,
    siblingLinks: raw.otherTermLinks
      .filter((link) => !link.isDifferentRoute)
      .map((link) => ({
        sourceUrl: link.href,
        startDate: link.startDateText,
        endDate: link.endDateText,
      })),
  };
}
