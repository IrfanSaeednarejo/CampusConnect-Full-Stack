import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGamificationAnalyticsAnomalies,
  fetchGamificationAnalyticsBadges,
  fetchGamificationAnalyticsCertificates,
  fetchGamificationAnalyticsLeaderboards,
  fetchGamificationAnalyticsOverview,
  selectGamificationAnalytics,
} from "../../redux/slices/gamificationSlice";
import Card from "../common/Card";
import LeaderboardTable from "./LeaderboardTable";

export default function AdminGamificationAnalytics() {
  const dispatch = useDispatch();
  const analytics = useSelector(selectGamificationAnalytics);

  useEffect(() => {
    dispatch(fetchGamificationAnalyticsOverview());
    dispatch(fetchGamificationAnalyticsLeaderboards());
    dispatch(fetchGamificationAnalyticsBadges());
    dispatch(fetchGamificationAnalyticsCertificates());
    dispatch(fetchGamificationAnalyticsAnomalies());
  }, [dispatch]);

  const overview = analytics.overview || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          ["Points Awarded", overview.totalPointsAwarded || 0],
          ["Active Users", overview.activeUsers || 0],
          ["Transactions", overview.totalTransactions || 0],
          ["Badges Unlocked", overview.badgesUnlocked || 0],
          ["Certificates", overview.certificatesIssued || 0],
        ].map(([label, value]) => (
          <Card key={label} padding="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
            <h3 className="mt-2 text-2xl font-black">{value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LeaderboardTable rows={analytics.leaderboards?.global || []} title="Top Students" dense />
        <Card>
          <h3 className="text-lg font-semibold">Suspicious Activity</h3>
          <div className="mt-4 space-y-3">
            {(analytics.anomalies || []).slice(0, 8).map((item, index) => (
              <div key={index} className="rounded-2xl border border-border-light bg-background-light px-4 py-3 dark:border-border-dark dark:bg-background-dark">
                <p className="text-sm font-semibold">{String(item._id?.userId || "User")}</p>
                <p className="text-xs opacity-70">{item.totalPoints} pts • {item.transactionCount} transactions • {item._id?.day}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
