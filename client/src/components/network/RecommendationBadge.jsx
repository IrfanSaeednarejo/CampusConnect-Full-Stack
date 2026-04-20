import React from 'react';

export default function RecommendationBadge({ matchType }) {
  if (!matchType || matchType === "New") return null;

  const isStrong = matchType === "Strong match";
  
  return (
    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      isStrong 
        ? "bg-[#2ea043]/10 text-[#2ea043] border border-[#2ea043]/20" 
        : "bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/20"
    }`}>
      <span className="material-symbols-outlined text-[12px]">
        {isStrong ? "star" : "bolt"}
      </span>
      {matchType}
    </div>
  );
}
