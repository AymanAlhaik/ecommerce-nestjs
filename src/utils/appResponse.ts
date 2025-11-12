export class PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export class AppResponse<T> {
  status: number;
  message: string;
  data?: T;
  pagination?: PaginationMeta;

  constructor(partial: Partial<AppResponse<T>> = {}) {
    this.status = partial.status ?? 200;
    this.message = partial.message ?? 'success';
    this.data = partial.data;
    this.pagination = partial.pagination;
  }
}
