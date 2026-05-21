import React from "react";
import useHomeTheme from "@/hooks/useHomeTheme";

const statusConfig = {
  draft: { label: "Draft", dark: "bg-[#30363d]/50 text-[#8b949e] border-[#30363d]", light: "bg-slate-100 text-slate-600 border-slate-200" },
  published: { label: "Published", dark: "bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/30", light: "bg-blue-50 text-blue-700 border-blue-200" },
  registration: { label: "Registration Open", dark: "bg-[#1dc964]/20 text-[#1dc964] border-[#1dc964]/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ongoing: { label: "Ongoing", dark: "bg-[#d29922]/20 text-[#e3b341] border-[#d29922]/30", light: "bg-amber-50 text-amber-700 border-amber-200" },
  submission_locked: { label: "Submissions Locked", dark: "bg-[#f85149]/20 text-[#ff7b72] border-[#f85149]/30", light: "bg-rose-50 text-rose-700 border-rose-200" },
  judging: { label: "Judging in Progress", dark: "bg-info/10 text-info border-info/20", light: "bg-info/10 text-info border-info/20" },
  completed: { label: "Completed", dark: "bg-[#238636]/20 text-[#3fb950] border-[#2ea043]/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", dark: "bg-[#da3633]/20 text-[#ff7b72] border-[#da3633]/30", light: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function EventStatusBadge({ status, className = "", isDark: forcedIsDark }) {
  const hookIsDark = useHomeTheme();
  const isDark = forcedIsDark ?? hookIsDark;
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
        isDark ? config.dark : config.light
      } ${className}`}
    >
      {config.label}
    </span>
  );
}
