import React from "react";

export default function ModerationBulkActions({
  selectedItems,
  moderationItemsLength,
}) {
  if (selectedItems.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <button className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600">
        Approve Selected
      </button>
      <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">
        Reject Selected
      </button>
    </div>
  );
}
