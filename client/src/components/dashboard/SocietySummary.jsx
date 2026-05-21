import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../common/Button";

export default function SocietySummary({
  title,
  societies = [],
  variant = "grid",
  actionLabel,
  actionHref,
  onAction,
  onItemClick,
  itemActionLabel = "Manage",
  onItemAction,
}) {
  const isDark = useHomeTheme();

  const renderAction = () => {
    if (actionHref) {
      return (
        <a
          href={actionHref}
          className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
        >
          {actionLabel}
        </a>
      );
    }

    if (onAction) {
      return (
        <button
          onClick={onAction}
          className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
        >
          {actionLabel}
        </button>
      );
    }

    return null;
  };

  if (variant === "list") {
    return (
      <section
        className={`flex flex-col rounded-[28px] border p-5 transition-all duration-300 sm:p-6 lg:col-span-2 ${
          isDark
            ? "border-[#30363d] bg-[#161b22] shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            : "border-[#dce4ee] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
        }`}
      >
        <div className={`mb-4 flex items-center justify-between gap-3 border-b pb-4 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
          <h2 className={isDark ? "text-xl font-semibold text-[#e6edf3]" : "text-xl font-semibold text-[#162033]"}>
            {title}
          </h2>
          {renderAction()}
        </div>
        <div className="flex flex-col gap-2">
          {societies.map((society) => (
            <div
              key={society.id}
              className={`flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors ${
                isDark ? "hover:bg-[#0d1117]" : "hover:bg-[#f8fafc]"
              }`}
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="text-3xl">{society.image}</div>
                <p className={isDark ? "flex-1 truncate text-base font-medium text-[#e6edf3]" : "flex-1 truncate text-base font-medium text-[#162033]"}>
                  {society.name}
                </p>
              </div>
              <button
                onClick={() => onItemAction?.(society)}
                className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
              >
                <span className="truncate">{itemActionLabel}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`rounded-[28px] border p-5 transition-all duration-300 sm:p-6 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          : "border-[#dce4ee] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className={`mb-4 flex items-center justify-between gap-3 border-b pb-4 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
        <h2 className={isDark ? "text-xl font-semibold text-[#e6edf3]" : "text-xl font-semibold text-[#162033]"}>
          {title}
        </h2>
        {renderAction()}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {societies.map((society) => (
          <button
            key={society.id}
            onClick={() => onItemClick?.(society)}
            className="flex cursor-pointer flex-col items-center gap-3 text-center transition-opacity hover:opacity-80"
          >
            <div
              className={`h-16 w-16 rounded-full bg-cover bg-center bg-no-repeat transition-all ${
                isDark ? "hover:ring-2 hover:ring-[#238636]" : "hover:ring-2 hover:ring-[#1D4ED8]"
              }`}
              style={{ backgroundImage: `url("${society.image}")` }}
            />
            <p className={isDark ? "text-sm font-medium text-[#e6edf3]" : "text-sm font-medium text-[#162033]"}>
              {society.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
