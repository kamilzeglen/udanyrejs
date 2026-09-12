export interface CabinPrice {
  label: string;
  price: number;
}

export interface ScrapedTerm {
  startDate: string;
  endDate: string;
  sourceUrl: string;
  pdfUrl: string | null;
  cabinPrices: CabinPrice[];
}

export interface ItineraryDay {
  day: number;
  date: string;
  city: string;
  arrivalTime: string;
  departureTime: string;
}

export interface ScrapedOfferResult {
  name: string;
  shipName: string;
  companyName: string;
  imageUrl: string;
  itinerary: ItineraryDay[];
  terms: ScrapedTerm[];
}

export interface ScrapedSiblingLink {
  sourceUrl: string;
  startDate: string;
  endDate: string;
}

export interface ScrapedTermPageResult {
  startDate: string;
  endDate: string;
  cabinPrices: CabinPrice[];
  pdfUrl: string | null;
  siblingLinks: ScrapedSiblingLink[];
}
