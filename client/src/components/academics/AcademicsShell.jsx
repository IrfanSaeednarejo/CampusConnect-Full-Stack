import React from "react";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function AcademicsShell({ children, className = "" }) {
  const isDark = useHomeTheme();

  return (
    <div
      className={`flex min-h-screen flex-col p-4 sm:p-6 ${
        isDark ? "bg-background-dark" : "bg-slate-50"
      } ${className}`}
    >
      {children}
    </div>
  );
}
