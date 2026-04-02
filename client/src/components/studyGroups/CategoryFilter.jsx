export default function CategoryFilter({
  categories,
  activeFilter,
  onFilterChange,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === cat
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary border border-border hover:text-text-primary"
          }`}
        >
          {cat === "all" ? "All Groups" : cat}
        </button>
      ))}
    </div>
  );
}
