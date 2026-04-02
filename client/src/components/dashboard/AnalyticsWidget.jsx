export default function AnalyticsWidget({
	title,
	options = [],
	value,
	onChange,
	statLabel,
	statValue,
	trendLabel,
	trendIcon = "trending_up",
	onOpen,
	placeholder = "Analytics Chart Placeholder",
}) {
	const resolvedOptions = options.map((option) =>
		typeof option === "string"
			? { label: option, value: option }
			: option
	);

	return (
		<section className="bg-surface border border-border rounded-lg p-6">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
					{title}
				</h2>
				<select
					value={value}
					onChange={onChange}
					className="bg-surface-hover text-text-secondary text-sm rounded-md border-none focus:ring-2 focus:ring-[#1dc964] h-9"
				>
					{resolvedOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>
			<div className="flex flex-col gap-4">
				<p className="text-sm text-text-secondary">{statLabel}</p>
				<p className="text-4xl font-black text-white">{statValue}</p>
				<div className="flex items-center gap-2 text-[#1dc964]">
					<span className="material-symbols-outlined">{trendIcon}</span>
					<p className="text-sm font-medium">{trendLabel}</p>
				</div>
				<div
					className="mt-4 bg-background rounded-md p-4 text-center cursor-pointer"
					onClick={onOpen}
					role="button"
					tabIndex={0}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							onOpen?.();
						}
					}}
				>
					<p className="text-text-secondary text-sm">📊 {placeholder}</p>
				</div>
			</div>
		</section>
	);
}
