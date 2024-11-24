import {Itinerary} from './Itinerary';


export interface Offer {
  id: string;
  name: string;
  company: string;
  price: string;
  shipName: string;
  startDate: string;
  endDate: string;
  imageFileName: string;
  pdfFileName: string;
  itinerary: Itinerary[];
  image?: string;
}
