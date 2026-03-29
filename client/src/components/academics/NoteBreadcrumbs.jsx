import React from 'react';
import { Link } from 'react-router-dom';

export default function NoteBreadcrumbs({ currentLabel }) {
  return (
    <nav className="mb-4 flex items-center text-sm text-[#8b949e]">
      <Link to="/academics/notes" className="hover:text-[#58a6ff]">Notes</Link>
      <span className="mx-2">/</span>
      <span className="text-[#c9d1d9] font-medium">{currentLabel}</span>
    </nav>
  );
}
