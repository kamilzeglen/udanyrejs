import {Pagination} from './http';

export interface OffersPayload extends Pagination {
  category?: string;
}
