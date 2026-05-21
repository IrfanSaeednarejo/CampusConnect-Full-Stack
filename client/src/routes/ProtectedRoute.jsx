import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import useHomeTheme from "../hooks/useHomeTheme";

export default function ProtectedRoute({
  requiredRole = null,
  requireOnboarding = true,
  disallowAdmin = false,
}) {
  const { isAuthenticated, user, roles, loading, onboardingCompleted } = useAuth();
  const isDark = useHomeTheme();
  const isAdmin = roles.some((role) =>
    ["super_admin", "campus_admin", "admin"].includes(role)
  );

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
        <div
          className={`flex flex-col items-center gap-4 rounded-3xl border px-8 py-7 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-surface-light shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
          }`}
        >
          <div
            className={`h-8 w-8 animate-spin rounded-full border-4 border-t-transparent ${
              isDark ? "border-primary-dark" : "border-primary-light"
            }`}
          />
          <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status === "suspended") {
    return <Navigate to="/suspended" replace />;
  }

  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  if (disallowAdmin && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/error/access-denied" replace />;
  }

  return <Outlet />;
}
