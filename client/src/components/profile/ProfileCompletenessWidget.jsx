import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import useHomeTheme from "../../hooks/useHomeTheme";

const STEPS = [
    { key: "avatar", label: "Add a profile photo", weight: 10, path: "/profile/manage", field: "profile.avatar" },
    { key: "headline", label: "Write your headline", weight: 10, path: "/profile/manage", field: "profile.headline" },
    { key: "bio", label: "Write your bio", weight: 10, path: "/profile/manage", field: "profile.bio" },
    { key: "academic", label: "Add academic info", weight: 10, path: "/profile/manage", field: "academic.department" },
    { key: "experience", label: "Add first experience", weight: 15, path: "/profile/view#experience" },
    { key: "projects", label: "Showcase a project", weight: 10, path: "/profile/view#projects" },
    { key: "social", label: "Add a social link", weight: 10, path: "/profile/manage" },
    { key: "interests", label: "Add 3+ interests", weight: 10, path: "/profile/manage" },
    { key: "cover", label: "Add a cover image", weight: 5, path: "/profile/manage", field: "profile.coverImage" },
    { key: "email", label: "Verify your email", weight: 10, path: "/profile/account-settings" },
];

function getCompletedKeys(profile) {
    if (!profile) return new Set();
    const completed = new Set();
    if (profile.profile?.avatar) completed.add("avatar");
    if (profile.profile?.headline?.trim()) completed.add("headline");
    if (profile.profile?.bio?.trim()) completed.add("bio");
    if (profile.academic?.department || profile.academic?.degree) completed.add("academic");
    if (profile.experience?.length > 0) completed.add("experience");
    if (profile.projects?.length > 0) completed.add("projects");
    if (profile.socialLinks?.length > 0) completed.add("social");
    if (profile.interests?.length >= 3) completed.add("interests");
    if (profile.profile?.coverImage) completed.add("cover");
    if (profile.emailVerified) completed.add("email");
    return completed;
}

export default function ProfileCompletenessWidget({ profile }) {
    const navigate = useNavigate();
    const isDark = useHomeTheme();
    const score = profile?.profileCompleteness ?? 0;
    const completed = getCompletedKeys(profile);
    const incomplete = STEPS.filter((step) => !completed.has(step.key));

    if (score >= 100 || incomplete.length === 0) return null;

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (score / 100) * circumference;
    const ringColor = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <div
            className={`rounded-2xl p-6 transition-colors ${
                isDark
                    ? "border border-[#30363d] bg-[#161b22]"
                    : "border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            }`}
        >
            <div className="mb-5 flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r={radius} fill="none" stroke={isDark ? "#1e293b" : "#dbe4ee"} strokeWidth="5" />
                        <circle
                            cx="36"
                            cy="36"
                            r={radius}
                            fill="none"
                            stroke={ringColor}
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={progress}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-bold leading-none ${isDark ? "text-white" : "text-slate-900"}`}>{score}%</span>
                        <span className={`text-[10px] ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>complete</span>
                    </div>
                </div>
                <div>
                    <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Complete your profile</h3>
                    <p className={`mt-0.5 text-xs ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                        {incomplete.length} step{incomplete.length > 1 ? "s" : ""} left - profiles with 100% get 3x more views
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {incomplete.slice(0, 4).map((step) => (
                    <button
                        key={step.key}
                        onClick={() => navigate(step.path)}
                        className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            isDark
                                ? "border-[#30363d] bg-[#0d1117] hover:border-green-500/40 hover:bg-[#21262d]"
                                : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-slate-100"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <Circle className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-[#30363d] group-hover:text-green-500" : "text-slate-300 group-hover:text-emerald-500"}`} />
                            <span className={`text-xs font-medium ${isDark ? "text-[#c9d1d9] group-hover:text-white" : "text-slate-700 group-hover:text-slate-900"}`}>{step.label}</span>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1.5">
                            <span className={`text-[10px] font-bold ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>+{step.weight}%</span>
                            <ArrowRight className={`h-3 w-3 transition-all group-hover:translate-x-0.5 ${isDark ? "text-[#8b949e] group-hover:text-green-400" : "text-slate-400 group-hover:text-emerald-600"}`} />
                        </div>
                    </button>
                ))}
                {incomplete.length > 4 && (
                    <p className={`pt-1 text-center text-xs ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                        +{incomplete.length - 4} more step{incomplete.length - 4 > 1 ? "s" : ""}
                    </p>
                )}
            </div>

            <div className={`mt-4 flex flex-wrap gap-1.5 border-t pt-4 ${isDark ? "border-[#21262d]" : "border-slate-200"}`}>
                {STEPS.filter((step) => completed.has(step.key)).map((step) => (
                    <div key={step.key} className="flex items-center gap-1 text-[10px] font-medium text-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        {step.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
