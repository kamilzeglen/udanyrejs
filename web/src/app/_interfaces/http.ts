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
  all?: number;
  count?: number;
}
