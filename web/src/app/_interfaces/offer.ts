import { Itinerary } from './itinerary';
import { Company } from './company';
import { ImageFile } from './file';
import { Ship } from './ship';
import { Destination } from './destination';
import { User } from './user';
import { OfferTerm } from './offer-term';

export interface Offer {
  id: string;
  name: string;
  isActive: boolean;
  offerUrl: string;
  syncData: string;
  isRecommended: boolean;
  company: Company;
  companyId: string;
  ship: Ship;
  shipId: string;
  terms: OfferTerm[];
  imageFile: ImageFile;
  imageFileId: string;
  destinations: Destination[];
  itinerary: Itinerary[];
  createdBy: User;
  createdById: string;
  updatedBy: User;
  updatedById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface OfferSyncResult {
  offerDeactivated: boolean;
  termsAdded: number;
  termsDeactivated: number;
  termsSkipped: number;
  pdfsUpdated: number;
}

export interface OfferScrapperCabinPrice {
  label: string;
  price: number;
}

export interface OfferScrapperTerm {
  startDate: string;
  endDate: string;
  sourceUrl: string;
  pdfUrl: string | null;
  cabinPrices: OfferScrapperCabinPrice[];
}

export interface OfferScrapperItineraryDay {
  day: number;
  date: string;
  city: string;
  arrivalTime: string;
  departureTime: string;
}

export interface OfferScrapper {
  name: string;
  shipName: string;
  companyName: string;
  imageUrl: string;
  itinerary: OfferScrapperItineraryDay[];
  terms: OfferScrapperTerm[];
}
