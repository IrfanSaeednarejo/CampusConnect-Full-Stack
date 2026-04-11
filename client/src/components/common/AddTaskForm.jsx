export default function AddTaskForm({
  newTask,
  onTaskChange,
  onAddTask,
  className = "",
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-6 sticky top-24 ${className}`}
    >
      <h2 className="text-text-primary font-bold mb-4">Add New Task</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => onTaskChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onAddTask()}
          placeholder="Task title..."
          className="w-full px-3 py-2 rounded bg-background border border-border text-text-primary placeholder-[#475569] focus:outline-none focus:border-primary"
        />
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-[#EEF2FF] gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary-hover transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
