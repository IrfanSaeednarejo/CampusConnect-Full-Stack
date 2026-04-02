export default function ErrorMessage({
	title = "Something went wrong",
	message,
	variant = "error",
	className = "",
}) {
	const variantStyles = {
		error: "border-[#f85149] text-[#f85149]",
		warning: "border-[#d29922] text-[#d29922]",
		info: "border-[#58a6ff] text-[#58a6ff]",
	};

	return (
		<div
			className={`rounded-lg border bg-background px-4 py-3 ${variantStyles[variant] || variantStyles.error} ${className}`}
			role="alert"
		>
			<div className="flex items-start gap-3">
				<span className="material-symbols-outlined">error</span>
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-[#e6edf3]">{title}</p>
					{message && <p className="text-sm text-text-secondary">{message}</p>}
				</div>
			</div>
		</div>
	);
}
