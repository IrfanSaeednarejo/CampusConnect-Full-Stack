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

	const eventImage = event.image || event.coverImage || "";

	const isUpcoming =
		event.status === "Upcoming" ||
		event.status === "registration" ||
		event.liveStatus === "upcoming" ||
		event.liveStatus === "ongoing";

	const displayDate = event.date || (event.startAt ? new Date(event.startAt).toLocaleDateString() : event.startTime ? new Date(event.startTime).toLocaleDateString() : "TBA");
	const displaySociety = event.society?.name || event.society || event.organizer?.name || "Institution Event";
	const displayTitle = event.title || event.name || "Untitled Event";

	let displayLocation = "Online";
	if (typeof event.location === 'string') displayLocation = event.location;
	else if (event.location?.address) displayLocation = event.location.address;
	else if (event.location?.type) displayLocation = event.location.type === 'online' ? 'Online Event' : 'TBD';

	if (variant === "compact") {
		return (
			<div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
				<div className="flex flex-[2] flex-col gap-3">
					<div className="flex flex-col gap-1">
						<p className="text-text-secondary text-sm font-normal">
							{displaySociety}
						</p>
						<p className="text-text-primary text-base font-bold">
							{displayTitle}
						</p>
						<p className="text-text-secondary text-sm font-normal">
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
		<div className="flex items-center gap-4 p-4 rounded-lg bg-[#FFFFFF] border border-[#C7D2FE] hover:border-primary transition-colors duration-200">
			<div
				className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-cover bg-center"
				style={{ backgroundImage: `url("${eventImage}")` }}
			/>
			<div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<div className="flex flex-col">
					<h3 className="text-lg font-semibold text-text-primary">
						{displayTitle}
					</h3>
					<p className="text-text-secondary text-sm">
						{displayDate} • {displayLocation}
					</p>
					<p className="text-primary text-xs font-medium uppercase tracking-wider">{displaySociety}</p>
					<div className="flex gap-2 mt-2">
						{(event.tags || []).map((tag, idx) => (
							<span
								key={idx}
								className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-2 sm:items-end">
					<span
						className={`px-2 py-1 text-xs font-semibold rounded-sm uppercase tracking-wider whitespace-nowrap ${isUpcoming
							? "bg-primary text-white"
							: "bg-text-secondary text-white"
							}`}
					>
						{isUpcoming ? (event.liveStatus === "ongoing" ? "Live Now" : "Upcoming") : "Past Event"}
					</span>
					<div className="flex gap-2">
						<button
							onClick={isUpcoming ? onPrimaryAction : undefined}
							className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${isUpcoming
								? "bg-primary text-white hover:bg-[#3FB950]"
								: "bg-[#C7D2FE] text-text-secondary cursor-not-allowed opacity-70"
								}`}
						>
							{isUpcoming ? (event.isRegistered ? "Registered" : "Register") : "Closed"}
						</button>
						<button
							onClick={onSecondaryAction}
							className="px-3 py-1 text-sm font-medium rounded-md border border-[#C7D2FE] text-text-primary hover:bg-[#C7D2FE] transition-colors"
						>
							Details
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
