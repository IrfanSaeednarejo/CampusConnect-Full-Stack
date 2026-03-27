export default function MentorWidget({
	title,
	actionLabel,
	actionIcon,
	onAction,
	className = "",
	headerClassName = "",
	actionClassName = "",
	children,
}) {
	return (
		<div
			className={`flex flex-col gap-4 p-6 bg-[#161b22] border border-[#30363d] rounded-xl ${className}`}
		>
			<div className={`flex items-center justify-between mb-2 ${headerClassName}`}>
				<h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
					{title}
				</h2>
				{(actionLabel || actionIcon) && (
					<button
						onClick={onAction}
						className={actionClassName}
						aria-label={actionLabel || title}
					>
						{actionLabel && <span>{actionLabel}</span>}
						{actionIcon && (
							<span className="material-symbols-outlined text-base">
								{actionIcon}
							</span>
						)}
					</button>
				)}
			</div>
			{children}
		</div>
	);
}
