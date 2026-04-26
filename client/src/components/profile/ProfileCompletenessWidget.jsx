import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

const STEPS = [
    { key: "avatar",      label: "Add a profile photo",        weight: 10, path: "/profile/manage", field: "profile.avatar"      },
    { key: "headline",    label: "Write your headline",         weight: 10, path: "/profile/manage", field: "profile.headline"    },
    { key: "bio",         label: "Write your bio",              weight: 10, path: "/profile/manage", field: "profile.bio"         },
    { key: "academic",    label: "Add academic info",           weight: 10, path: "/profile/manage", field: "academic.department" },
    { key: "experience",  label: "Add first experience",        weight: 15, path: "/profile/view#experience" },
    { key: "projects",    label: "Showcase a project",          weight: 10, path: "/profile/view#projects"  },
    { key: "social",      label: "Add a social link",           weight: 10, path: "/profile/manage" },
    { key: "interests",   label: "Add 3+ interests",            weight: 10, path: "/profile/manage" },
    { key: "cover",       label: "Add a cover image",           weight: 5,  path: "/profile/manage", field: "profile.coverImage"  },
    { key: "email",       label: "Verify your email",           weight: 10, path: "/profile/account-settings" },
];

function getCompletedKeys(profile) {
    if (!profile) return new Set();
    const completed = new Set();
    if (profile.profile?.avatar)              completed.add("avatar");
    if (profile.profile?.headline?.trim())    completed.add("headline");
    if (profile.profile?.bio?.trim())         completed.add("bio");
    if (profile.academic?.department || profile.academic?.degree) completed.add("academic");
    if (profile.experience?.length > 0)       completed.add("experience");
    if (profile.projects?.length > 0)         completed.add("projects");
    if (profile.socialLinks?.length > 0)      completed.add("social");
    if (profile.interests?.length >= 3)       completed.add("interests");
    if (profile.profile?.coverImage)          completed.add("cover");
    if (profile.emailVerified)                completed.add("email");
    return completed;
}

/**
 * ProfileCompletenessWidget — shown only on own profile.
 * Displays animated ring + action checklist of incomplete steps.
 */
export default function ProfileCompletenessWidget({ profile }) {
    const navigate   = useNavigate();
    const score      = profile?.profileCompleteness ?? 0;
    const completed  = getCompletedKeys(profile);
    const incomplete = STEPS.filter((s) => !completed.has(s.key));

    if (score >= 100 || incomplete.length === 0) return null;

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (score / 100) * circumference;
    const ringColor = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-5">
                {/* Ring */}
                <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1e293b" strokeWidth="5" />
                        <circle cx="36" cy="36" r={radius} fill="none" stroke={ringColor} strokeWidth="5"
                            strokeDasharray={circumference} strokeDashoffset={progress}
                            strokeLinecap="round" className="transition-all duration-700" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-xl leading-none">{score}%</span>
                        <span className="text-[#8b949e] text-[10px]">complete</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-white font-bold">Complete your profile</h3>
                    <p className="text-[#8b949e] text-xs mt-0.5">
                        {incomplete.length} step{incomplete.length > 1 ? "s" : ""} left — profiles with 100% get 3× more views
                    </p>
                </div>
            </div>

            {/* Incomplete steps */}
            <div className="space-y-2">
                {incomplete.slice(0, 4).map((step) => (
                    <button key={step.key} onClick={() => navigate(step.path)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-green-500/40 rounded-xl text-left transition-all group">
                        <div className="flex items-center gap-2.5">
                            <Circle className="w-4 h-4 text-[#30363d] group-hover:text-green-500 transition-colors flex-shrink-0" />
                            <span className="text-[#c9d1d9] text-xs font-medium group-hover:text-white transition-colors">{step.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-[#8b949e] font-bold">+{step.weight}%</span>
                            <ArrowRight className="w-3 h-3 text-[#8b949e] group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </button>
                ))}
                {incomplete.length > 4 && (
                    <p className="text-center text-[#8b949e] text-xs pt-1">
                        +{incomplete.length - 4} more step{incomplete.length - 4 > 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {/* Completed steps */}
            <div className="mt-4 pt-4 border-t border-[#21262d] flex flex-wrap gap-1.5">
                {STEPS.filter((s) => completed.has(s.key)).map((step) => (
                    <div key={step.key} className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> {step.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
