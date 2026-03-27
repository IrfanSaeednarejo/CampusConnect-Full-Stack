export default function TaskFilters({
  filterCategory,
  filterPriority,
  onCategoryChange,
  onPriorityChange,
  className = "",
}) {
  return (
    <div
      className={`bg-[#161b22] border border-[#30363d] rounded-lg p-6 ${className}`}
    >
      <h3 className="text-white font-bold mb-4">Filters</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#8b949e] text-sm mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] focus:outline-none focus:border-[#238636]"
          >
            <option value="all">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Society">Society</option>
            <option value="Mentoring">Mentoring</option>
            <option value="General">General</option>
          </select>
        </div>
        <div>
          <label className="block text-[#8b949e] text-sm mb-2">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] focus:outline-none focus:border-[#238636]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
