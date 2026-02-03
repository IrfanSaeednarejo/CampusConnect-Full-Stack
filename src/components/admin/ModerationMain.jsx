import React from "react";

export default function ModerationMain({
  filters,
  selectedFilter,
  setSelectedFilter,
  search,
  setSearch,
  handleBulkAction,
  selectedItems,
  filteredItems,
  handleSelectAll,
  handleSelectItem,
}) {
  // Lazy import to avoid circular dependency if needed
  const ModerationFilterBar = require("./ModerationFilterBar").default;
  const ModerationTable = require("./ModerationTable").default;

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
        Content Moderation
      </h1>
      {/* Filter bar */}
      <ModerationFilterBar
        search={search}
        setSearch={setSearch}
        onBulkAction={handleBulkAction}
        selectedItems={selectedItems}
      />
      {/* Moderation table */}
      <ModerationTable
        moderationItems={filteredItems}
        selectedItems={selectedItems}
        handleSelectAll={handleSelectAll}
        handleSelectItem={handleSelectItem}
      />
    </main>
  );
}
