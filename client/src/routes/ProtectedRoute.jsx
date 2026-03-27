import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isValidRole, getDashboardRoute, VALID_ROLES } from '../utils/authValidator';
export default function ProtectedRoute({ requiredRole = null, requireOnboarding = true }) {
  const { isAuthenticated, role, loading, onboardingCompleted, user } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#238636] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isValidRole(role)) {
    console.warn('Invalid role detected:', role);
    return <Navigate to="/login" replace />;
  }
  if (requiredRole) {
    if (!isValidRole(requiredRole)) {
      return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
      return <Navigate to="/error/access-denied" replace />;
    }
  }
  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding/welcome" replace />;
  }
  return <Outlet />;
}
