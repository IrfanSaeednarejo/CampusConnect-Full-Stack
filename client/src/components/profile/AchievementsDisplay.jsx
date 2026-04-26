/** AchievementsDisplay — horizontal badge strip. */
const ACHIEVEMENT_CONFIG = {
    event_rank_1:     { icon: "🥇", label: "1st Place", color: "from-amber-500/30 to-amber-600/10 border-amber-500/40 text-amber-300" },
    event_rank_2:     { icon: "🥈", label: "Runner Up",  color: "from-zinc-400/20 to-zinc-500/10 border-zinc-400/30 text-zinc-300"   },
    event_participant:{ icon: "🎯", label: "Participant", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300"   },
    mentor_gold:      { icon: "🏆", label: "Gold Mentor", color: "from-amber-400/30 to-yellow-500/10 border-amber-400/40 text-amber-200" },
    mentor_silver:    { icon: "⭐", label: "Silver Mentor",color: "from-slate-300/20 to-slate-400/10 border-slate-300/30 text-slate-200" },
    mentor_bronze:    { icon: "🎖️", label: "Bronze Mentor",color: "from-orange-600/20 to-orange-700/10 border-orange-500/30 text-orange-300" },
    community:        { icon: "🤝", label: "Community",   color: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-300" },
    study_group:      { icon: "📚", label: "Study Group",  color: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-300" },
    streak:           { icon: "🔥", label: "Streak",       color: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-300" },
    custom:           { icon: "✨", label: "Achievement",   color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300" },
};

function BadgeCard({ achievement }) {
    const cfg = ACHIEVEMENT_CONFIG[achievement.type] || ACHIEVEMENT_CONFIG.custom;
    const date = achievement.awardedAt
        ? new Date(achievement.awardedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "";

    return (
        <div title={`${achievement.label}${date ? ` · ${date}` : ""}`}
            className={`group flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 bg-gradient-to-b ${cfg.color} border rounded-2xl min-w-[90px] cursor-default transition-transform hover:-translate-y-0.5 hover:shadow-lg`}>
            <span className="text-2xl leading-none">{cfg.icon}</span>
            <span className={`text-[10px] font-bold text-center leading-tight ${cfg.color.split(" ").find(c => c.startsWith("text-"))}`}>
                {achievement.label || cfg.label}
            </span>
            {date && <span className="text-[9px] text-current opacity-60">{date}</span>}
        </div>
    );
}

export default function AchievementsDisplay({ profile }) {
    const achievements = profile?.achievements || [];
    if (achievements.length === 0) return null;

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">Achievements</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#30363d]">
                {achievements.map((a) => (
                    <BadgeCard key={a._id} achievement={a} />
                ))}
            </div>
        </div>
    );
}
