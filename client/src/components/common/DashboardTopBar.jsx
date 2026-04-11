import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useTheme } from "@/hooks/useTheme";
import Avatar from "../common/Avatar";

/**
 * Shared top bar component used across all 4 dashboards (Admin, Student, Mentor, Society Head).
 * Props:
 *  - title (string) — page title
 *  - searchPlaceholder (string) — placeholder for search input
 *  - onSearch (fn) — called with query on Enter; if omitted, search is hidden
 *  - notificationsPath (string) — route to notifications page; if omitted, bell is hidden
 *  - profilePath (string) — route to profile page on avatar click
 *  - roleBadge (string) — role label shown in dropdown (e.g. "Admin", "Mentor")
 *  - children — extra buttons/items placed before the right-side icons
 */
export default function DashboardTopBar({
    title = "Dashboard",
    searchPlaceholder = "Search...",
    onSearch,
    notificationsPath,
    profilePath,
    roleBadge,
    children,
}) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const menuRef = useRef(null);

    const displayName = user?.profile?.displayName || user?.name || "User";
    const email = user?.email || "";
    const avatarSrc =
        user?.profile?.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

    // Close dropdown on outside click
    useEffect(() => {
        const handle = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    return (
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
            {/* Left — Title */}
            <h2 className="text-text-primary font-semibold text-lg">{title}</h2>

            {/* Right — extras, search, dark mode, notifications, profile */}
            <div className="flex items-center gap-3">
                {children}

                {/* Search */}
                {onSearch && (
                    <div className="hidden md:flex items-center bg-background rounded-lg px-3 py-1.5 gap-2 border border-border">
                        <span className="material-symbols-outlined text-text-secondary text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchQuery.trim()) {
                                    onSearch(searchQuery.trim());
                                    setSearchQuery("");
                                }
                            }}
                            className="bg-transparent text-text-primary text-sm placeholder:text-text-secondary focus:outline-none w-36"
                        />
                    </div>
                )}

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-hover transition-colors"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <span className="material-symbols-outlined text-text-secondary text-[22px]">
                        {isDark ? "light_mode" : "dark_mode"}
                    </span>
                </button>

                {/* Notifications */}
                {notificationsPath && (
                    <button
                        onClick={() => navigate(notificationsPath)}
                        className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                        <span className="material-symbols-outlined text-text-secondary text-[22px]">notifications</span>
                    </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2 focus:outline-none group transition-all"
                        aria-haspopup="true"
                        aria-expanded={menuOpen}
                    >
                        <Avatar
                            src={avatarSrc}
                            size="8"
                            border
                            className={`group-hover:border-primary transition-colors ${menuOpen ? "border-primary" : ""}`}
                        />
                        <span className="text-text-primary text-sm font-medium hidden sm:block">{displayName}</span>
                        <span className="material-symbols-outlined text-text-secondary text-sm">
                            {menuOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[110]">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-border bg-background/50">
                                <p className="text-sm font-bold text-text-primary truncate">{displayName}</p>
                                <p className="text-[11px] text-text-secondary truncate">{email}</p>
                                {roleBadge && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-primary/15 text-primary">
                                        {roleBadge}
                                    </span>
                                )}
                            </div>

                            <div className="py-2">
                                {profilePath && (
                                    <button
                                        onClick={() => { setMenuOpen(false); navigate(profilePath); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">person</span>
                                        View Profile
                                    </button>
                                )}
                                <button
                                    onClick={() => { setMenuOpen(false); toggleTheme(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">{isDark ? "light_mode" : "dark_mode"}</span>
                                    {isDark ? "Light Mode" : "Dark Mode"}
                                </button>
                            </div>

                            <div className="py-2 border-t border-border">
                                <button
                                    onClick={() => { setMenuOpen(false); navigate("/logout"); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
