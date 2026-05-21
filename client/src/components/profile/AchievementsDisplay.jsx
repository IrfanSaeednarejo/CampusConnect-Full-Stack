import useHomeTheme from "../../hooks/useHomeTheme";

const ACHIEVEMENT_CONFIG = {
  event_rank_1: { icon: "🥇", label: "1st Place", color: "border-warning/40 bg-warning/10 text-warning" },
  event_rank_2: { icon: "🥈", label: "Runner Up", color: "border-border-dark/40 bg-slate-500/10 text-text-secondary-dark dark:text-text-secondary-dark" },
  event_participant: { icon: "🎯", label: "Participant", color: "border-info/30 bg-info/10 text-info" },
  mentor_gold: { icon: "🏆", label: "Gold Mentor", color: "border-warning/40 bg-warning/10 text-warning" },
  mentor_silver: { icon: "⭐", label: "Silver Mentor", color: "border-border-dark/40 bg-slate-500/10 text-text-secondary-dark dark:text-text-secondary-dark" },
  mentor_bronze: { icon: "🎖️", label: "Bronze Mentor", color: "border-warning/30 bg-warning/10 text-warning" },
  community: { icon: "🤝", label: "Community", color: "border-primary/30 bg-primary/10 text-primary" },
  study_group: { icon: "📚", label: "Study Group", color: "border-info/30 bg-info/10 text-info" },
  streak: { icon: "🔥", label: "Streak", color: "border-danger/30 bg-danger/10 text-danger" },
  custom: { icon: "✨", label: "Achievement", color: "border-info/30 bg-info/10 text-info" },
};

function BadgeCard({ achievement }) {
  const cfg = ACHIEVEMENT_CONFIG[achievement.type] || ACHIEVEMENT_CONFIG.custom;
  const date = achievement.awardedAt
    ? new Date(achievement.awardedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  return (
    <div
      title={`${achievement.label}${date ? ` · ${date}` : ""}`}
      className={`group flex min-w-[90px] flex-shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 transition-transform hover:-translate-y-0.5 hover:shadow-lg ${cfg.color}`}
    >
      <span className="text-2xl leading-none">{cfg.icon}</span>
      <span className={`text-center text-[10px] font-bold leading-tight ${cfg.color.split(" ").find((token) => token.startsWith("text-"))}`}>
        {achievement.label || cfg.label}
      </span>
      {date && <span className="text-[9px] text-current opacity-60">{date}</span>}
    </div>
  );
}

export default function AchievementsDisplay({ profile }) {
  const isDark = useHomeTheme();
  const achievements = profile?.achievements || [];
  if (achievements.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors ${
        isDark
          ? "border-border-dark bg-surface-dark"
          : "border-border-light bg-surface-light shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
      }`}
    >
      <h2 className={`mb-4 text-lg font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>Achievements</h2>
      <div className={`flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent ${isDark ? "scrollbar-thumb-[#30363d]" : "scrollbar-thumb-slate-300"}`}>
        {achievements.map((achievement) => (
          <BadgeCard key={achievement._id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
