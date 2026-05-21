import React from "react";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function AuthCard({ children, className = "" }) {
  const isDark = useHomeTheme();
  const cardClass = isDark
    ? "border-border-dark bg-surface-dark shadow-[0_24px_60px_rgba(0,0,0,0.26)]"
    : "border-border-light bg-surface-light shadow-[0_18px_42px_rgba(15,23,42,0.10)]";

  return (
    <div
      className={`rounded-[28px] border ${cardClass} ${className}`}
    >
      {children}
    </div>
  );
}
