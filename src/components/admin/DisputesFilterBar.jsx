import React from "react";

export default function DisputesFilterBar() {
  return (
    <div className="flex gap-2">
      <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-button-secondary-dark border border-border-dark px-4 hover:bg-border-dark transition-colors">
        <p className="text-text-primary-dark text-sm font-medium leading-normal">
          Issue Type
        </p>
        <span className="material-symbols-outlined text-text-secondary-dark text-base">
          expand_more
        </span>
      </button>
      <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-button-secondary-dark border border-border-dark px-4 hover:bg-border-dark transition-colors">
        <p className="text-text-primary-dark text-sm font-medium leading-normal">
          Status
        </p>
        <span className="material-symbols-outlined text-text-secondary-dark text-base">
          expand_more
        </span>
      </button>
    </div>
  );
}
