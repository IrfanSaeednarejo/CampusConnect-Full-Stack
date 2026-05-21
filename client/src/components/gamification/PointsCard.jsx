import Card from "../common/Card";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function PointsCard({ summary }) {
  const isDark = useHomeTheme();

  return (
    <Card className={isDark ? "bg-gradient-to-br from-info/10 via-surface-dark to-surface-dark" : "bg-gradient-to-br from-info/10 via-white to-white"}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
            Total Points
          </p>
          <h3 className={isDark ? "mt-2 text-3xl font-black text-text-primary-dark" : "mt-2 text-3xl font-black text-text-primary-light"}>
            {summary?.totalPoints || 0}
          </h3>
          <p className={isDark ? "mt-2 text-sm text-text-secondary-dark" : "mt-2 text-sm text-text-secondary-light"}>
            Available: {summary?.availablePoints || 0}
          </p>
        </div>
        <div className={isDark ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-info/15 text-info" : "flex h-14 w-14 items-center justify-center rounded-2xl bg-info/10 text-info"}>
          <span className="material-symbols-outlined text-3xl">workspace_premium</span>
        </div>
      </div>
    </Card>
  );
}
