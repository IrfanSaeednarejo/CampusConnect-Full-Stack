import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    { label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { label: "User Management", icon: "group", path: "/admin/users" },
    { label: "Mentors", icon: "school", path: "/admin/mentor-approvals" },
    { label: "Societies", icon: "groups", path: "/admin/societies" },
    { label: "Approval Queue", icon: "checklist", path: "/admin/society-head-approvals" },
];

export default function AdminSidebar({ pendingCount = 0 }) {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(true);

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

            {/* Nav Items */}
            <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
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
                            {isExpanded && <span className="flex-1 truncate">{item.label}</span>}
                            {isExpanded && item.label === "Approval Queue" && pendingCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                                    {pendingCount > 9 ? "9+" : pendingCount}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border">
                <p className={`text-[10px] text-text-secondary ${isExpanded ? "text-center" : "hidden"}`}>
                    CampusConnect Admin v1.0
                </p>
            </div>
        </aside>
    );
}
