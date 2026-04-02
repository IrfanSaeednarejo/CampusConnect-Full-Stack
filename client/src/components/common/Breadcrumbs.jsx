import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Breadcrumbs — shows navigation hierarchy.
 * Usage: <Breadcrumbs items={[{ label: 'Dashboard', to: '/student/dashboard' }, { label: 'Societies' }]} />
 * The last item is automatically the current page (no link).
 */
export default function Breadcrumbs({ items = [] }) {
  const location = useLocation();

  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-4 px-1 animate-fadeIn">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="material-symbols-outlined text-[14px] text-text-tertiary">
                chevron_right
              </span>
            )}
            {isLast || !item.to ? (
              <span className="text-text-primary font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-[#e6edf3] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
