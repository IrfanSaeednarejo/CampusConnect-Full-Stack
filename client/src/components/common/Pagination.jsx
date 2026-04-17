import React from 'react';

/**
 * Reusable Pagination component for navigating structured lists.
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = "" 
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const range = 2; // Number of pages to show before and after current

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - range && i <= currentPage + range)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - range - 1) || 
      (i === currentPage + range + 1)
    ) {
      pages.push('...');
    }
  }

  const uniquePages = pages.filter((item, index) => pages.indexOf(item) === index);

  return (
    <nav className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#30363d] text-gray-400 hover:text-white hover:bg-[#1f242c] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <span className="material-symbols-outlined text-xl">chevron_left</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {uniquePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="w-8 text-center text-gray-500 font-bold">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#1f6feb] text-white shadow-lg shadow-[#1f6feb]/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#1f242c]'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#30363d] text-gray-400 hover:text-white hover:bg-[#1f242c] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <span className="material-symbols-outlined text-xl">chevron_right</span>
      </button>
    </nav>
  );
};

export default Pagination;
