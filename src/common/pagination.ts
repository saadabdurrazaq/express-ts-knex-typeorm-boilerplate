export interface PaginatedResponse<T> {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    from: number;
    to: number;
    data: T[];
}
