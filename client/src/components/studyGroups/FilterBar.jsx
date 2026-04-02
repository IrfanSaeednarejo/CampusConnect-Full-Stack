export default function FilterBar({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.value
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary border border-border hover:text-text-primary"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
