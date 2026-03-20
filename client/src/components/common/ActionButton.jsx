import { Link } from "react-router-dom";

export default function ActionButton({
  icon,
  to = "",
  onClick = () => {},
  variant = "default",
  ariaLabel = "",
  title = "",
}) {
  const baseClasses =
    "flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 transition-colors";

  const variantClasses = {
    default: "bg-white/5 text-white/80 hover:text-white hover:bg-white/10",
    primary: "bg-[#238636] text-white hover:bg-[#2ea043]",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const classes = `${baseClasses} ${variantClasses[variant]}`;

  if (to) {
    return (
      <Link to={to} className={classes} title={title} aria-label={ariaLabel}>
        <span className="material-symbols-outlined">{icon}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={classes}
      title={title}
      aria-label={ariaLabel}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
