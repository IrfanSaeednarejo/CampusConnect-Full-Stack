import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#238636] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm">Validating session…</p>
        </div>
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
