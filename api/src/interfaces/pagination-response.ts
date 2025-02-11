export interface PaginationResp {
  orderBy: string;
  orderDir: 'asc' | 'desc';
  limit: number;
  offset: number;
  all: number;
  count: number;
}
