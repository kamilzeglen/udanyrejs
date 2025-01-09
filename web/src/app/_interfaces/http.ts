import { SortDirection } from '@angular/material/sort';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  orderBy: string;
  orderDir: SortDirection;
  limit: number;
  offset: number;

  // all available all entities
  // only in responses
  all?: number;

  // count available entities on this page
  // only in responses
  count?: number;
}
