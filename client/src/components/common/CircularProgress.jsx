import React from 'react';
import useHomeTheme from '../../hooks/useHomeTheme';

export default function CircularProgress({ className = "" }) {
  const isDark = useHomeTheme();
  return (
    <div className={`p-4 flex justify-center items-center ${className}`}>
       <div
         className={`h-8 w-8 animate-spin rounded-full border-4 ${
           isDark
             ? "border-[#30363d] border-t-[#1f6feb]"
             : "border-slate-200 border-t-[#1D4ED8]"
         }`}
       ></div>
    </div>
  );
}
