export interface CabinPrice {
  label: string;
  price: number;
}

export interface ScrapedTerm {
  startDate: string;
  endDate: string;
  sourceUrl: string;
  cabinPrices: CabinPrice[];
}

export interface ItineraryDay {
  day: number;
  date: string;
  city: string;
  arrivalTime: string;
  departureTime: string;
}

export interface FullScrapResult {
  name: string;
  shipName: string;
  companyName: string;
  imageUrl: string;
  pdfUrl: string;
  itinerary: ItineraryDay[];
  terms: ScrapedTerm[];
}

export interface PriceCheckResult {
  available: boolean;
  cabinPrices: CabinPrice[];
}
