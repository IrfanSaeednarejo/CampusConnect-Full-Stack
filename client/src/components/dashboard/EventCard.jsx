import Button from "@/components/common/Button";

export default function EventCard({
	event,
	variant = "catalog",
	onPrimaryAction,
	onSecondaryAction,
}) {
	if (!event) {
		return null;
	}

	const eventImage = event.image || event.coverImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuD9RA_fMuSaLKstjcMP5ozR-vSaxtqQ_kzINRu0QEbitLaiaOGSvhHQ0t3zi1Py769dste1tAWujcMGzeKsHP3LIDU8GpBrAtxlzAEKMTgoN2PCuAMYnxMVStac_6sgv9hNluDqsTZg4B7sFD-1sE6Uqn7KpdMC_eKzapyTUfan20XYGE2tBdjBB1D9B7MnCMh1-NNhn67QqbuDD5OKhys_-_9nTeollnRzd23QBgopcA4rmFIaSDdXU_42pp-765L5mTwpjWlySM8";

	const isUpcoming = 
		event.status === "Upcoming" || 
		event.status === "registration" || 
		event.liveStatus === "upcoming" || 
		event.liveStatus === "ongoing";

	const displayDate = event.date || (event.startAt || event.startTime ? new Date(event.startAt || event.startTime).toLocaleDateString() : "TBA");
	const displaySociety = event.society?.name || event.society || "Institution Event";

	if (variant === "compact") {
		return (
			<div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 p-4 border border-[#30363d] rounded-lg hover:border-[#238636]/50 transition-colors">
				<div className="flex flex-[2] flex-col gap-3">
					<div className="flex flex-col gap-1">
						<p className="text-[#8b949e] text-sm font-normal">
							{displaySociety}
						</p>
						<p className="text-[#c9d1d9] text-base font-bold">
							{event.title}
						</p>
						<p className="text-[#8b949e] text-sm font-normal">
							{displayDate}
						</p>
					</div>
					<Button
						onClick={onPrimaryAction}
						variant="secondary"
						className="h-8 px-3 text-sm w-fit"
					>
						<span className="truncate">Join Event</span>
						<span className="text-lg">→</span>
					</Button>
				</div>
				<div
					className="w-full sm:w-48 rounded-lg flex-1 bg-cover bg-center bg-no-repeat aspect-video sm:aspect-square"
					style={{ backgroundImage: `url("${eventImage}")` }}
				/>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-4 p-4 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#238636] transition-colors duration-200">
			<div
				className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-cover bg-center"
				style={{ backgroundImage: `url("${eventImage}")` }}
			/>
			<div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<div className="flex flex-col">
					<h3 className="text-lg font-semibold text-[#E6EDF3]">
						{event.title}
					</h3>
					<p className="text-[#8B949E] text-sm">
						{displayDate} • {event.location || "Online"}
					</p>
					<p className="text-[#238636] text-xs font-medium uppercase tracking-wider">{displaySociety}</p>
					<div className="flex gap-2 mt-2">
						{(event.tags || []).map((tag, idx) => (
							<span
								key={idx}
								className="px-2 py-0.5 text-xs rounded-full bg-[#238636]/20 text-[#238636]"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-2 sm:items-end">
					<span
						className={`px-2 py-1 text-xs font-semibold rounded-sm uppercase tracking-wider whitespace-nowrap ${
							isUpcoming
								? "bg-[#238636] text-white"
								: "bg-[#484F58] text-white"
						}`}
					>
						{isUpcoming ? (event.liveStatus === "ongoing" ? "Live Now" : "Upcoming") : "Past Event"}
					</span>
					<div className="flex gap-2">
						<button
							onClick={isUpcoming ? onPrimaryAction : undefined}
							className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
								isUpcoming
									? "bg-[#238636] text-white hover:bg-[#3FB950]"
									: "bg-[#30363D] text-[#8B949E] cursor-not-allowed opacity-70"
							}`}
						>
							{isUpcoming ? (event.isRegistered ? "Registered" : "Register") : "Closed"}
						</button>
						<button
							onClick={onSecondaryAction}
							className="px-3 py-1 text-sm font-medium rounded-md border border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D] transition-colors"
						>
							Details
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
