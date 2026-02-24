/**
 * EmptyState Component
 * Reusable empty state display with icon, title, and description
 * Consolidates repeated empty state patterns across 15+ pages
 * Moved from studyGroups to common for project-wide use
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  iconSize = "6xl",
  className = "",
}) {
  const iconSizeClasses = {
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
    "8xl": "text-8xl",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {icon && (
        <span
          className={`material-symbols-outlined ${iconSizeClasses[iconSize]} text-[#8b949e] mb-4 block`}
        >
          {icon}
        </span>
      )}
      <h2 className="text-lg font-semibold text-[#c9d1d9] mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-[#8b949e] max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
