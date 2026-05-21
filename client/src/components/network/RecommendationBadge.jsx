import React from "react";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function RecommendationBadge({ matchType }) {
  const isDark = useHomeTheme();

  if (!matchType || matchType === "New") return null;

  const isStrong = matchType === "Strong match";
  const classes = isStrong
    ? isDark
      ? "border border-primary/25 bg-primary/10 text-primary"
      : "border border-emerald-200 bg-emerald-50 text-emerald-700"
    : isDark
      ? "border border-[#d29922]/20 bg-[#d29922]/10 text-[#d29922]"
      : "border border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${classes}`}
    >
      <span className="material-symbols-outlined text-[13px]">
        {isStrong ? "star" : "bolt"}
      </span>
      {matchType}
    </span>
  );
}
