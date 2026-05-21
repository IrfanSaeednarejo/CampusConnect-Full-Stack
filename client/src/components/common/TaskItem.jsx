export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`flex items-start gap-4 rounded-3xl border p-4 transition-colors ${
        isDark
          ? "border-[#30363d] bg-[#161b22] hover:border-[#238636]/50"
          : "border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:border-slate-300"
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        className="w-5 h-5 mt-1 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-base font-medium ${
            task.completed
              ? isDark
                ? "text-[#8b949e] line-through"
                : "text-slate-400 line-through"
              : isDark
                ? "text-white"
                : "text-slate-900"
          }`}
        >
          {task.text}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`rounded-full border px-2 py-1 text-xs ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-[#8b949e]"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            {task.category}
          </span>
          <span
            className={`rounded-full border px-2 py-1 text-xs ${
              task.priority === "high"
                ? isDark
                  ? "bg-[#da3633]/20 border-[#da3633]/50 text-[#f85149]"
                  : "bg-rose-50 border-rose-200 text-rose-700"
                : task.priority === "medium"
                  ? isDark
                    ? "bg-[#d29922]/20 border-[#d29922]/50 text-[#e0ad3e]"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                  : isDark
                    ? "bg-[#0d1117] border-[#30363d] text-[#8b949e]"
                    : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span
            className={`rounded-full border px-2 py-1 text-xs ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-[#8b949e]"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className={`p-2 transition-colors ${
          isDark
            ? "text-[#8b949e] hover:text-[#da3633]"
            : "text-slate-400 hover:text-rose-600"
        }`}
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  );
}
