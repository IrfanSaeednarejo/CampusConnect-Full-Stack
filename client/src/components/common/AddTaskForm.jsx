export default function AddTaskForm({
  newTask,
  onTaskChange,
  onAddTask,
  className = "",
}) {
  return (
    <div
      className={`bg-[#161b22] border border-[#30363d] rounded-lg p-6 sticky top-24 ${className}`}
    >
      <h2 className="text-white font-bold mb-4">Add New Task</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => onTaskChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onAddTask()}
          placeholder="Task title..."
          className="w-full px-3 py-2 rounded bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]"
        />
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#238636] text-[#0d1117] gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2ea043] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
