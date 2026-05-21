import { Link } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "./Button";

export default function ActionButton({
  icon,
  to = "",
  onClick = () => {},
  variant = "ghost",
  ariaLabel = "",
  title = "",
  className = "",
  disabled = false,
}) {
  const isDark = useHomeTheme();
  const resolvedVariant = variant === "default" ? "ghost" : variant;
  const classes = getButtonClassName({
    variant: resolvedVariant,
    size: "icon-md",
    isDark,
    className,
    iconOnly: true,
  });

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        title={title}
        aria-label={ariaLabel}
      >
        <span className="material-symbols-outlined text-lg leading-none">
          {icon}
        </span>
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={classes}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      type="button"
    >
      <span className="material-symbols-outlined text-lg leading-none">
        {icon}
      </span>
    </button>
  );
}
