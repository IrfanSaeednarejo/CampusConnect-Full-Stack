import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import useHomeTheme from '../hooks/useHomeTheme';

/**
 * PublicLayout — used for public-facing pages (Home, About, Events list, etc.)
 * Renders the public Header + Footer only. No sidebar.
 */
export default function PublicLayout() {
  const isDark = useHomeTheme();

  return (
    <div className={`flex min-h-screen flex-col ${isDark ? 'bg-[#0d1117]' : 'bg-slate-50 text-slate-900'}`}>
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
