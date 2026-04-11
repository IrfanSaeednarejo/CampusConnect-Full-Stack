export default function TaskFilters({
  filterCategory,
  filterPriority,
  onCategoryChange,
  onPriorityChange,
  className = "",
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-6 ${className}`}
    >
      <h3 className="text-text-primary font-bold mb-4">Filters</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Society">Society</option>
            <option value="Mentoring">Mentoring</option>
            <option value="General">General</option>
          </select>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
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
