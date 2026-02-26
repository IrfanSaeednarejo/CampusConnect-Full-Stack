import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isValidRole, getDashboardRoute, VALID_ROLES } from '../utils/authValidator';
import { getAssignedRole } from '../utils/accountService';

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
export default function ProtectedRoute({ requiredRole = null, requireOnboarding = true }) {
  const { isAuthenticated, role, loading, onboardingCompleted, user } = useAuth();

  // Show loading state while auth is initializing
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

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validate role integrity
  // Ensure user's role is a valid system role
  if (!isValidRole(role)) {
    // Role is invalid - log out user for security
    console.warn('Invalid role detected:', role);
    return <Navigate to="/login" replace />;
  }

  // IMPORTANT: Validate role matches account assignment
  // This prevents users from manually changing roles in localStorage
  if (isAuthenticated && role) {
    const assignedRole = getAssignedRole(user?.email || '');
    
    // If we can verify the account and role doesn't match assignment, block access
    if (assignedRole && assignedRole !== role) {
      console.warn(
        'Role mismatch detected: user role %s does not match assigned role %s',
        role,
        assignedRole
      );
      return <Navigate to="/login" replace />;
    }
  }

  // Check role-based access
  // If a specific role is required, validate user has that role
  if (requiredRole) {
    if (!isValidRole(requiredRole)) {
      return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
      // User doesn't have required role - show access denied page
      return <Navigate to="/error/access-denied" replace />;
    }
  }

  // Check if onboarding is required but not completed
  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  // All security checks passed - render protected routes
  return <Outlet />;
}
