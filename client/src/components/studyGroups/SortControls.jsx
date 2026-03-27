export default function SortControls({ sortBy, onSortChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSortChange("course")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          sortBy === "course"
            ? "bg-[#238636] text-white"
            : "bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-[#c9d1d9]"
        }`}
      >
        By Course
      </button>
      <button
        onClick={() => onSortChange("popularity")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          sortBy === "popularity"
            ? "bg-[#238636] text-white"
            : "bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-[#c9d1d9]"
        }`}
      >
        By Popularity
      </button>
    </div>
  );
}
