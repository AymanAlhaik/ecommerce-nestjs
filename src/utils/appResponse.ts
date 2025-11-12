export class AppResponse<T> {
  status: number;
  message: string;
  data?: T;

  constructor(partial: Partial<AppResponse<T>> = {}) {
    this.status = partial.status ?? 200;
    this.message = partial.message ?? 'success';
    this.data = partial.data;
  }
}
