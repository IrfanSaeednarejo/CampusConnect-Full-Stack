import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';
import AppSidebar from './AppSidebar';
import EmailVerificationBanner from './EmailVerificationBanner';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchCampusById, selectActiveCampus } from '../../redux/slices/campusSlice';
import useHomeTheme from '../../hooks/useHomeTheme';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const activeCampus = useSelector(selectActiveCampus);
  const isDark = useHomeTheme();

  useEffect(() => {
    if (user?.campusId && activeCampus?._id !== user.campusId) {
      dispatch(fetchCampusById(user.campusId));
    }
  }, [user?.campusId, activeCampus?._id, dispatch]);

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden ${
        isDark ? "bg-background-dark" : "bg-background-light"
      }`}
    >
      <GlobalNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          id="main-content"
          className={`flex flex-1 flex-col overflow-y-auto ${
            isDark ? "bg-background-dark" : "bg-background-light"
          }`}
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
