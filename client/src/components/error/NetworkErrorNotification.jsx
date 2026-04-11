export default function NetworkErrorNotification({
	message = "We are having trouble connecting. Please check your connection.",
	onRetry,
	className = "",
}) {
	return (
		<div
			className={`flex items-center justify-between gap-4 rounded-lg border border-[#DC2626] bg-surface px-4 py-3 ${className}`}
			role="alert"
		>
			<div className="flex items-center gap-3">
				<span className="material-symbols-outlined text-[#DC2626]">
					wifi_off
				</span>
				<p className="text-sm text-text-primary">{message}</p>
			</div>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="text-sm font-semibold text-primary hover:underline"
				>
					Retry
				</button>
			)}
		</div>
	);
}
