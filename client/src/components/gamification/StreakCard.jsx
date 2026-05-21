import Card from "../common/Card";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function StreakCard({ summary, streaks = [] }) {
  const isDark = useHomeTheme();
  const defaultStreak = streaks.find((streak) => streak.streakType === "daily_activity") || streaks[0];

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
            Current Streak
          </p>
          <h3 className={isDark ? "mt-2 text-3xl font-black text-text-primary-dark" : "mt-2 text-3xl font-black text-text-primary-light"}>
            {summary?.currentStreak || defaultStreak?.currentCount || 0} days
          </h3>
        </div>
        <div className={isDark ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning" : "flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning"}>
          <span className="material-symbols-outlined text-3xl">local_fire_department</span>
        </div>
      </div>
      <p className={isDark ? "mt-3 text-sm text-text-secondary-dark" : "mt-3 text-sm text-text-secondary-light"}>
        Best streak: {summary?.longestStreak || defaultStreak?.longestCount || 0} day(s)
      </p>
    </Card>
  );
}
