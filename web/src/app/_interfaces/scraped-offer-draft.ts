export interface ScrapedOfferDraftCabinPrice {
  label: string;
  price: number;
  matchedCabinTypeId: string | null;
}

export interface ScrapedOfferDraftTerm {
  startDate: string;
  endDate: string;
  sourceUrl: string;
  cabinPrices: ScrapedOfferDraftCabinPrice[];
}

export interface ScrapedOfferDraftItineraryDay {
  day: number;
  date: string;
  city: string;
  arrivalTime: string;
  departureTime: string;
}

export interface ScrapedOfferDraft {
  id: string;
  name: string;
  shipName: string;
  companyNameRaw: string;
  matchedCompanyId: string;
  matchedShipId: string;
  imageUrl: string;
  pdfUrl: string;
  itinerary: ScrapedOfferDraftItineraryDay[];
  terms: ScrapedOfferDraftTerm[];
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
}
