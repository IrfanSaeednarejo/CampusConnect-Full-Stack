import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * ProtectedRoute — gates access to authenticated sections.
 *
 * Props:
 *  requiredRole       — string | null  → if set, user must have this role in their roles[]
 *  requireOnboarding  — bool           → if true, incomplete onboarding redirects to /onboarding/welcome
 *
 * Flow:
 *  1. While loading  → show spinner
 *  2. Not auth       → /login
 *  3. onboarding incomplete (and required) → /onboarding/welcome
 *  4. role required but user doesn't have it → /error/access-denied
 *  5. Pass → <Outlet />
 */
export default function ProtectedRoute({
  requiredRole = null,
  requireOnboarding = true,
  disallowAdmin = false,
}) {
  const { isAuthenticated, roles, loading, onboardingCompleted } = useAuth();
  const isAdmin = roles.some(role => ["super_admin", "campus_admin", "admin"].includes(role));


  /* ── 1. Loading ─────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#238636] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  /* ── 2. Not authenticated ───────────────────────── */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* ── 3. Onboarding gate ─────────────────────────── */
  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  /* ── 4. Admin rejection (Student routes) ────────── */
  if (disallowAdmin && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  /* ── 5. Role gate ───────────────────────────────── */
  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/error/access-denied" replace />;
  }
  
  /* ── 6. Pass ───────────────────────────────────── */

  return <Outlet />;
}
