import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function LevelProgressBar({ summary, progress, compact = false }) {
  const isDark = useHomeTheme();
  const level = summary?.level || progress?.levelMeta?.level || 1;
  const levelMeta = progress?.levelMeta || progress || {};
  const percent = levelMeta.progressPercent || 0;
  const nextLevelAt = levelMeta.nextLevelAt || 100;
  const totalPoints = summary?.totalPoints || progress?.summary?.totalPoints || 0;

  return (
    <Card padding={compact ? "p-5" : "p-6"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
            Level Progress
          </p>
          <h3 className={isDark ? "mt-2 text-2xl font-bold text-text-primary-dark" : "mt-2 text-2xl font-bold text-text-primary-light"}>
            Level {level}
          </h3>
        </div>
        <p className={isDark ? "text-sm text-text-secondary-dark" : "text-sm text-text-secondary-light"}>
          {totalPoints} pts
        </p>
      </div>
      <ProgressBar progress={percent} className="mt-4" />
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}>
          {levelMeta.xpInLevel || 0} XP in level
        </span>
        <span className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}>
          {nextLevelAt} for next level
        </span>
      </div>
    </Card>
  );
}
