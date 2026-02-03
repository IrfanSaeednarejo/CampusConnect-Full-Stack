import React from "react";

export default function DisputesSearchBarV2({ searchQuery, setSearchQuery }) {
  return (
    <div className="flex-grow">
      <label className="flex flex-col w-full">
        <div className="flex w-full flex-1 items-stretch rounded-lg h-10">
          <div className="text-[#8b949e] flex border border-[#30363d] bg-[#21262d] items-center justify-center pl-3 rounded-l-lg border-r-0">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#238636] focus:ring-opacity-50 border border-[#30363d] bg-[#21262d] h-full placeholder:text-[#8b949e] px-4 text-sm font-normal leading-normal"
            placeholder="Search by Case ID or username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </label>
    </div>
  );
}
