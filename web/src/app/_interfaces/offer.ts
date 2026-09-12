import { Itinerary } from './itinerary';
import { Company } from './company';
import { ImageFile, PdfFile } from './file';
import { Ship } from './ship';
import { Destination } from './destination';
import { User } from './user';
import { ShareStats } from './shareStats';
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
  pdfFile: PdfFile;
  pdfFileId: string;
  destinations: Destination[];
  itinerary: Itinerary[];
  shareStats: ShareStats;
  sharedStatId: string;
  createdBy: User;
  createdById: string;
  updatedBy: User;
  updatedById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface OfferScrapperCabinPrice {
  label: string;
  price: number;
}

export interface OfferScrapperTerm {
  startDate: string;
  endDate: string;
  sourceUrl: string;
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
  pdfUrl: string;
  itinerary: OfferScrapperItineraryDay[];
  terms: OfferScrapperTerm[];
}
