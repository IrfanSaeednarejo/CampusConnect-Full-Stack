import React from "react";

export default function ContactPagination() {
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-[#8b949e]">
      <p className="mb-4 sm:mb-0">Showing 1 to 4 of 32 messages</p>
      <div className="flex items-center gap-2">
        <button className="flex items-center justify-center size-8 rounded-lg border border-gray-300 dark:border-[#30363d] hover:bg-gray-100 dark:hover:bg-[#161b22]">
          <span className="material-symbols-outlined text-base">
            chevron_left
          </span>
        </button>
        <button className="flex items-center justify-center size-8 rounded-lg bg-[#238636]/20 text-[#238636]">
          1
        </button>
        <button className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#161b22]">
          2
        </button>
        <button className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#161b22]">
          3
        </button>
        <span>...</span>
        <button className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#161b22]">
          8
        </button>
        <button className="flex items-center justify-center size-8 rounded-lg border border-gray-300 dark:border-[#30363d] hover:bg-gray-100 dark:hover:bg-[#161b22]">
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}
