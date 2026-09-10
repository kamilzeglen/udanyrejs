import { Itinerary } from './itinerary';
import { Company } from './company';
import { ImageFile, PdfFile } from './file';
import { Ship } from './ship';
import { Category } from './category';
import { Destination } from './destination';
import { User } from './user';
import { ShareStats } from './shareStats';

export interface Offer {
  id: string;
  name: string;
  isActive: boolean;
  offerUrl: string;
  syncData: string;
  isRecommended: boolean;
  company: Company;
  companyId: string;
  // Cena w groszach (najmniejsza jednostka waluty), nie w złotych.
  price: number;
  ship: Ship;
  shipId: string;
  startDate: string;
  endDate: string;
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
