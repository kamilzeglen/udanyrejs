import {Itinerary} from './itinerary';
import {Company} from './company';
import {ImageFile, PdfFile} from './file';
import {Ship} from './ship';
import {Category} from './category';
import {Destination} from './destination';
import {FileUpload} from './file-upload';
import {User} from './user';

export interface Offer {
  id: string;
  name: string;
  offerUrl: string;
  syncData: string;
  company: Company;
  companyId: string;
  price: number;
  ship: Ship;
  shipId: string;
  startDate: string;
  endDate: string;
  imageFile: ImageFile | FileUpload;
  imageFileId: string;
  pdfFile: PdfFile | FileUpload;
  pdfFileId: string;
  destinations: Destination[];
  categories: Category[]
  itinerary: Itinerary[];
  createdBy: User,
  createdById: string
  updatedBy: User,
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
