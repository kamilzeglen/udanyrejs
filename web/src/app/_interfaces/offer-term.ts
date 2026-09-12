import { CabinType } from './cabin-type';
import { Category } from './category';
import { Offer } from './offer';
import { PdfFile } from './file';
import { ShareStats } from './shareStats';

export interface OfferTermPrice {
  id: string;
  cabinType: CabinType;
  cabinTypeId: string;
  // Cena w groszach (najmniejsza jednostka waluty), nie w złotych.
  price: number;
}

export interface OfferTerm {
  id: string;
  offerId: string;
  startDate: string;
  endDate: string;
  sourceUrl: string;
  isActive: boolean;
  prices: OfferTermPrice[];
  categories: Category[];
  shareStats: ShareStats;
  pdfFile: PdfFile;
}

// Wynik listy/wyszukiwarki - jeden wiersz = jeden termin danej oferty.
// isActive odziedziczone z Offer to status CAŁEJ oferty - termIsActive to
// status TEGO KONKRETNEGO terminu, mogą się różnić (patrz admin-offer-list).
export type OfferSearchResult = Omit<Offer, 'terms'> & {
  termId: string;
  startDate: string;
  endDate: string;
  fromPrice: number;
  shareStats: ShareStats;
  pdfFile: PdfFile;
  sourceUrl: string;
  termIsActive: boolean;
};
