const iconMap = {
	campaign: "📢",
	event_available: "📅",
	chat: "💬",
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
					{notifications.map((notif) => (
						<li key={notif.id} className="p-4 hover:bg-white/5 rounded-md">
							<div className="flex items-start gap-3">
								<div className="bg-[#238636]/20 rounded-full p-2 mt-1 text-[#238636] text-lg">
									{iconMap[notif.icon] || "🔔"}
								</div>
								<div>
									<p className="text-[#c9d1d9] text-sm">{notif.title}</p>
									<p className="text-[#8b949e] text-xs mt-1">{notif.time}</p>
								</div>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
