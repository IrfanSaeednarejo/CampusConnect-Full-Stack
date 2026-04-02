export default function SortControls({ sortBy, onSortChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSortChange("course")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          sortBy === "course"
            ? "bg-primary text-white"
            : "bg-surface text-text-secondary border border-border hover:text-text-primary"
        }`}
      >
        By Course
      </button>
      <button
        onClick={() => onSortChange("popularity")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          sortBy === "popularity"
            ? "bg-primary text-white"
            : "bg-surface text-text-secondary border border-border hover:text-text-primary"
        }`}
      >
        By Popularity
      </button>
    </div>
  );
}
