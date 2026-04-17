import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';

/**
 * PublicLayout — used for public-facing pages (Home, About, Events list, etc.)
 * Renders the public Header + Footer only. No sidebar.
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117]">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
