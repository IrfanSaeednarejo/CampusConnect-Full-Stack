export default function TaskProgressBar({
  completedCount,
  totalCount,
  className = "",
}) {
  const safeTotal = Math.max(totalCount, 0);
  const safeCompleted = Math.max(completedCount, 0);
  const rawPercent = safeTotal === 0 ? 0 : (safeCompleted / safeTotal) * 100;
  const progressPercent = Math.max(0, Math.min(100, Math.round(rawPercent)));

  return (
    <div
      className={`bg-surface border border-border rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">Task Progress</h3>
        <span className="text-primary font-bold">{progressPercent}%</span>
      </div>
      <div className="w-full bg-background rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-text-secondary text-sm mt-2">
        {completedCount} of {totalCount} tasks completed
      </p>
    </div>
  );
}
