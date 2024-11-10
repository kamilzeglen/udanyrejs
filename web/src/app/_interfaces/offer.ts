import {Itinerary} from './Itinerary';


export interface Offer {
  id: string;
  name: string;
  company: string;
  price: string;
  shipName: string;
  nights: string;
  startDate: Date;
  endDate: Date;
  image?: string;
  imageFileName: string;
  pdfFileName: string;
  itinerary: Itinerary[];
}
