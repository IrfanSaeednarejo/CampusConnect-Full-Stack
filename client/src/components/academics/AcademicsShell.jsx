import React from 'react';

export default function AcademicsShell({ children, className = "" }) {
  return (
    <div className={`flex flex-col min-h-screen bg-[#0d1117] p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}
