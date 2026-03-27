export default function SocietySummary({
	title,
	societies = [],
	variant = "grid",
	actionLabel,
	actionHref,
	onAction,
	onItemClick,
	itemActionLabel = "Manage",
	onItemAction,
}) {
	const renderAction = () => {
		if (actionHref) {
			return (
				<a
					href={actionHref}
					className="text-[#238636] text-sm font-medium hover:underline"
				>
					{actionLabel}
				</a>
			);
		}

		if (onAction) {
			return (
				<button
					onClick={onAction}
					className="text-[#238636] text-sm font-medium hover:underline"
				>
					{actionLabel}
				</button>
			);
		}

		return null;
	};

	if (variant === "list") {
		return (
			<section className="lg:col-span-2 bg-[#1a241e] border border-[#29382f] rounded-lg p-6 flex flex-col">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
						{title}
					</h2>
					{renderAction()}
				</div>
				<div className="flex flex-col gap-2 -mx-2">
					{societies.map((society) => (
						<div
							key={society.id}
							className="flex items-center gap-4 px-2 py-2.5 rounded-md hover:bg-white/5 transition-colors"
						>
							<div className="flex items-center gap-4 flex-1">
								<div className="text-3xl">{society.image}</div>
								<p className="text-white text-base font-medium leading-normal flex-1 truncate">
									{society.name}
								</p>
							</div>
							<button
								onClick={() => onItemAction?.(society)}
								className="flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-8 px-4 bg-[#29382f] text-white text-sm font-medium leading-normal w-fit hover:bg-[#29382f]/80 transition-colors"
							>
								<span className="truncate">{itemActionLabel}</span>
							</button>
						</div>
					))}
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-[#c9d1d9] text-xl font-bold leading-tight tracking-tight">
					{title}
				</h2>
				{renderAction()}
			</div>
			<div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{societies.map((society) => (
						<button
							key={society.id}
							onClick={() => onItemClick?.(society)}
							className="flex flex-col items-center gap-2 text-center hover:opacity-80 transition-opacity cursor-pointer"
						>
							<div
								className="w-16 h-16 rounded-full bg-cover bg-center bg-no-repeat hover:ring-2 hover:ring-[#238636] transition-all"
								style={{ backgroundImage: `url("${society.image}")` }}
							/>
							<p className="text-[#c9d1d9] text-sm font-medium">
								{society.name}
							</p>
						</button>
					))}
				</div>
			</div>
		</section>
	);
}
