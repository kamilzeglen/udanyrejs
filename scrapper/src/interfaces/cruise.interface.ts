export interface CruiseData {
  day: number;
  date: string | null;
  city: string | null;
  arrivalTime: string | null;
  departureTime: string | null;
}

export interface CruiseScrapeResult {
  name: string;
  price: string;
  startDate: string;
  endDate: string;
  itinerary: CruiseData[];
  scrappedShipName: string;
  scrappedImageFileURL: string | null;
  scrappedPdfFileURL: string;
}
