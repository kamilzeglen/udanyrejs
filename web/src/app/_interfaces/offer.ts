import {Itinerary} from './itinerary';
import {Company} from './company';
import {imageFile, pdfFile} from './file';


export interface Offer {
  id: string;
  name: string;
  offerUrl: string;
  syncData: string;
  company: Company;
  price: number;
  shipName: string;
  startDate: string;
  endDate: string;
  imageFile: imageFile;
  pdfFile: pdfFile;
  itinerary: Itinerary[];
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
