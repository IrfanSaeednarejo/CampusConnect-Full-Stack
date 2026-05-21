import Card from "../common/Card";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function LeaderboardTable({ rows = [], title = "Leaderboard", dense = false }) {
  const isDark = useHomeTheme();

  return (
    <Card padding={dense ? "p-5" : "p-6"}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={isDark ? "text-lg font-semibold text-text-primary-dark" : "text-lg font-semibold text-text-primary-light"}>
          {title}
        </h3>
      </div>
      {rows.length === 0 ? (
        <p className={isDark ? "text-sm text-text-secondary-dark" : "text-sm text-text-secondary-light"}>
          No leaderboard data yet.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={`${row.userId}-${index}`}
              className={isDark ? "flex items-center justify-between rounded-2xl border border-border-dark bg-background-dark px-4 py-3" : "flex items-center justify-between rounded-2xl border border-border-light bg-background-light px-4 py-3"}
            >
              <div className="flex items-center gap-3">
                <span className={isDark ? "w-7 text-sm font-bold text-info" : "w-7 text-sm font-bold text-info"}>
                  #{row.rank || index + 1}
                </span>
                <img
                  src={row.profile?.avatar || "/default-avatar.png"}
                  alt={row.profile?.displayName || "Student"}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className={isDark ? "text-sm font-semibold text-text-primary-dark" : "text-sm font-semibold text-text-primary-light"}>
                    {row.profile?.displayName || "Student"}
                  </p>
                </div>
              </div>
              <p className={isDark ? "text-sm font-bold text-text-primary-dark" : "text-sm font-bold text-text-primary-light"}>
                {row.points} pts
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
