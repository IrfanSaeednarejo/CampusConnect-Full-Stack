import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import Button from "./Button";

/**
 * Advanced Pagination Component with page size selection and navigation
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageSizeSelector = false,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  showInfo = true,
  totalItems,
  className = "",
  ...props
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    onPageSizeChange?.(newPageSize);
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(
    currentPage * pageSize,
    totalItems || totalPages * pageSize
  );

  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 ${className}`}
      {...props}
    >
      {/* Page Size Selector */}
      {showPageSizeSelector && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2"
        >
          <span className="material-symbols-outlined text-sm">
            chevron_left
          </span>
        </Button>

        {/* Page Numbers */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <motion.button
                type="button"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handlePageChange(page)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {page}
              </motion.button>
            )}
          </React.Fragment>
        ))}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2"
        >
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
        </Button>
      </div>

      {/* Info */}
      {showInfo && totalItems && (
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  showPageSizeSelector: PropTypes.bool,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageSizeChange: PropTypes.func,
  showInfo: PropTypes.bool,
  totalItems: PropTypes.number,
  className: PropTypes.string,
};

export default Pagination;
