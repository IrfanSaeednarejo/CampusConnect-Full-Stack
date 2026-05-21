export default function AddTaskForm({
  newTask,
  onTaskChange,
  onAddTask,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`sticky top-24 rounded-3xl border p-6 ${
        isDark
          ? "border-[#30363d] bg-[#161b22]"
          : "border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      <h2 className={`mb-4 text-lg font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Add New Task</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => onTaskChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onAddTask()}
          placeholder="Task title..."
          className={`w-full rounded-2xl border px-3 py-2 focus:outline-none ${
            isDark
              ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] placeholder-[#8b949e] focus:border-[#238636]"
              : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-slate-400"
          }`}
        />
        <button
          onClick={onAddTask}
          className={`flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 text-sm font-semibold tracking-[0.015em] transition-colors ${
            isDark
              ? "bg-[#238636] text-[#0d1117] hover:bg-[#2ea043]"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
