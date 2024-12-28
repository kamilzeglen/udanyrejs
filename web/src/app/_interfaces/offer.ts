import {Itinerary} from './itinerary';
import {Company} from './company';
import {imageFile, pdfFile} from './file';
import {FileUpload} from './fileUpload';
import {Ship} from './ship';

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
  imageFile: imageFile | FileUpload;
  imageFileId: string;
  pdfFile: pdfFile | FileUpload;
  pdfFileId: string;
  itinerary: Itinerary[];
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
