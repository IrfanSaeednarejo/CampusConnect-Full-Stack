import useHomeTheme from "../../hooks/useHomeTheme";

export default function StatCard({
  label,
  value,
  icon,
  className = "",
  isDark,
}) {
  const themeIsDark = useHomeTheme();
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : themeIsDark;

  return (
    <div
      className={`rounded-3xl border p-4 ${
        resolvedIsDark
          ? "border-[#30363d] bg-[#161b22]"
          : "border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${resolvedIsDark ? "text-[#8b949e]" : "text-slate-500"}`}>
            {label}
          </p>
          <p
            className={`text-2xl font-bold ${
              resolvedIsDark ? "text-[#238636]" : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>
        <span
          className={`material-symbols-outlined text-4xl ${
            resolvedIsDark ? "text-[#238636]" : "text-slate-400"
          }`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
