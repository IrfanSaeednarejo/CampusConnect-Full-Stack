import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook to manage pagination state
 * 
 * @param {Object} options - Pagination configuration
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.itemsPerPage - Number of items per page (default: 10)
 * @param {number} options.totalItems - Total number of items
 * @returns {Object} Pagination state and control functions
 * 
 * @example
 * const { currentPage, setPage, nextPage, previousPage, totalPages } = 
 *   usePagination({ totalItems: 100, itemsPerPage: 10 });
 * 
 * return (
 *   <div>
 *     <button onClick={previousPage} disabled={currentPage === 1}>Previous</button>
 *     <span>Page {currentPage} of {totalPages}</span>
 *     <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
 *   </div>
 * );
 */
export const usePagination = ({ 
  initialPage = 1, 
  itemsPerPage = 10, 
  totalItems = 0 
} = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }, [totalItems, itemsPerPage]);

  // Safe page setter with bounds checking
  const setPage = useCallback((page) => {
    const pageNumber = typeof page === 'function' ? page(currentPage) : page;
    const boundedPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(boundedPage);
  }, [totalPages, currentPage]);

  // Navigate to next page
  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, [setPage]);

  // Navigate to previous page
  const previousPage = useCallback(() => {
    setPage(prev => prev - 1);
  }, [setPage]);

  // Go to first page
  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  // Go to last page
  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  // Reset to initial page
  const reset = useCallback(() => {
    setPage(initialPage);
  }, [setPage, initialPage]);

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    return {
      startIndex,
      endIndex,
      startItem: startIndex + 1,
      endItem: endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [currentPage, itemsPerPage, totalItems, totalPages]);

  return {
    currentPage,
    setPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    reset,
    totalPages,
    itemsPerPage,
    ...paginationInfo
  };
};
