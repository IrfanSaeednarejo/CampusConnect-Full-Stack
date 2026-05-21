import useHomeTheme from "@/hooks/useHomeTheme";

export default function AnalyticsWidget({
  title,
  options = [],
  value,
  onChange,
  statLabel,
  statValue,
  trendLabel,
  trendIcon = "trending_up",
  onOpen,
  placeholder = "Analytics Chart Placeholder",
}) {
  const isDark = useHomeTheme();
  const resolvedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );

  return (
    <section
      className={`rounded-[28px] border p-5 transition-all duration-300 sm:p-6 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          : "border-[#dce4ee] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className={isDark ? "text-xl font-semibold text-[#e6edf3]" : "text-xl font-semibold text-[#162033]"}>
          {title}
        </h2>
        <select
          value={value}
          onChange={onChange}
          className={`h-10 rounded-xl border px-3 text-sm outline-none ${
            isDark
              ? "border-[#30363d] bg-[#0d1117] text-[#8b949e]"
              : "border-[#dce4ee] bg-[#f8fafc] text-[#526277]"
          }`}
        >
          {resolvedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <p className={isDark ? "text-sm text-[#8b949e]" : "text-sm text-[#526277]"}>{statLabel}</p>
        <p className={isDark ? "text-4xl font-bold text-[#e6edf3]" : "text-4xl font-bold text-[#162033]"}>
          {statValue}
        </p>
        <div className="flex items-center gap-2 text-[#238636]">
          <span className="material-symbols-outlined">{trendIcon}</span>
          <p className="text-sm font-medium">{trendLabel}</p>
        </div>
        <div
          className={`mt-4 cursor-pointer rounded-2xl border p-5 text-center transition-colors ${
            isDark
              ? "border-[#30363d] bg-[#0d1117] hover:bg-[#161b22]"
              : "border-[#dce4ee] bg-[#f8fafc] hover:bg-white"
          }`}
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              onOpen?.();
            }
          }}
        >
          <p className={isDark ? "text-sm text-[#8b949e]" : "text-sm text-[#526277]"}>📊 {placeholder}</p>
        </div>
      </div>
    </section>
  );
}
