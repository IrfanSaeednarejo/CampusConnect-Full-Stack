import { useState, useCallback, useMemo } from 'react';
export const usePagination = ({
  initialPage = 1,
  itemsPerPage = 10,
  totalItems = 0
} = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }, [totalItems, itemsPerPage]);
  const setPage = useCallback((page) => {
    const pageNumber = typeof page === 'function' ? page(currentPage) : page;
    const boundedPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(boundedPage);
  }, [totalPages, currentPage]);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, [setPage]);

  const previousPage = useCallback(() => {
    setPage(prev => prev - 1);
  }, [setPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);
  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  const reset = useCallback(() => {
    setPage(initialPage);
  }, [setPage, initialPage]);

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
