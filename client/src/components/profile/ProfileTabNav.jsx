import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../redux/slices/profileSlice";
import { User, Briefcase, FolderOpen, Trophy, Activity } from "lucide-react";

const TABS = [
    { id: "about",      label: "About",       icon: User       },
    { id: "experience", label: "Experience",  icon: Briefcase  },
    { id: "projects",   label: "Projects",    icon: FolderOpen },
    { id: "events",     label: "Events",      icon: Trophy     },
    { id: "activity",   label: "Activity",    icon: Activity   },
];

/**
 * ProfileTabNav — sticky tab bar for profile sections.
 * Props: profile {object} — to compute badge counts per tab.
 */
export default function ProfileTabNav({ profile }) {
    const dispatch  = useDispatch();
    const activeTab = useSelector((s) => s.profile.activeTab);

    const counts = {
        experience: profile?.experience?.length || 0,
        projects:   profile?.projects?.length   || 0,
        events:     profile?.eventParticipation?.length || 0,
    };

    return (
        <div className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#21262d]">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => dispatch(setActiveTab(id))}
                            className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                                activeTab === id
                                    ? "text-white"
                                    : "text-[#8b949e] hover:text-[#c9d1d9]"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {counts[id] > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    activeTab === id
                                        ? "bg-green-600 text-white"
                                        : "bg-[#21262d] text-[#8b949e]"
                                }`}>
                                    {counts[id]}
                                </span>
                            )}
                            {/* Active underline */}
                            {activeTab === id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
