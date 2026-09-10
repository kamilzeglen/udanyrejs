import { Itinerary } from './itinerary';
import { Company } from './company';
import { ImageFile, PdfFile } from './file';
import { Ship } from './ship';
import { Category } from './category';
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
  categories: Category[];
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

export interface OfferScrapper {
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  itinerary: Itinerary[];
  scrappedShipName: string;
  scrappedImageFileURL: string;
  scrappedPdfFileURL: string;
}
