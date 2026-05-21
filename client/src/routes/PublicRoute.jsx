import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import useHomeTheme from "../hooks/useHomeTheme";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  const isDark = useHomeTheme();

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
            Validating session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
