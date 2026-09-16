import { City } from '@modules/city/city.entity';
import { Itinerary } from '../../interfaces/Itinerary';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';

export interface OfferCompletenessIssue {
  code: string;
  label: string;
}

export function getOfferCompletenessIssues(
  offer: Offer,
  terms: OfferTerm[],
  cityById: Map<string, City>,
): OfferCompletenessIssue[] {
  const issues: OfferCompletenessIssue[] = [];

  if (!offer.imageFile) {
    issues.push({ code: 'offer-image', label: 'Brak zdjęcia oferty' });
  }

  if (!offer.company?.imageFile) {
    issues.push({ code: 'company-image', label: 'Brak zdjęcia armatora' });
  }

  if (!offer.ship?.imageFile) {
    issues.push({ code: 'ship-image', label: 'Brak zdjęcia statku' });
  }

  if (!offer.ship?.description?.trim()) {
    issues.push({ code: 'ship-description', label: 'Brak opisu statku' });
  }

  for (const term of terms) {
    if (!term.isActive || term.pdfFile) {
      continue;
    }

    issues.push({
      code: 'term-pdf',
      label: `Brak PDF: ${formatDate(term.startDate)}–${formatDate(term.endDate)}`,
    });
  }

  addCityIssues(issues, offer.itinerary, cityById);
  return issues;
}

function addCityIssues(
  issues: OfferCompletenessIssue[],
  itinerary: Itinerary[] | null | undefined,
  cityById: Map<string, City>,
): void {
  const checkedCityIds = new Set<string>();

  for (const itineraryDay of itinerary ?? []) {
    if (isSeaDay(itineraryDay.city)) {
      continue;
    }

    if (!itineraryDay.cityId) {
      issues.push({
        code: 'city-not-found',
        label: `${itineraryDay.city}: brak powiązanego miasta`,
      });
      continue;
    }

    if (checkedCityIds.has(itineraryDay.cityId)) {
      continue;
    }

    checkedCityIds.add(itineraryDay.cityId);
    const city = cityById.get(itineraryDay.cityId);

    if (!city) {
      issues.push({
        code: 'city-not-found',
        label: `${itineraryDay.city}: brak powiązanego miasta`,
      });
      continue;
    }

    if (city.latitude === null || city.longitude === null) {
      issues.push({
        code: 'city-coordinates',
        label: `${city.name}: brak współrzędnych`,
      });
    }

    if (!city.destinations?.length) {
      issues.push({
        code: 'city-destinations',
        label: `${city.name}: brak regionów`,
      });
    }
  }
}

function isSeaDay(cityName: string): boolean {
  return (
    cityName
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase() === 'dzien na morzu'
  );
}

function formatDate(value: Date): string {
  const date = new Date(value);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}.${month}.${year}`;
}
