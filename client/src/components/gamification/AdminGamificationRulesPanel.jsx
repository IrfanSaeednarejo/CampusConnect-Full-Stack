import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adjustGamificationPointsThunk,
  awardGamificationBadgeThunk,
  createGamificationRuleThunk,
  fetchGamificationRules,
  issueGamificationCertificateThunk,
  rebuildGamificationLeaderboardThunk,
  selectGamificationRules,
  updateGamificationRuleThunk,
} from "../../redux/slices/gamificationSlice";
import Card from "../common/Card";
import { getButtonClassName } from "../common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import toast from "react-hot-toast";

export default function AdminGamificationRulesPanel() {
  const dispatch = useDispatch();
  const rules = useSelector(selectGamificationRules);
  const isDark = useHomeTheme();
  const [form, setForm] = useState({ actionKey: "", module: "", description: "", points: 0, dailyCap: 0 });
  const [manualPoints, setManualPoints] = useState({ userId: "", points: 0, reason: "" });
  const [manualBadge, setManualBadge] = useState({ userId: "", badgeId: "", reason: "" });
  const [manualCertificate, setManualCertificate] = useState({ userId: "", sourceModel: "Event", sourceId: "", type: "event_attendance", title: "" });

  useEffect(() => {
    dispatch(fetchGamificationRules());
  }, [dispatch]);

  const saveRule = async () => {
    try {
      await dispatch(createGamificationRuleThunk(form)).unwrap();
      toast.success("Rule created");
      setForm({ actionKey: "", module: "", description: "", points: 0, dailyCap: 0 });
    } catch (err) {
      toast.error(err || "Failed to create rule");
    }
  };

  const toggleRule = async (rule) => {
    try {
      await dispatch(updateGamificationRuleThunk({ ruleId: rule._id, payload: { isActive: !rule.isActive } })).unwrap();
      toast.success("Rule updated");
    } catch (err) {
      toast.error(err || "Failed to update rule");
    }
  };

  const submitManualPoints = async () => {
    try {
      await dispatch(adjustGamificationPointsThunk({ ...manualPoints, points: Number(manualPoints.points) })).unwrap();
      toast.success("Points adjusted");
    } catch (err) {
      toast.error(err || "Failed to adjust points");
    }
  };

  const submitBadge = async () => {
    try {
      await dispatch(awardGamificationBadgeThunk(manualBadge)).unwrap();
      toast.success("Badge awarded");
    } catch (err) {
      toast.error(err || "Failed to award badge");
    }
  };

  const submitCertificate = async () => {
    try {
      await dispatch(issueGamificationCertificateThunk(manualCertificate)).unwrap();
      toast.success("Certificate issued");
    } catch (err) {
      toast.error(err || "Failed to issue certificate");
    }
  };

  const rebuildBoards = async () => {
    try {
      await dispatch(rebuildGamificationLeaderboardThunk({ scopeType: "global", scopeId: "all", period: "all_time" })).unwrap();
      toast.success("Leaderboard rebuilt");
    } catch (err) {
      toast.error(err || "Failed to rebuild leaderboard");
    }
  };

  const inputClass = isDark
    ? "rounded-xl border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-primary-dark"
    : "rounded-xl border border-border-light bg-background-light px-3 py-2 text-sm text-text-primary-light";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="text-lg font-semibold">Reward Rules</h3>
        <div className="mt-4 grid gap-3">
          <input className={inputClass} placeholder="actionKey" value={form.actionKey} onChange={(e) => setForm((prev) => ({ ...prev, actionKey: e.target.value }))} />
          <input className={inputClass} placeholder="module" value={form.module} onChange={(e) => setForm((prev) => ({ ...prev, module: e.target.value }))} />
          <input className={inputClass} placeholder="description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <input className={inputClass} placeholder="points" type="number" value={form.points} onChange={(e) => setForm((prev) => ({ ...prev, points: e.target.value }))} />
          <input className={inputClass} placeholder="daily cap" type="number" value={form.dailyCap} onChange={(e) => setForm((prev) => ({ ...prev, dailyCap: e.target.value }))} />
          <button className={getButtonClassName({ variant: "primary", size: "md", isDark })} onClick={saveRule}>Create Rule</button>
        </div>
        <div className="mt-6 space-y-3">
          {rules.slice(0, 8).map((rule) => (
            <div key={rule._id} className="flex items-center justify-between rounded-2xl border border-border-light bg-background-light px-4 py-3 dark:border-border-dark dark:bg-background-dark">
              <div>
                <p className="text-sm font-semibold">{rule.actionKey}</p>
                <p className="text-xs opacity-70">{rule.points} pts • {rule.module}</p>
              </div>
              <button className={getButtonClassName({ variant: rule.isActive ? "secondary" : "warning", size: "sm", isDark })} onClick={() => toggleRule(rule)}>
                {rule.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Manual Controls</h3>
        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Point adjustment</p>
            <input className={inputClass} placeholder="userId" value={manualPoints.userId} onChange={(e) => setManualPoints((prev) => ({ ...prev, userId: e.target.value }))} />
            <input className={inputClass} placeholder="points" type="number" value={manualPoints.points} onChange={(e) => setManualPoints((prev) => ({ ...prev, points: e.target.value }))} />
            <input className={inputClass} placeholder="reason" value={manualPoints.reason} onChange={(e) => setManualPoints((prev) => ({ ...prev, reason: e.target.value }))} />
            <button className={getButtonClassName({ variant: "secondary", size: "sm", isDark })} onClick={submitManualPoints}>Adjust Points</button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Manual badge award</p>
            <input className={inputClass} placeholder="userId" value={manualBadge.userId} onChange={(e) => setManualBadge((prev) => ({ ...prev, userId: e.target.value }))} />
            <input className={inputClass} placeholder="badgeId" value={manualBadge.badgeId} onChange={(e) => setManualBadge((prev) => ({ ...prev, badgeId: e.target.value }))} />
            <input className={inputClass} placeholder="reason" value={manualBadge.reason} onChange={(e) => setManualBadge((prev) => ({ ...prev, reason: e.target.value }))} />
            <button className={getButtonClassName({ variant: "secondary", size: "sm", isDark })} onClick={submitBadge}>Award Badge</button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Manual certificate issue</p>
            <input className={inputClass} placeholder="userId" value={manualCertificate.userId} onChange={(e) => setManualCertificate((prev) => ({ ...prev, userId: e.target.value }))} />
            <input className={inputClass} placeholder="sourceId" value={manualCertificate.sourceId} onChange={(e) => setManualCertificate((prev) => ({ ...prev, sourceId: e.target.value }))} />
            <input className={inputClass} placeholder="title" value={manualCertificate.title} onChange={(e) => setManualCertificate((prev) => ({ ...prev, title: e.target.value }))} />
            <button className={getButtonClassName({ variant: "secondary", size: "sm", isDark })} onClick={submitCertificate}>Issue Certificate</button>
          </div>

          <button className={getButtonClassName({ variant: "primary", size: "md", isDark })} onClick={rebuildBoards}>
            Rebuild Leaderboards
          </button>
        </div>
      </Card>
    </div>
  );
}
