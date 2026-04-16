import React from 'react';

export default function CircularProgress({ className = "" }) {
  return (
    <div className={`p-4 flex justify-center items-center ${className}`}>
       <div className="w-8 h-8 rounded-full border-4 border-[#30363d] border-t-[#1f6feb] animate-spin"></div>
    </div>
  );
}
