const iconMap = {
	campaign: "📢",
	event_available: "📅",
	chat: "💬",
	mentor_booking: "👨‍🏫",
	session: "👨‍🏫",
	event: "📅",
	society: "🏛️",
};

export default function NotificationWidget({
	title = "Notifications",
	linkLabel = "See All",
	linkHref,
	notifications = [],
}) {
	return (
		<section>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-[#c9d1d9] text-xl font-bold leading-tight tracking-tight">
					{title}
				</h2>
				{linkHref && (
					<a
						href={linkHref}
						className="text-[#238636] text-sm font-medium hover:underline"
					>
						{linkLabel}
					</a>
				)}
			</div>
			<div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2">
				<ul className="divide-y divide-[#30363d]">
					{notifications.length > 0 ? (
						notifications.slice(0, 5).map((notif) => (
							<li key={notif._id || notif.id} className="p-4 hover:bg-white/5 rounded-md transition-colors">
								<div className="flex items-start gap-3">
									<div className="bg-[#238636]/20 rounded-full p-2 mt-1 text-[#238636] text-lg leading-none">
										{iconMap[notif.type] || "🔔"}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-[#c9d1d9] text-sm font-medium truncate">{notif.title}</p>
										<p className="text-[#8b949e] text-[10px] mt-1">
											{notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : (notif.time || "Recently")}
										</p>
									</div>
									{!notif.read && (
										<div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
									)}
								</div>
							</li>
						))
					) : (
						<li className="p-8 text-center text-[#8b949e] text-sm italic">
							No notifications yet.
						</li>
					)}
				</ul>
			</div>
		</section>
	);
}
