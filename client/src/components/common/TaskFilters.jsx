export default function TaskFilters({
  filterCategory,
  filterPriority,
  onCategoryChange,
  onPriorityChange,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        isDark
          ? "border-[#30363d] bg-[#161b22]"
          : "border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      <h3 className={`mb-4 text-lg font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Filters</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`mb-2 block text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Category</label>
          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`w-full rounded-2xl border px-3 py-2 focus:outline-none ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] focus:border-[#238636]"
                : "border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-400"
            }`}
          >
            <option value="all">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Society">Society</option>
            <option value="Mentoring">Mentoring</option>
            <option value="General">General</option>
          </select>
        </div>
        <div>
          <label className={`mb-2 block text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className={`w-full rounded-2xl border px-3 py-2 focus:outline-none ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] focus:border-[#238636]"
                : "border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-400"
            }`}
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
