import React from "react";

const statusConfig = {
  draft: { label: "Draft", bgColor: "bg-[#30363d]/50", textColor: "text-[#8b949e]", border: "border-[#30363d]" },
  published: { label: "Published", bgColor: "bg-[#1f6feb]/20", textColor: "text-[#58a6ff]", border: "border-[#1f6feb]/30" },
  registration: { label: "Registration Open", bgColor: "bg-[#1dc964]/20", textColor: "text-[#1dc964]", border: "border-[#1dc964]/30" },
  ongoing: { label: "Ongoing", bgColor: "bg-[#d29922]/20", textColor: "text-[#e3b341]", border: "border-[#d29922]/30" },
  submission_locked: { label: "Submissions Locked", bgColor: "bg-[#f85149]/20", textColor: "text-[#ff7b72]", border: "border-[#f85149]/30" },
  judging: { label: "Judging in Progress", bgColor: "bg-[#8957e5]/20", textColor: "text-[#bc8cff]", border: "border-[#8957e5]/30" },
  completed: { label: "Completed", bgColor: "bg-[#238636]/20", textColor: "text-[#3fb950]", border: "border-[#2ea043]/30" },
  cancelled: { label: "Cancelled", bgColor: "bg-[#da3633]/20", textColor: "text-[#ff7b72]", border: "border-[#da3633]/30" },
};

export default function EventStatusBadge({ status, className = "" }) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${config.bgColor} ${config.textColor} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
}
