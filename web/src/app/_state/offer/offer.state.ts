import { OfferSearchResult } from '@interfaces';
import { Pagination } from '../../_interfaces/http';

export type OfferState = Readonly<{
  offers: OfferSearchResult[];
  loading: boolean;
  scraping: boolean;
  syncingOfferId: string;
  pagination: Pagination;
  errorMessage: string;
}>;

export const defaultPagination = {
  limit: 10,
  offset: 0,
  orderBy: 'name',
  orderDir: 'asc',
};

export const initialState: OfferState = {
  offers: null,
  loading: false,
  scraping: false,
  syncingOfferId: null,
  pagination: { ...(defaultPagination as Pagination) },
  errorMessage: null,
};
