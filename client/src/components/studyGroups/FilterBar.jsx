export default function FilterBar({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.value
              ? "bg-[#238636] text-white"
              : "bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-[#c9d1d9]"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
