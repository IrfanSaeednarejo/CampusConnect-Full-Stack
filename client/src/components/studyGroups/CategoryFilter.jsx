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
              ? "bg-[#238636] text-white"
              : "bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-[#c9d1d9]"
          }`}
        >
          {cat === "all" ? "All Groups" : cat}
        </button>
      ))}
    </div>
  );
}
