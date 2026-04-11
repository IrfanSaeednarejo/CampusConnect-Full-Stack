import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Avatar from "../common/Avatar";

export default function AdminTopBar({ title = "Dashboard" }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const menuRef = useRef(null);

    const displayName = user?.profile?.displayName || user?.name || "Admin";
    const email = user?.email || "";
    const avatarSrc =
        user?.profile?.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        navigate("/logout");
    };

    return (
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-40">
            {/* Left — Page Title */}
            <h2 className="text-text-primary font-semibold text-lg">{title}</h2>

            {/* Right — Search, Notifications, Profile */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center bg-background rounded-lg px-3 py-1.5 gap-2 border border-border">
                    <span className="material-symbols-outlined text-text-secondary text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && searchQuery.trim()) {
                                navigate(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
                                setSearchQuery("");
                            }
                        }}
                        className="bg-transparent text-text-primary text-sm placeholder:text-text-secondary focus:outline-none w-40"
                    />
                </div>

                {/* Notifications */}
                <button className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-hover transition-colors">
                    <span className="material-symbols-outlined text-text-secondary text-[22px]">notifications</span>
                </button>

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

                    {/* Dropdown */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[110]">
                            {/* User info header */}
                            <div className="px-4 py-3 border-b border-border bg-background/50">
                                <p className="text-sm font-bold text-text-primary truncate">{displayName}</p>
                                <p className="text-[11px] text-text-secondary truncate">{email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-primary/15 text-primary">
                                    Admin
                                </span>
                            </div>

                            <div className="py-2">
                                <button
                                    onClick={() => { setMenuOpen(false); navigate("/admin/dashboard"); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">dashboard</span>
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => { setMenuOpen(false); navigate("/admin/users"); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">manage_accounts</span>
                                    Manage Users
                                </button>
                            </div>

                            <div className="py-2 border-t border-border">
                                <button
                                    onClick={handleLogout}
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
