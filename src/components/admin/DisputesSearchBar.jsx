import React from "react";

export default function DisputesSearchBar({ query, setQuery }) {
  return (
    <div className="flex-grow">
      <label className="flex flex-col w-full">
        <div className="flex w-full flex-1 items-stretch rounded-lg h-10">
          <div className="text-text-secondary-dark flex border border-border-dark bg-button-secondary-dark items-center justify-center pl-3 rounded-l-lg border-r-0">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 border border-border-dark bg-button-secondary-dark h-full placeholder:text-text-secondary-dark px-4 text-sm font-normal leading-normal"
            placeholder="Search by Case ID or username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </label>
    </div>
  );
}
