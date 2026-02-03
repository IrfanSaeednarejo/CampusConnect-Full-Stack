import React from "react";

export default function ResearchScratchpad() {
  return (
    <div className="bg-[#1a2a20] rounded-xl p-4 md:p-5 flex flex-col border border-[#2a3d32] shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 pb-4 border-b border-[#2a3d32]">
        Quick Note Scratchpad
      </h3>
      <textarea
        className="form-textarea w-full flex-1 min-h-[150px] resize-y overflow-y-auto rounded-lg bg-white/5 border-none text-white focus:ring-primary focus:border-primary placeholder:text-white/60 text-sm p-3"
        placeholder="Jot down quick thoughts, ideas, or to-dos..."
        style={{ scrollbarWidth: "thin" }}
      ></textarea>
      <div className="flex justify-end mt-4 gap-2">
        <button className="flex max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-1">
          <span className="material-symbols-outlined text-base">
            auto_awesome
          </span>
          <span className="truncate">AI Assist</span>
        </button>
        <button className="flex min-w-21 max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] gap-1">
          <span className="material-symbols-outlined text-base">save</span>
          <span className="truncate">Save Note</span>
        </button>
      </div>
    </div>
  );
}
