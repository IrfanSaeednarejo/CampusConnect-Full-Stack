import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * RoleGuard — inline component that renders children ONLY when the
 * authenticated user holds the required role(s).
 *
 * Usage (render nothing when role absent):
 *   <RoleGuard role="mentor">
 *     <MentorWidgets />
 *   </RoleGuard>
 *
 * Usage (redirect when role absent):
 *   <RoleGuard role="admin" redirectTo="/error/access-denied">
 *     <AdminPanel />
 *   </RoleGuard>
 *
 * Props:
 *  role        — string   — single role to check
 *  roles       — string[] — OR: array of roles (any match passes)
 *  redirectTo  — string | null — if provided, redirect instead of rendering null
 *  children    — ReactNode
 *  fallback    — ReactNode — rendered when role missing (default: null)
 */
export default function RoleGuard({
  role,
  roles: requiredRoles,
  redirectTo = null,
  fallback = null,
  children,
}) {
  const { roles: userRoles, loading } = useAuth();

  if (loading) return null;

  // Build the set of required roles from either the `role` or `roles` prop
  const targets = requiredRoles ?? (role ? [role] : []);

  const hasAccess = targets.length === 0 || targets.some((r) => userRoles.includes(r));

  if (!hasAccess) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return fallback;
  }

  return <>{children}</>;
}
