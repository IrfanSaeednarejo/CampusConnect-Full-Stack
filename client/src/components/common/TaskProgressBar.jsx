export default function TaskProgressBar({
  completedCount,
  totalCount,
  className = "",
  isDark = true,
}) {
  const safeTotal = Math.max(totalCount, 0);
  const safeCompleted = Math.max(completedCount, 0);
  const rawPercent = safeTotal === 0 ? 0 : (safeCompleted / safeTotal) * 100;
  const progressPercent = Math.max(0, Math.min(100, Math.round(rawPercent)));

  return (
    <div
      className={`rounded-3xl border p-6 ${
        isDark
          ? "border-[#30363d] bg-[#161b22]"
          : "border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Task Progress</h3>
        <span className={`font-bold ${isDark ? "text-[#238636]" : "text-slate-900"}`}>{progressPercent}%</span>
      </div>
      <div className={`h-3 w-full overflow-hidden rounded-full ${isDark ? "bg-[#0d1117]" : "bg-slate-100"}`}>
        <div
          className={`h-full transition-all duration-300 ${isDark ? "bg-[#238636]" : "bg-slate-900"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className={`mt-2 text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
        {completedCount} of {totalCount} tasks completed
      </p>
    </div>
  );
}
