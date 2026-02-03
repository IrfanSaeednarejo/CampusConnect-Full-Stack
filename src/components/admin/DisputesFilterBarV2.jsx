import React from "react";

export default function DisputesFilterBarV2() {
  return (
    <div className="flex gap-2">
      <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#21262d] border border-[#30363d] px-4 hover:bg-[#30363d] transition-colors">
        <p className="text-[#c9d1d9] text-sm font-medium leading-normal">
          Issue Type
        </p>
        <span className="material-symbols-outlined text-[#8b949e] text-base">
          expand_more
        </span>
      </button>
      <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#21262d] border border-[#30363d] px-4 hover:bg-[#30363d] transition-colors">
        <p className="text-[#c9d1d9] text-sm font-medium leading-normal">
          Status
        </p>
        <span className="material-symbols-outlined text-[#8b949e] text-base">
          expand_more
        </span>
      </button>
    </div>
  );
}
