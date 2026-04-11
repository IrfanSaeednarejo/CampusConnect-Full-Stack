import { useState } from "react";

/* ─── Shared mock data ─── */
const STAT_DATA = [
    { label: "Total Users", value: "1,247", icon: "group" },
    { label: "Active Mentors", value: "38", icon: "school" },
    { label: "Societies", value: "12", icon: "groups" },
    { label: "Pending Approvals", value: "5", icon: "pending_actions" },
];

const NAV_ITEMS = [
    { label: "Dashboard", icon: "dashboard" },
    { label: "User Management", icon: "group" },
    { label: "Events", icon: "event" },
    { label: "Mentors", icon: "school" },
    { label: "Societies", icon: "groups" },
    { label: "Analytics", icon: "analytics" },
    { label: "Announcements", icon: "campaign" },
    { label: "Approval Queue", icon: "checklist" },
];

const APPROVALS = [
    { name: "Ahmed Khan", role: "Mentor", dept: "Computer Science", time: "2 hours ago" },
    { name: "Sara Malik", role: "Society Head", dept: "Business Admin", time: "5 hours ago" },
    { name: "Zain Ali", role: "Mentor", dept: "Data Science", time: "1 day ago" },
];

const ACTIVITY = [
    { text: "New student registered: Fatima Noor", time: "10 min ago", icon: "person_add" },
    { text: "Mentor application submitted: Omar Raza", time: "30 min ago", icon: "how_to_reg" },
    { text: "Society 'AI Club' created", time: "1 hour ago", icon: "group_add" },
    { text: "Event 'Tech Fest 2026' published", time: "3 hours ago", icon: "event_available" },
];

/* ═══════════════════════════════════════════════════
   THEME 1 — AURORA (Dark navy + Glass stat cards)
   ═══════════════════════════════════════════════════ */
