import React from 'react';
import useHomeTheme from '../../hooks/useHomeTheme';
import { getButtonClassName } from './Button';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = "" 
}) => {
  const isDark = useHomeTheme();

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
  const ellipsisClass = isDark ? 'text-text-secondary-dark' : 'text-slate-400';

  return (
    <nav className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={getButtonClassName({
          variant: 'secondary',
          size: 'icon-md',
          isDark,
        })}
      >
        <span className="material-symbols-outlined text-xl">chevron_left</span>
      </button>

      <div className="flex items-center gap-1">
        {uniquePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={`w-8 text-center font-bold ${ellipsisClass}`}>...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={getButtonClassName({
                  variant: currentPage === page ? 'primary' : 'secondary',
                  size: 'icon-md',
                  isDark,
                })}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={getButtonClassName({
          variant: 'secondary',
          size: 'icon-md',
          isDark,
        })}
      >
        <span className="material-symbols-outlined text-xl">chevron_right</span>
      </button>
    </nav>
  );
};

export default Pagination;
