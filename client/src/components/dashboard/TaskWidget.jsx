import Button from "@/components/common/Button";

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
	return (
		<section>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-[#c9d1d9] text-xl font-bold leading-tight tracking-tight">
					{title}
				</h2>
				{actionHref && (
					<a
						href={actionHref}
						className="text-[#238636] text-sm font-medium hover:underline"
					>
						{actionLabel}
					</a>
				)}
			</div>
			<div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
				{tasks.length === 0 ? (
					<div className="flex justify-center items-center text-center text-[#8b949e] py-10">
						<div className="flex flex-col items-center gap-2">
							<span className="text-4xl">✅</span>
							<p>No pending tasks. Enjoy your free time—or add a new task!</p>
						</div>
					</div>
				) : (
					<div className="space-y-2">
						{tasks.map((task) => (
							<div
								key={task.id}
								className="flex items-center gap-3 p-3 bg-[#0d1117] rounded border border-[#30363d]"
							>
								<input
									type="checkbox"
									checked={onTaskToggle ? task.completed : undefined}
									defaultChecked={!onTaskToggle ? task.completed : undefined}
									onChange={onTaskToggle ? () => onTaskToggle(task) : undefined}
									className="w-4 h-4"
								/>
								<p className="text-[#c9d1d9] text-sm">{task.text}</p>
							</div>
						))}
					</div>
				)}
				<div className="mt-4 flex gap-2">
					<input
						type="text"
						value={newTask}
						onChange={(event) => onTaskChange?.(event.target.value)}
						onKeyDown={(event) =>
							event.key === "Enter" ? onAddTask?.() : undefined
						}
						placeholder="Add a new task..."
						className="flex-1 px-3 py-2 rounded bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]"
					/>
					<Button onClick={onAddTask} variant="primary" className="px-4 py-2">
						Add
					</Button>
				</div>
			</div>
		</section>
	);
}