function AuroraTheme() {
    const [active, setActive] = useState("Dashboard");
    return (
        <div className="flex h-[700px] rounded-2xl overflow-hidden border border-indigo-500/20 shadow-2xl" style={{ background: "#0f172a" }}>
            {/* Sidebar */}
            <aside className="w-60 flex flex-col shrink-0 border-r border-indigo-500/10" style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)" }}>
                <div className="p-5 flex items-center gap-3 border-b border-indigo-500/10">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">CC</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">CampusConnect</span>
                </div>
                <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.label}
                            onClick={() => setActive(item.label)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active === item.label
                                    ? "bg-indigo-600/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-indigo-500/10">
                    <p className="text-[10px] text-slate-500 text-center">CampusConnect Admin v1.0</p>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-3 border-b border-indigo-500/10" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)" }}>
                    <div className="flex items-center gap-4">
                        <h2 className="text-white font-semibold text-lg">Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-800/60 rounded-lg px-3 py-1.5 gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                            <span className="text-slate-500 text-sm">Search...</span>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined text-slate-400 text-[22px] cursor-pointer hover:text-white transition-colors">notifications</span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                            <span className="text-slate-300 text-sm font-medium">Admin</span>
                            <span className="material-symbols-outlined text-slate-500 text-[16px]">expand_more</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Welcome */}
                    <div>
                        <h1 className="text-white text-2xl font-bold">Welcome back, Admin 👋</h1>
                        <p className="text-slate-400 text-sm mt-1">Here's what's happening on your platform today.</p>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {STAT_DATA.map((s, i) => {
                            const gradients = [
                                "from-indigo-600 to-indigo-800",
                                "from-cyan-600 to-cyan-800",
                                "from-emerald-600 to-emerald-800",
                                "from-amber-600 to-amber-800",
                            ];
                            return (
                                <div key={s.label} className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(30,41,59,0.5)", backdropFilter: "blur(12px)" }}>
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradients[i]} flex items-center justify-center mb-3`}>
                                        <span className="material-symbols-outlined text-white text-[20px]">{s.icon}</span>
                                    </div>
                                    <p className="text-white text-2xl font-bold">{s.value}</p>
                                    <p className="text-slate-400 text-xs mt-1">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Chart placeholder + Approvals */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 rounded-xl p-5 border border-white/5" style={{ background: "rgba(30,41,59,0.5)" }}>
                            <h3 className="text-white font-semibold mb-4">User Growth</h3>
                            <div className="h-40 flex items-end gap-2 px-2">
                                {[35, 50, 45, 65, 55, 80, 70, 90, 85, 95, 88, 100].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:from-indigo-500 hover:to-indigo-300" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-slate-500 px-1">
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => <span key={m}>{m}</span>)}
                            </div>
                        </div>
                        <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(30,41,59,0.5)" }}>
                            <h3 className="text-white font-semibold mb-4">Approval Queue</h3>
                            <div className="space-y-3">
                                {APPROVALS.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold">{a.name[0]}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-200 text-sm font-medium truncate">{a.name}</p>
                                            <p className="text-slate-500 text-[10px]">{a.role} • {a.time}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="w-7 h-7 rounded-md bg-emerald-600/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-600/40 transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">check</span>
                                            </button>
                                            <button className="w-7 h-7 rounded-md bg-red-600/20 text-red-400 flex items-center justify-center hover:bg-red-600/40 transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(30,41,59,0.5)" }}>
                        <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
                        <div className="space-y-3">
                            {ACTIVITY.map((a, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-indigo-400 text-[18px]">{a.icon}</span>
                                    <span className="text-slate-300 flex-1">{a.text}</span>
                                    <span className="text-slate-600 text-xs whitespace-nowrap">{a.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════
   THEME 2 — GLASS (Frosted glassmorphism)
   ═══════════════════════════════════════════════════ */
function GlassTheme() {
    const [active, setActive] = useState("Dashboard");
    return (
        <div className="flex h-[700px] rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl relative">
            {/* Gradient mesh background */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 40%, #1e1b4b 70%, #312e81 100%)" }}>
                <div className="absolute top-20 left-40 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
                <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}></div>
                <div className="absolute top-40 right-60 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}></div>
            </div>

            {/* Sidebar */}
            <aside className="relative w-60 flex flex-col shrink-0 border-r border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
                <div className="p-5 flex items-center gap-3 border-b border-white/10">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="text-white font-bold text-sm">CC</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">CampusConnect</span>
                </div>
                <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.label}
                            onClick={() => setActive(item.label)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active === item.label
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            {item.label}
                            {item.label === "Approval Queue" && (
                                <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">5</span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main */}
            <div className="relative flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-3 border-b border-white/10" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}>
                    <div className="text-white/40 text-sm">Admin &gt; <span className="text-white font-medium">Dashboard</span></div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-lg px-3 py-1.5 gap-2 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <span className="material-symbols-outlined text-white/40 text-[18px]">search</span>
                            <span className="text-white/30 text-sm">Search anything...</span>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined text-white/50 text-[22px] cursor-pointer hover:text-white transition-colors">notifications</span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                            <div>
                                <p className="text-white text-xs font-semibold">Admin</p>
                                <p className="text-white/40 text-[10px]">Super Admin</p>
                            </div>
                            <span className="material-symbols-outlined text-white/40 text-[16px]">expand_more</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {STAT_DATA.map((s, i) => {
                            const accents = ["border-l-indigo-500", "border-l-cyan-500", "border-l-emerald-500", "border-l-amber-500"];
                            const iconBgs = ["from-indigo-500/20 to-indigo-600/10", "from-cyan-500/20 to-cyan-600/10", "from-emerald-500/20 to-emerald-600/10", "from-amber-500/20 to-amber-600/10"];
                            const iconColors = ["text-indigo-400", "text-cyan-400", "text-emerald-400", "text-amber-400"];
                            return (
                                <div key={s.label} className={`rounded-xl p-4 border border-white/10 border-l-4 ${accents[i]}`} style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconBgs[i]} flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined ${iconColors[i]} text-[20px]`}>{s.icon}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-white/20 text-[16px]">trending_up</span>
                                    </div>
                                    <p className="text-white text-2xl font-bold">{s.value}</p>
                                    <p className="text-white/40 text-xs mt-1">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-5 gap-4">
                        <div className="col-span-2 rounded-xl p-5 border border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
                            <h3 className="text-white font-semibold mb-4">User Distribution</h3>
                            <div className="flex items-center justify-center h-36">
                                {/* Donut chart mockup */}
                                <div className="relative w-32 h-32">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="4" />
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="50 100" strokeLinecap="round" />
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-50" strokeLinecap="round" />
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-75" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">1,247</span>
                                    </div>
                                </div>
                                <div className="ml-4 space-y-2">
                                    <div className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span><span className="text-white/60">Students (60%)</span></div>
                                    <div className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span><span className="text-white/60">Mentors (25%)</span></div>
                                    <div className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-white/60">Heads (15%)</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 rounded-xl p-5 border border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
                            <h3 className="text-white font-semibold mb-4">Platform Activity</h3>
                            <div className="h-36 flex items-end gap-3 px-2">
                                {[40, 55, 50, 70, 60, 85, 75, 92].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full rounded-t-md bg-gradient-to-t from-purple-600 to-indigo-400 transition-all hover:opacity-80" style={{ height: `${h}%` }}></div>
                                        <span className="text-[9px] text-white/30">W{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Approvals */}
                    <div className="rounded-xl p-5 border border-white/10" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
                        <h3 className="text-white font-semibold mb-4">Pending Approvals</h3>
                        <div className="space-y-2">
                            {APPROVALS.map((a, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-white font-bold text-sm">{a.name[0]}</div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{a.name}</p>
                                        <p className="text-white/40 text-xs">{a.dept}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.role === "Mentor" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"}`}>{a.role}</span>
                                    <span className="text-white/30 text-xs">{a.time}</span>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-bold hover:bg-emerald-600/40 transition-colors">Accept</button>
                                        <button className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs font-bold hover:bg-red-600/40 transition-colors">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════
   THEME 3 — NEON (Electric accents)
   ═══════════════════════════════════════════════════ */
function NeonTheme() {
    const [active, setActive] = useState("Dashboard");
    return (
        <div className="flex h-[700px] rounded-2xl overflow-hidden border border-indigo-500/20 shadow-2xl" style={{ background: "#0a0e1a" }}>
            {/* Sidebar */}
            <aside className="w-60 flex flex-col shrink-0 border-r border-indigo-500/10" style={{ background: "#0d1117" }}>
                <div className="p-5 flex items-center gap-3 border-b border-indigo-500/10">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
                        <span className="text-white font-bold text-sm">CC</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">CampusConnect</span>
                </div>
                <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.label}
                            onClick={() => setActive(item.label)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active === item.label
                                    ? "text-cyan-300"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                }`}
                            style={active === item.label ? { background: "rgba(6,182,212,0.08)", boxShadow: "inset 3px 0 0 #06b6d4" } : {}}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-3 border-t border-indigo-500/10">
                    <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-3 border-b border-white/5" style={{ background: "#0d1117" }}>
                    <h2 className="text-white font-semibold">Welcome back, <span className="text-cyan-400">Admin</span> 👋</h2>
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-slate-500 text-[22px] cursor-pointer hover:text-white transition-colors">search</span>
                        <div className="relative">
                            <span className="material-symbols-outlined text-slate-500 text-[22px] cursor-pointer hover:text-white transition-colors">notifications</span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold" style={{ background: "#06b6d4", boxShadow: "0 0 10px rgba(6,182,212,0.5)" }}>3</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer px-3 py-1.5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>A</div>
                            <span className="text-slate-300 text-sm font-medium">Admin</span>
                            <span className="material-symbols-outlined text-slate-600 text-[16px]">expand_more</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: "#0a0e1a" }}>
                    {/* Stat Cards 3x2 */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { ...STAT_DATA[0], color: "#6366f1", sparkline: [30, 45, 40, 60, 55, 70] },
                            { ...STAT_DATA[1], color: "#06b6d4", sparkline: [20, 35, 30, 50, 45, 60] },
                            { ...STAT_DATA[2], color: "#10b981", sparkline: [15, 25, 22, 35, 30, 42] },
                            { ...STAT_DATA[3], color: "#f59e0b", sparkline: [5, 8, 3, 10, 7, 12] },
                            { label: "Total Events", value: "24", icon: "event", color: "#ec4899", sparkline: [10, 15, 12, 20, 18, 25] },
                            { label: "Active Sessions", value: "7", icon: "videocam", color: "#8b5cf6", sparkline: [3, 6, 4, 8, 5, 10] },
                        ].map((s, i) => (
                            <div key={s.label} className="rounded-xl p-4 border border-white/5 flex items-start gap-4" style={{ background: "#0d1117", borderLeft: `3px solid ${s.color}` }}>
                                <div className="flex-1">
                                    <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                                    <p className="text-white text-2xl font-bold">{s.value}</p>
                                </div>
                                {/* Mini sparkline */}
                                <svg viewBox="0 0 60 30" className="w-16 h-8 mt-1">
                                    <polyline
                                        fill="none"
                                        stroke={s.color}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={s.sparkline.map((v, j) => `${j * 12},${30 - v * 0.4}`).join(" ")}
                                    />
                                </svg>
                            </div>
                        ))}
                    </div>

                    {/* Chart + Quick Actions */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 rounded-xl p-5 border border-white/5" style={{ background: "#0d1117" }}>
                            <h3 className="text-white font-semibold mb-4">Monthly Registrations</h3>
                            <div className="h-40 flex items-end gap-3 px-2">
                                {[45, 60, 52, 75, 68, 88, 80, 95, 87, 92, 78, 100].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full rounded-t-md transition-all hover:opacity-70" style={{ height: `${h}%`, background: `linear-gradient(to top, #6366f1, #06b6d4)` }}></div>
                                        <span className="text-[9px] text-slate-600">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl p-5 border border-white/5 flex flex-col" style={{ background: "#0d1117" }}>
                            <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-2 flex-1">
                                {[
                                    { label: "Manage Users", icon: "group", color: "#6366f1" },
                                    { label: "Review Approvals", icon: "checklist", color: "#06b6d4" },
                                    { label: "Create Announcement", icon: "campaign", color: "#10b981" },
                                    { label: "View Analytics", icon: "analytics", color: "#f59e0b" },
                                ].map(a => (
                                    <button key={a.label} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-white/5 text-sm font-medium text-slate-300 hover:text-white transition-all hover:border-opacity-50" style={{ ["--hover-border"]: a.color }} onMouseEnter={e => e.currentTarget.style.borderColor = a.color + 40} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
                                        <span className="material-symbols-outlined text-[18px]" style={{ color: a.color }}>{a.icon}</span>
                                        {a.label}
                                        <span className="material-symbols-outlined ml-auto text-slate-600 text-[16px]">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activity + Approvals */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-5 border border-white/5" style={{ background: "#0d1117" }}>
                            <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
                            <div className="space-y-3">
                                {ACTIVITY.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-cyan-400 text-[14px]">{a.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-300 text-sm truncate">{a.text}</p>
                                            <p className="text-slate-600 text-[10px] mt-0.5">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl p-5 border border-white/5" style={{ background: "#0d1117" }}>
                            <h3 className="text-white font-semibold mb-3">Approval Queue</h3>
                            <div className="space-y-2">
                                {APPROVALS.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>{a.name[0]}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-200 text-sm font-medium truncate">{a.name}</p>
                                            <p className="text-slate-600 text-[10px]">{a.role}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Accept</button>
                                            <button className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════
   MAIN PREVIEW PAGE
   ═══════════════════════════════════════════════════ */
export default function AdminThemePreview() {
    const [selectedTheme, setSelectedTheme] = useState(null);

    const themes = [
        { id: "aurora", name: "Aurora", desc: "Dark navy with glassmorphism cards and gradient accents", component: <AuroraTheme /> },
        { id: "glass", name: "Glass", desc: "Frosted glassmorphism with gradient mesh backdrop and glowing orbs", component: <GlassTheme /> },
        { id: "neon", name: "Neon", desc: "Ultra-dark with neon electric accents, sparkline charts, and glow effects", component: <NeonTheme /> },
    ];

    return (
        <div className="min-h-screen" style={{ background: "#030712" }}>
            {/* Hero Header */}
            <div className="text-center py-12 px-6">
                <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Admin Dashboard Redesign</p>
                <h1 className="text-white text-5xl font-black tracking-tight mb-4">Choose Your Theme</h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Each theme is fully interactive — click sidebar items, hover over cards, and explore the layout.
                    Pick the one that best represents CampusConnect.
                </p>
            </div>

            {/* Theme Previews */}
            <div className="max-w-7xl mx-auto px-6 pb-20 space-y-20">
                {themes.map((theme, idx) => (
                    <div key={theme.id} className="space-y-6">
                        {/* Theme Header */}
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-white/20 text-6xl font-black">0{idx + 1}</span>
                                    <div>
                                        <h2 className="text-white text-3xl font-bold">{theme.name}</h2>
                                        <p className="text-slate-500 text-sm mt-1">{theme.desc}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTheme(theme.id)}
                                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${selectedTheme === theme.id
                                        ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30"
                                        : "bg-white/5 text-slate-400 border border-white/10 hover:border-indigo-500/30 hover:text-white"
                                    }`}
                            >
                                {selectedTheme === theme.id ? "✓ Selected" : "Select This Theme"}
                            </button>
                        </div>

                        {/* Live Preview */}
                        <div className={`transition-all duration-300 ${selectedTheme === theme.id ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#030712] rounded-2xl" : ""}`}>
                            {theme.component}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Selection Bar */}
            {selectedTheme && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-6" style={{ background: "rgba(13,17,23,0.95)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                    <p className="text-white font-semibold">
                        Selected: <span className="text-indigo-400 font-bold capitalize">{selectedTheme}</span>
                    </p>
                    <button
                        onClick={() => alert(`🎉 Great choice! The "${selectedTheme}" theme will be implemented. Go back and tell me to proceed!`)}
                        className="px-6 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30"
                    >
                        Confirm & Build This Theme →
                    </button>
                </div>
            )}
        </div>
    );
}
