import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';
import AppSidebar from './AppSidebar';
import EmailVerificationBanner from './EmailVerificationBanner';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchCampusById, selectActiveCampus } from '../../redux/slices/campusSlice';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const activeCampus = useSelector(selectActiveCampus);

  useEffect(() => {
    if (user?.campusId && activeCampus?._id !== user.campusId) {
      dispatch(fetchCampusById(user.campusId));
    }
  }, [user?.campusId, activeCampus?._id, dispatch]);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">
      MenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
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
