export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PageResponse<T> {
  data: T[];
  meta: PaginationMeta;
}