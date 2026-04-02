/**
 * IconButton Component
 * Reusable component for icon-based buttons
 * Consolidates repeated icon button patterns across the application
 */
export default function IconButton({
  icon,
  onClick,
  title = "",
  variant = "default", // default, primary, transparent
  size = "10", // 10, 12 (in Tailwind units)
  className = "",
}) {
  const variantClasses = {
    default:
      "bg-surface text-white hover:bg-[#30363d] transition-colors",
    primary: "bg-primary text-white hover:bg-[#2aaa4b] transition-colors",
    transparent:
      "bg-transparent text-text-secondary hover:bg-surface transition-colors",
  };

  const sizeClasses = {
    10: "h-10 w-10",
    12: "h-12 w-12",
  };

  return (
    <button
      className={`flex items-center justify-center rounded-lg ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
