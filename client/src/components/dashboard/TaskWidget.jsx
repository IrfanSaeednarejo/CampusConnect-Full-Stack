import Button from "@/components/common/Button";
import useHomeTheme from "@/hooks/useHomeTheme";

export default function TaskWidget({
  title = "My Tasks",
  actionLabel = "View All Tasks",
  actionHref,
  tasks = [],
  newTask,
  onTaskChange,
  onAddTask,
  onTaskToggle,
}) {
  const isDark = useHomeTheme();

  return (
    <section
      className={`rounded-[28px] border p-5 transition-all duration-300 sm:p-6 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          : "border-[#dce4ee] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className={`mb-4 flex items-center justify-between gap-3 border-b pb-4 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
        <h2 className={isDark ? "text-xl font-semibold text-[#e6edf3]" : "text-xl font-semibold text-[#162033]"}>
          {title}
        </h2>
        {actionHref && (
          <a
            href={actionHref}
            className={isDark ? "text-sm font-medium text-[#3fb950] hover:underline" : "text-sm font-medium text-[#1D4ED8] hover:underline"}
          >
            {actionLabel}
          </a>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className={isDark ? "flex justify-center py-10 text-center text-[#8b949e]" : "flex justify-center py-10 text-center text-[#526277]"}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">✅</span>
            <p>No pending tasks. Enjoy your free time or add a new task.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#e2e8f0] bg-[#f8fafc]"
              }`}
            >
              <input
                type="checkbox"
                checked={onTaskToggle ? task.completed : undefined}
                defaultChecked={!onTaskToggle ? task.completed : undefined}
                onChange={onTaskToggle ? () => onTaskToggle(task) : undefined}
                className="h-4 w-4"
              />
              <p className={isDark ? "text-sm text-[#e6edf3]" : "text-sm text-[#162033]"}>{task.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(event) => onTaskChange?.(event.target.value)}
          onKeyDown={(event) => (event.key === "Enter" ? onAddTask?.() : undefined)}
          placeholder="Add a new task..."
          className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none ${
            isDark
              ? "border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder:text-[#8b949e]"
              : "border-[#dce4ee] bg-[#f8fafc] text-[#162033] placeholder:text-[#94a3b8]"
          }`}
        />
        <Button onClick={onAddTask} variant="primary" className="px-4 py-2">
          Add
        </Button>
      </div>
    </section>
  );
}
