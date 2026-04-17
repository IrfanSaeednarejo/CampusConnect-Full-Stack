import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';
import AppSidebar from './AppSidebar';
import EmailVerificationBanner from './EmailVerificationBanner';

/**
 * AppShell — the single authenticated layout wrapper.
 *
 * Structure:
 *   ┌──────────────────────────────────────────────┐
 *   │ GlobalNavbar (sticky top)                    │
 *   ├──────────┬───────────────────────────────────┤
 *   │          │                                   │
 *   │ Sidebar  │  <Outlet /> (page content)        │
 *   │          │                                   │
 *   └──────────┴───────────────────────────────────┘
 *
 * All authenticated routes nest inside this shell.
 * Public routes use PublicLayout (Layout.jsx) instead.
 */
export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">

      {/* Top bar */}
      <GlobalNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <AppSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 flex flex-col overflow-y-auto bg-[#0d1117]"
        >
          <EmailVerificationBanner />
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
