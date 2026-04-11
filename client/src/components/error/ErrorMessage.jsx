export default function ErrorMessage({
	title = "Something went wrong",
	message,
	variant = "error",
	className = "",
}) {
	const variantStyles = {
		error: "border-[#DC2626] text-[#DC2626]",
		warning: "border-[#d29922] text-[#d29922]",
		info: "border-[#58a6ff] text-primary",
	};

	return (
		<div
			className={`rounded-lg border bg-background px-4 py-3 ${variantStyles[variant] || variantStyles.error} ${className}`}
			role="alert"
		>
			<div className="flex items-start gap-3">
				<span className="material-symbols-outlined">error</span>
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-text-primary">{title}</p>
					{message && <p className="text-sm text-text-secondary">{message}</p>}
				</div>
			</div>
		</div>
	);
}
