import { getButtonClassName } from "./Button";

export default function FilterButtons({
  buttons,
  activeFilter,
  onFilterChange,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`rounded-3xl border p-4 ${
        isDark
          ? "border-border-dark bg-surface-dark"
          : "border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      <div className="flex flex-wrap gap-3">
        {buttons.map((button) => (
          <button
            key={button.value}
            type="button"
            onClick={() => onFilterChange(button.value)}
            className={getButtonClassName({
              variant: activeFilter === button.value ? "primary" : "secondary",
              size: "sm",
              isDark,
            })}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
