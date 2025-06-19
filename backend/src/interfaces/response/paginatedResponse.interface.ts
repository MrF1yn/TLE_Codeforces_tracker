export interface IPaginatedData<T> {
  currentPage: number;
  nextPage: number | null;
  totalPages: number;
  totalItems: number;
  data: T[];
}
