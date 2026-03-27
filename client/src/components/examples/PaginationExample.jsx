import React, { useState } from 'react';
import { usePagination } from '@/hooks';  // ✅ Named import

/**
 * Example component demonstrating usePagination hook usage
 * 
 * Shows how to use the usePagination hook to paginate through a list of items
 * with navigation controls and page information
 */
const PaginationExample = () => {
  // Mock data - 50 items
  const mockData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`
  }));

  // Pagination hook with 10 items per page
  const {
    currentPage,
    setPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    totalPages,
    startIndex,
    endIndex,
    startItem,
    endItem,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage
  } = usePagination({
    totalItems: mockData.length,
    itemsPerPage: 10,
    initialPage: 1
  });

  // Get current page items
  const currentItems = mockData.slice(startIndex, endIndex);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Pagination Example</h2>

      {/* Pagination Info */}
      <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm text-gray-700">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
          <strong>{mockData.length}</strong> items
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-3 mb-6">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white border border-gray-200 rounded hover:shadow-md transition"
          >
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Previous/Next Buttons */}
        <div className="flex gap-2">
          <button
            onClick={firstPage}
            disabled={isFirstPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            onClick={previousPage}
            disabled={!hasPreviousPage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={lastPage}
            disabled={isLastPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>

        {/* Page Number Buttons */}
        <div className="flex gap-1 flex-wrap justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`w-10 h-10 rounded ${
                currentPage === page
                  ? 'bg-blue-500 text-white font-bold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Direct Page Input */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <label htmlFor="pageInput" className="text-sm text-gray-600">
          Go to page:
        </label>
        <input
          id="pageInput"
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => setPage(parseInt(e.target.value) || 1)}
          className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">of {totalPages}</span>
      </div>
    </div>
  );
};

export default PaginationExample;
