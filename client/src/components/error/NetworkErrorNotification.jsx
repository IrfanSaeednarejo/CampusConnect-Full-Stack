export default function NetworkErrorNotification({
	message = "We are having trouble connecting. Please check your connection.",
	onRetry,
	className = "",
}) {
	return (
		<div
			className={`flex items-center justify-between gap-4 rounded-lg border border-[#f85149] bg-[#161b22] px-4 py-3 ${className}`}
			role="alert"
		>
			<div className="flex items-center gap-3">
				<span className="material-symbols-outlined text-[#f85149]">
					wifi_off
				</span>
				<p className="text-sm text-[#e6edf3]">{message}</p>
			</div>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="text-sm font-semibold text-[#58a6ff] hover:underline"
				>
					Retry
				</button>
			)}
		</div>
	);
}
