import React from 'react';
import { Link } from 'react-router-dom';

export default function NoteBreadcrumbs({ currentLabel }) {
  return (
    <nav className="mb-4 flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
      <Link to="/academics/notes" className="hover:text-info">Notes</Link>
      <span className="mx-2">/</span>
      <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{currentLabel}</span>
    </nav>
  );
}
