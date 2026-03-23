export default function FilterButtons({
  buttons,
  activeFilter,
  onFilterChange,
  className = "",
}) {
  return (
    <div
      className={`bg-[#161b22] border border-[#30363d] rounded-lg p-4 ${className}`}
    >
      <div className="flex flex-wrap gap-3">
        {buttons.map((button) => (
          <button
            key={button.value}
            onClick={() => onFilterChange(button.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === button.value
                ? "bg-[#238636] text-[#0d1117]"
                : "bg-[#0d1117] text-[#c9d1d9] hover:bg-[#161b22]"
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
