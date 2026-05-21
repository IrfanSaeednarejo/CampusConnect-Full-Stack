import Card from "../common/Card";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function BadgeGrid({ badges = [], title = "Badges", compact = false }) {
  const isDark = useHomeTheme();
  const items = compact ? badges.slice(0, 4) : badges;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={isDark ? "text-lg font-semibold text-text-primary-dark" : "text-lg font-semibold text-text-primary-light"}>
          {title}
        </h3>
        <span className={isDark ? "text-xs text-text-secondary-dark" : "text-xs text-text-secondary-light"}>
          {badges.length} unlocked
        </span>
      </div>
      {items.length === 0 ? (
        <p className={isDark ? "text-sm text-text-secondary-dark" : "text-sm text-text-secondary-light"}>
          No badges unlocked yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const badge = item.badgeId || item.badge || item;
            return (
              <div
                key={item._id || badge._id || badge.key}
                className={isDark ? "rounded-2xl border border-border-dark bg-background-dark p-4" : "rounded-2xl border border-border-light bg-background-light p-4"}
              >
                <div className={isDark ? "flex h-10 w-10 items-center justify-center rounded-xl bg-info/15 text-info" : "flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info"}>
                  <span className="material-symbols-outlined">{badge.icon || "military_tech"}</span>
                </div>
                <p className={isDark ? "mt-3 text-sm font-semibold text-text-primary-dark" : "mt-3 text-sm font-semibold text-text-primary-light"}>
                  {badge.name}
                </p>
                <p className={isDark ? "mt-1 text-xs text-text-secondary-dark" : "mt-1 text-xs text-text-secondary-light"}>
                  {badge.rarity || badge.category}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
