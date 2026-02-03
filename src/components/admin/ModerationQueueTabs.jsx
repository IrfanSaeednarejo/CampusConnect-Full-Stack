import React from "react";

export default function ModerationQueueTabs({ queueStatus, setQueueStatus }) {
  const tabs = ["Pending", "Reviewed", "Resolved"];
  return (
    <div className="flex items-center gap-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setQueueStatus(tab)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            queueStatus === tab
              ? "bg-primary text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
