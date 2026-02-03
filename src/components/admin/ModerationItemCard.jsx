import React from "react";

export default function ModerationItemCard({
  item,
  selected,
  onSelect,
  onViewDetails,
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item.id)}
        className="rounded"
      />
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${item.typeColor}`}
          >
            {item.contentType}
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            by {item.user}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {item.dateFlagged}
          </span>
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-1">
          Flagged for: {item.flagReason}
        </p>
        {item.content && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {item.content}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewDetails(item)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          View Details
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600">
          Approve
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">
          Reject
        </button>
      </div>
    </div>
  );
}
