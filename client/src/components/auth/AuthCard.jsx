import React from "react";

export default function AuthCard({ children, className = "" }) {
  return (
    <div className={`bg-[#1c2620] shadow-md border border-[#3d5246] rounded-xl ${className}`}>
      {children}
    </div>
  );
}
