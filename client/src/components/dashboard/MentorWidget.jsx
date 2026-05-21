import useHomeTheme from "@/hooks/useHomeTheme";

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
  const isDark = useHomeTheme();

  return (
    <div
      className={`flex flex-col gap-4 rounded-[28px] border p-5 transition-all duration-300 sm:p-6 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          : "border-[#dce4ee] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
      } ${className}`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b pb-4 ${
          isDark ? "border-[#30363d]" : "border-[#e2e8f0]"
        } ${headerClassName}`}
      >
        <h2 className={isDark ? "text-xl font-semibold text-[#e6edf3]" : "text-xl font-semibold text-[#162033]"}>
          {title}
        </h2>
        {(actionLabel || actionIcon) && (
          <button onClick={onAction} className={actionClassName} aria-label={actionLabel || title}>
            {actionLabel && <span>{actionLabel}</span>}
            {actionIcon && <span className="material-symbols-outlined text-base">{actionIcon}</span>}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
