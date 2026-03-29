import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';

export default function Layout() {
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
