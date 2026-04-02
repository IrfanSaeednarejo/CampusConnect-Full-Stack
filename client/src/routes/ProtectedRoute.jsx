import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isValidRole, getDashboardRoute, VALID_ROLES } from '../utils/authValidator';

/**
 * ProtectedRoute Component - Secure role-based routing with validation
 * 
 * Wraps routes that require authentication
 * Validates role-based access control
 * Blocks dashboard access until onboarding is complete
 * Prevents unauthorized access through URL manipulation
 * 
 * @param {string} requiredRole - Optional role required (e.g., 'student', 'mentor', 'society_head')
 * @param {boolean} requireOnboarding - If true, requires onboarding completion before access
 * 
 * @example
 * // Protect student dashboard with role requirement
 * <Route element={<ProtectedRoute requiredRole="student" requireOnboarding={true} />}>
 *   <Route path="/student/dashboard" element={<StudentDashboard />} />
 * </Route>
 */
export default function ProtectedRoute({ requiredRole = null, requiresOnboarding = true }) {
  const { isAuthenticated, role, loading, onboardingCompleted } = useAuth();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validate role integrity
  if (!isValidRole(role)) {
    console.warn('Invalid role detected:', role);
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  // requiredRole can be a single string or an array of allowed roles
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Validate all specified roles are valid
    if (allowedRoles.some(r => !isValidRole(r))) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
      // User doesn't have any of the required roles - show access denied page
      return <Navigate to="/error/access-denied" replace />;
    }
  }

  // FIX: Only redirect to onboarding if the route actually requires it
  if (requiresOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  // All security checks passed - render protected routes
  return <Outlet />;
}
