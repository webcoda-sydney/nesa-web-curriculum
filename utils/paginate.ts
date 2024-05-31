export interface PaginationResult<T> {
    page: number;
    previous_page: number | null;
    next_page: number | null;
    total: number;
    total_pages: number;
    data: T[];
}

/**
 * Paginates an array of items.
 * 
 * @param items - The array of items to be paginated.
 * @param page - The current page number (default: 1).
 * @param perPage - The number of items per page (default: 10).
 * @returns An object containing the paginated data, current page number, previous page number, next page number, total number of items, total number of pages.
 */
export function paginate<T>(items: T[], page: number = 1, perPage: number = 10): PaginationResult<T> {
    const offset = (page - 1) * perPage
    const paginatedItems = items.slice(offset).slice(0, perPage)
    const total_pages = Math.ceil(items.length / perPage)

    return {
        page: page,
        previous_page: page - 1 ? page - 1 : null,
        next_page: total_pages > page ? page + 1 : null,
        total: items.length,
        total_pages: total_pages,
        data: paginatedItems,
    }
}