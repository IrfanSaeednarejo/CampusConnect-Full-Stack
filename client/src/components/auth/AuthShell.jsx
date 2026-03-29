import React from "react";

export default function AuthShell({ children, className = "" }) {
  return (
    <div className={`flex min-h-screen w-full ${className}`}>
      {children}
    </div>
  );
}
