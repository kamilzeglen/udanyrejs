import { Pagination } from './http';

export interface SearchOffersPayload extends Pagination {
  category?: string;
  endDate?: Date;
  startDate?: Date;
  companyIdList?: string[];
  destinationIdList?: string[];
  showInactive?: boolean;
}
