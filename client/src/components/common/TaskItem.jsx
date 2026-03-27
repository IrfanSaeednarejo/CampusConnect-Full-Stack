export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  className = "",
}) {
  return (
    <div
      className={`bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4 hover:border-[#238636]/50 transition-colors ${className}`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        className="w-5 h-5 mt-1 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-base font-medium ${task.completed ? "text-[#8b949e] line-through" : "text-white"}`}
        >
          {task.text}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs px-2 py-1 rounded bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
            {task.category}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded border ${
              task.priority === "high"
                ? "bg-[#da3633]/20 border-[#da3633]/50 text-[#f85149]"
                : task.priority === "medium"
                  ? "bg-[#d29922]/20 border-[#d29922]/50 text-[#e0ad3e]"
                  : "bg-[#0d1117] border-[#30363d] text-[#8b949e]"
            }`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-[#8b949e] hover:text-[#da3633] transition-colors p-2"
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  );
}
