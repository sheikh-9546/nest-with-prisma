import { PaginationDefaults } from '@api/enums/pagination.enum';

export interface PaginationResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
  
  export class PaginationUtil {
    static paginate<T>(
      items: T[],
      totalCount: number,
      currentPage: number,
      pageSize: number
    ): PaginationResult<T> {
      const totalPages = Math.ceil(totalCount / pageSize);
  
      return {
        data: items,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
      };
    }
  
    static getPaginationParams(page: number, limit: number): { skip: number; take: number } {
      const pageSize = limit > 0 ? limit : PaginationDefaults.DEFAULT_LIMIT; // Default to DEFAULT_LIMIT if limit is not set
      const skip = (page - 1) * pageSize;
  
      return { skip, take: pageSize };
    }
  }
  