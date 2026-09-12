import { CabinType } from './cabin-type';
import { Category } from './category';
import { Offer } from './offer';
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
  prices: OfferTermPrice[];
  categories: Category[];
  shareStats: ShareStats;
}

// Wynik listy/wyszukiwarki - jeden wiersz = jeden termin danej oferty.
export type OfferSearchResult = Omit<Offer, 'terms'> & {
  termId: string;
  startDate: string;
  endDate: string;
  fromPrice: number;
  shareStats: ShareStats;
};
