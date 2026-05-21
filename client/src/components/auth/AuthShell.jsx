import React from "react";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function AuthShell({ children, className = "" }) {
  const isDark = useHomeTheme();

  const shellClass = isDark ? "bg-background-dark" : "bg-background-light";

  return (
    <div className={`relative flex min-h-screen w-full overflow-hidden ${shellClass} ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.10),_transparent_32%)]" />
        <div
          className={`absolute inset-x-0 top-0 h-px ${
            isDark ? "bg-border-dark" : "bg-border-light"
          }`}
        />
      </div>
      <div className="relative z-10 flex min-h-screen w-full">{children}</div>
    </div>
  );
}
