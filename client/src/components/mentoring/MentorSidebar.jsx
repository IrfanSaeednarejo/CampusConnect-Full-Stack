import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/contexts/AuthContext.jsx";

const NAV_ITEMS = [
    { path: "/mentor/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/mentor/mentees", label: "Mentees", icon: "people" },
    { path: "/mentor/sessions", label: "Sessions", icon: "event_available" },
    { path: "/mentor/events", label: "Events", icon: "event" },
    { path: "/mentor/availability", label: "Availability", icon: "calendar_month" },
    { path: "/mentor/profile", label: "Profile", icon: "person" },
    { path: "/mentor/notifications", label: "Notifications", icon: "notifications" },
    { path: "/mentor/display-profile", label: "Public Profile", icon: "badge" },
];

export default function MentorSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);

    const displayName = user?.profile?.displayName || user?.name || "Mentor";

    return (
        <aside
            className={`hidden lg:flex flex-col shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto scrollbar-hide bg-surface transition-all duration-300 ease-in-out ${isExpanded ? "w-60" : "w-[68px] items-center"
                }`}
        >
            {/* Logo + Toggle */}
            <div className={`p-4 flex items-center border-b border-border ${isExpanded ? "justify-between gap-3" : "justify-center"}`}>
                {isExpanded && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-xs">CC</span>
                        </div>
                        <span className="text-text-primary font-bold text-base tracking-tight truncate">CampusConnect</span>
                    </div>
                )}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-text-secondary hover:text-text-primary p-1.5 rounded-md hover:bg-surface-hover transition-colors shrink-0"
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {isExpanded ? "left_panel_close" : "left_panel_open"}
                    </span>
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={!isExpanded ? item.label : undefined}
                            className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all no-underline ${isExpanded ? "px-3 py-2.5" : "justify-center w-10 h-10 mx-auto px-0"
                                } ${isActive
                                    ? "bg-primary/15 text-primary"
                                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                            {isExpanded && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border">
                <button
                    onClick={() => navigate("/logout")}
                    title={!isExpanded ? "Logout" : undefined}
                    className={`flex items-center gap-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors ${isExpanded ? "px-3 py-2.5" : "justify-center w-10 h-10 mx-auto px-0"
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    {isExpanded && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
