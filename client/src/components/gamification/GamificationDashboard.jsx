import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearLatestRewardEvent,
  selectGamificationBadges,
  selectGamificationProgress,
  selectGamificationStreaks,
  selectGamificationSummary,
  selectGamificationTransactions,
  selectLatestRewardEvent,
} from "../../redux/slices/gamificationSlice";
import BadgeGrid from "./BadgeGrid";
import BadgeUnlockModal from "./BadgeUnlockModal";
import LevelProgressBar from "./LevelProgressBar";
import PointsCard from "./PointsCard";
import RewardToast from "./RewardToast";
import StreakCard from "./StreakCard";
import { useLanguage } from "../../hooks/useLanguage";

export default function GamificationDashboard({ compact = false }) {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const summary = useSelector(selectGamificationSummary);
  const progress = useSelector(selectGamificationProgress);
  const badges = useSelector(selectGamificationBadges);
  const streaks = useSelector(selectGamificationStreaks);
  const transactions = useSelector(selectGamificationTransactions);
  const latestRewardEvent = useSelector(selectLatestRewardEvent);

  const latestBadge = useMemo(
    () => (latestRewardEvent?.type === "badge" ? latestRewardEvent.badge : null),
    [latestRewardEvent]
  );

  return (
    <div id="rewards" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PointsCard summary={summary} />
        <StreakCard summary={summary} streaks={streaks} />
        <LevelProgressBar summary={summary} progress={progress} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BadgeGrid badges={badges} compact={compact} title={t("rewards.recentBadges")} />
        <div className="space-y-3">
          <RewardToast event={latestRewardEvent} />
          <div className="rounded-[1.5rem] border border-border-light bg-surface-light p-6 shadow-[0_14px_32px_rgba(15,23,42,0.06)] dark:border-border-dark dark:bg-surface-dark dark:shadow-[0_18px_36px_rgba(0,0,0,0.14)]">
            <h3 className="text-lg font-semibold">{t("rewards.recentRewards")}</h3>
            <div className="mt-4 space-y-3">
              {(transactions || []).slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between rounded-2xl border border-border-light bg-background-light px-4 py-3 dark:border-border-dark dark:bg-background-dark">
                  <div>
                    <p className="text-sm font-medium">{tx.actionKey}</p>
                    <p className="text-xs opacity-70">{tx.reason || t("rewards.applied")}</p>
                  </div>
                  <p className="text-sm font-bold text-info">+{tx.points}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BadgeUnlockModal badge={latestBadge} isOpen={!!latestBadge} onClose={() => dispatch(clearLatestRewardEvent())} />
    </div>
  );
}
