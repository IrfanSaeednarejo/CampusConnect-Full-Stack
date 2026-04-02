export default function FilterButtons({
  buttons,
  activeFilter,
  onFilterChange,
  className = "",
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-4 ${className}`}
    >
      <div className="flex flex-wrap gap-3">
        {buttons.map((button) => (
          <button
            key={button.value}
            onClick={() => onFilterChange(button.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === button.value
                ? "bg-primary text-[#0d1117]"
                : "bg-background text-text-primary hover:bg-surface"
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
