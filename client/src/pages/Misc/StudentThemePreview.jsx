import { useState } from "react";

/* ─── Mock data ─── */
const SIDEBAR_ITEMS = [
    { label: "Dashboard", icon: "dashboard" },
    { label: "Events", icon: "event" },
    { label: "Societies", icon: "groups" },
    { label: "Mentoring", icon: "school" },
    { label: "Tasks", icon: "task_alt" },
    { label: "Messages", icon: "chat" },
    { label: "Notes", icon: "description" },
    { label: "AI Agents", icon: "smart_toy" },
];

const STATS = [
    { label: "Upcoming Events", value: 3, icon: "event" },
    { label: "My Societies", value: 2, icon: "groups" },
    { label: "Pending Tasks", value: 5, icon: "task_alt" },
    { label: "Mentor Sessions", value: 1, icon: "school" },
];

const EVENTS = [
    { title: "Tech Fest 2026", date: "Apr 15", time: "2:00 PM", location: "Main Auditorium" },
    { title: "AI Workshop", date: "Apr 18", time: "10:00 AM", location: "CS Lab 3" },
    { title: "Career Fair", date: "Apr 22", time: "9:00 AM", location: "Convention Center" },
];

const TASKS = [
    { title: "Submit FYP Report", due: "Apr 12", done: false, priority: "high" },
    { title: "Review mentor feedback", due: "Apr 14", done: false, priority: "medium" },
    { title: "Attend society meeting", due: "Apr 10", done: true, priority: "low" },
    { title: "Complete quiz module 5", due: "Apr 16", done: false, priority: "medium" },
];

const SOCIETIES = [
    { name: "AI & ML Club", members: 45, color: "#6366f1" },
    { name: "Debate Society", members: 32, color: "#06b6d4" },
    { name: "Sports Club", members: 78, color: "#10b981" },
];


/* ═══════════════════════════════════════════════════
   THEME 1 — AURORA (Dark Navy + Indigo)
   ═══════════════════════════════════════════════════ */
function AuroraStudent() {
    const [active, setActive] = useState("Dashboard");
    return (
        <div className="flex h-[720px] rounded-2xl overflow-hidden border border-indigo-500/20 shadow-2xl" style={{ background: "#0f172a" }}>
            {/* Sidebar */}
            <aside className="w-56 flex flex-col shrink-0 border-r border-indigo-500/10" style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)" }}>
                <div className="p-4 flex items-center gap-3 border-b border-indigo-500/10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">CC</span>
                    </div>
                    <span className="text-white font-bold text-base tracking-tight">CampusConnect</span>
                </div>
                <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
                    {SIDEBAR_ITEMS.map(item => (
                        <button key={item.label} onClick={() => setActive(item.label)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active === item.label ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}>
                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>
            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between px-6 py-3 border-b border-indigo-500/10" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)" }}>
                    <div />
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-800/60 rounded-lg px-3 py-1.5 gap-2"><span className="material-symbols-outlined text-slate-400 text-[18px]">search</span><span className="text-slate-500 text-sm">Search...</span></div>
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">notifications</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h1 className="text-white text-2xl font-bold">Good Morning, Ahmed! 👋</h1>
                        <p className="text-slate-400 text-sm mt-1">Here's your campus activity for today.</p>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        {STATS.map((s, i) => {
                            const g = ["from-indigo-600 to-indigo-800", "from-cyan-600 to-cyan-800", "from-amber-600 to-amber-800", "from-emerald-600 to-emerald-800"];
                            return (
                                <div key={s.label} className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(30,41,59,0.5)" }}>
                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${g[i]} flex items-center justify-center mb-2`}><span className="material-symbols-outlined text-white text-[18px]">{s.icon}</span></div>
                                    <p className="text-white text-xl font-bold">{s.value}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>
                    {/* Events + Tasks */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(30,41,59,0.5)" }}>
                            <h3 className="text-white font-semibold mb-3">Upcoming Events</h3>
                            <div className="space-y-3">
                                {EVENTS.map(e => (
                                    <div key={e.title} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center"><span className="material-symbols-outlined text-indigo-400 text-[18px]">event</span></div>
                                        <div className="flex-1"><p className="text-slate-200 text-sm font-medium">{e.title}</p><p className="text-slate-500 text-[10px]">{e.date} • {e.time} • {e.location}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(30,41,59,0.5)" }}>
                            <h3 className="text-white font-semibold mb-3">My Tasks</h3>
                            <div className="space-y-2">
                                {TASKS.map(t => (
                                    <div key={t.title} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/5">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] ${t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600"}`}>
                                            {t.done && "✓"}
                                        </div>
                                        <div className="flex-1"><p className={`text-sm ${t.done ? "text-slate-500 line-through" : "text-slate-200"}`}>{t.title}</p></div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.priority === "high" ? "bg-red-500/20 text-red-400" : t.priority === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"}`}>{t.due}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Societies */}
                    <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(30,41,59,0.5)" }}>
                        <h3 className="text-white font-semibold mb-3">My Societies</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {SOCIETIES.map(s => (
                                <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: s.color + "30", color: s.color }}>{s.name[0]}</div>
                                    <div><p className="text-slate-200 text-sm font-medium">{s.name}</p><p className="text-slate-500 text-[10px]">{s.members} members</p></div>
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
   THEME 2 — CAMPUS (Charcoal + Teal/Emerald)
   ═══════════════════════════════════════════════════ */
function CampusStudent() {
    const [active, setActive] = useState("Dashboard");
    return (
        <div className="flex h-[720px] rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl" style={{ background: "#111827" }}>
            {/* Sidebar */}
            <aside className="w-56 flex flex-col shrink-0 border-r border-white/5" style={{ background: "#0d1117" }}>
                <div className="p-4 flex items-center gap-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><span className="text-white font-bold text-xs">CC</span></div>
                    <span className="text-white font-bold text-base tracking-tight">CampusConnect</span>
                </div>
                <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
                    {SIDEBAR_ITEMS.map(item => (
                        <button key={item.label} onClick={() => setActive(item.label)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active === item.label ? "bg-emerald-500/15 text-emerald-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>
            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between px-6 py-3 border-b border-white/5" style={{ background: "#0d1117" }}>
                    <h2 className="text-white font-semibold">Welcome, <span className="text-emerald-400">Ahmed</span></h2>
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-slate-500 text-[20px]">search</span>
                        <span className="material-symbols-outlined text-slate-500 text-[20px]">notifications</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Hero */}
                    <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #065f46, #0d9488, #0891b2)" }}>
                        <div className="flex items-center gap-6">
                            <div className="flex-1">
                                <h2 className="text-white text-xl font-bold">Your Academic Journey</h2>
                                <p className="text-white/70 text-sm mt-1">Keep up the great work this semester! You're making excellent progress.</p>
                                <div className="flex gap-3 mt-4">
                                    <button className="px-4 py-2 bg-white/20 text-white text-xs font-bold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">Book a Mentor</button>
                                    <button className="px-4 py-2 bg-white/10 text-white/80 text-xs font-medium rounded-lg hover:bg-white/20 transition-colors">Browse Events</button>
                                </div>
                            </div>
                            <div className="relative w-24 h-24">
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" /><circle cx="18" cy="18" r="15" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="71 100" strokeLinecap="round" /></svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-white text-lg font-bold">75%</span><span className="text-white/60 text-[8px]">Semester</span></div>
                            </div>
                        </div>
                    </div>
                    {/* Quick Actions + Stats */}
                    <div className="grid grid-cols-4 gap-3">
                        {STATS.map((s, i) => {
                            const colors = ["text-emerald-400", "text-teal-400", "text-amber-400", "text-cyan-400"];
                            const bgs = ["bg-emerald-500/10", "bg-teal-500/10", "bg-amber-500/10", "bg-cyan-500/10"];
                            return (
                                <div key={s.label} className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117" }}>
                                    <div className={`w-9 h-9 rounded-lg ${bgs[i]} flex items-center justify-center mb-2`}><span className={`material-symbols-outlined ${colors[i]} text-[18px]`}>{s.icon}</span></div>
                                    <p className="text-white text-xl font-bold">{s.value}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>
                    {/* 3-Col Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117" }}>
                            <h3 className="text-white font-semibold text-sm mb-3">Today's Schedule</h3>
                            <div className="space-y-2">
                                {[{ t: "9:00 AM", l: "Data Structures", c: "#6366f1" }, { t: "11:00 AM", l: "AI Workshop", c: "#10b981" }, { t: "2:00 PM", l: "FYP Meeting", c: "#f59e0b" }].map(s => (
                                    <div key={s.l} className="flex items-center gap-2 text-xs"><div className="w-1.5 h-6 rounded-full" style={{ background: s.c }}></div><div><p className="text-slate-400">{s.t}</p><p className="text-slate-200 font-medium">{s.l}</p></div></div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117" }}>
                            <h3 className="text-white font-semibold text-sm mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                {[{ l: "Book Mentor", i: "school", c: "emerald" }, { l: "Join Event", i: "event", c: "teal" }, { l: "Create Task", i: "add_task", c: "amber" }, { l: "Browse Societies", i: "groups", c: "cyan" }].map(a => (
                                    <button key={a.l} className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 border border-white/5 hover:bg-white/5 transition-colors`}>
                                        <span className={`material-symbols-outlined text-${a.c}-400 text-[16px]`}>{a.i}</span>{a.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117" }}>
                            <h3 className="text-white font-semibold text-sm mb-3">Recent Activity</h3>
                            <div className="space-y-2.5">
                                {[{ t: "Joined AI Club", d: "2h ago", i: "group_add" }, { t: "Task completed", d: "5h ago", i: "check_circle" }, { t: "Session booked", d: "1d ago", i: "calendar_add_on" }, { t: "Note created", d: "2d ago", i: "edit_note" }].map(a => (
                                    <div key={a.t} className="flex items-center gap-2.5 text-xs"><span className="material-symbols-outlined text-emerald-500/60 text-[14px]">{a.i}</span><span className="text-slate-300 flex-1">{a.t}</span><span className="text-slate-600">{a.d}</span></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Societies */}
                    <div className="grid grid-cols-3 gap-3">
                        {SOCIETIES.map(s => (
                            <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors" style={{ background: "#0d1117" }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: s.color + "20", color: s.color }}>{s.name[0]}</div>
                                <div><p className="text-slate-200 text-sm font-medium">{s.name}</p><p className="text-slate-600 text-[10px]">{s.members} members</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════
   THEME 3 — MINIMAL (Ultra-dark + Neon Purple/Blue)
   ═══════════════════════════════════════════════════ */
function MinimalStudent() {
    const [active, setActive] = useState("Dashboard");
    return (
        <div className="flex h-[720px] rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl" style={{ background: "#0a0e1a" }}>
            {/* Icon-only sidebar */}
            <aside className="w-16 flex flex-col items-center shrink-0 border-r border-white/5 py-4 gap-1" style={{ background: "#0d1117" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", boxShadow: "0 0 15px rgba(139,92,246,0.3)" }}><span className="text-white font-bold text-xs">CC</span></div>
                {SIDEBAR_ITEMS.map(item => (
                    <button key={item.label} onClick={() => setActive(item.label)} title={item.label}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${active === item.label ? "text-purple-400" : "text-slate-600 hover:text-slate-400"}`}
                        style={active === item.label ? { background: "rgba(139,92,246,0.1)", boxShadow: "0 0 12px rgba(139,92,246,0.15)" } : {}}>
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </button>
                ))}
            </aside>
            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between px-6 py-3 border-b border-white/5" style={{ background: "#0d1117" }}>
                    <h2 className="text-white font-bold text-lg">Student Hub</h2>
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-slate-600 text-[20px] hover:text-white transition-colors cursor-pointer">search</span>
                        <div className="relative"><span className="material-symbols-outlined text-slate-600 text-[20px]">notifications</span><span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: "#8b5cf6", boxShadow: "0 0 8px rgba(139,92,246,0.5)" }}></span></div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>A</div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: "#0a0e1a" }}>
                    {/* Stats strip */}
                    <div className="grid grid-cols-5 gap-3">
                        {[...STATS, { label: "My Notes", value: 12, icon: "description" }].map((s, i) => {
                            const colors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ec4899"];
                            return (
                                <div key={s.label} className="rounded-xl p-3 border border-white/5 text-center" style={{ background: "#0d1117", boxShadow: `0 0 20px ${colors[i]}08` }}>
                                    <span className="material-symbols-outlined text-[20px] mb-1" style={{ color: colors[i] }}>{s.icon}</span>
                                    <p className="text-white text-lg font-bold">{s.value}</p>
                                    <p className="text-slate-600 text-[10px]">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>
                    {/* Week strip */}
                    <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117" }}>
                        <h3 className="text-white font-semibold text-sm mb-3">My Week</h3>
                        <div className="flex gap-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                                const hasEvent = [0, 2, 4].includes(i);
                                const isToday = i === 2;
                                return (
                                    <div key={d} className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg border transition-colors ${isToday ? "border-purple-500/40 bg-purple-500/5" : "border-white/5"}`}>
                                        <span className={`text-[10px] font-medium ${isToday ? "text-purple-400" : "text-slate-600"}`}>{d}</span>
                                        <span className={`text-xs font-bold ${isToday ? "text-white" : "text-slate-400"}`}>{7 + i}</span>
                                        {hasEvent && <div className="w-1.5 h-1.5 rounded-full" style={{ background: isToday ? "#8b5cf6" : "#3b82f6", boxShadow: `0 0 6px ${isToday ? "#8b5cf6" : "#3b82f6"}` }}></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117", borderLeft: "3px solid #8b5cf6" }}>
                            <h3 className="text-white font-semibold text-sm mb-3">Active Tasks</h3>
                            <div className="space-y-2.5">
                                {TASKS.filter(t => !t.done).map(t => (
                                    <div key={t.title} className="flex items-center gap-3">
                                        <div className="flex-1"><p className="text-slate-300 text-xs">{t.title}</p>
                                            <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: t.priority === "high" ? "30%" : "60%", background: t.priority === "high" ? "#ef4444" : "#f59e0b" }}></div></div>
                                        </div>
                                        <span className="text-slate-600 text-[10px]">{t.due}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117", borderLeft: "3px solid #3b82f6" }}>
                            <h3 className="text-white font-semibold text-sm mb-3">Upcoming Events</h3>
                            <div className="space-y-2.5">
                                {EVENTS.map(e => (
                                    <div key={e.title} className="flex items-center gap-3 p-2 rounded-lg border border-white/5">
                                        <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-blue-400 text-[14px]">event</span></div>
                                        <div className="flex-1"><p className="text-slate-200 text-xs font-medium">{e.title}</p><p className="text-slate-600 text-[9px]">{e.date} • {e.time}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117", borderLeft: "3px solid #10b981" }}>
                            <h3 className="text-white font-semibold text-sm mb-3">My Mentoring</h3>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">DR</div>
                                <div><p className="text-slate-200 text-sm font-medium">Dr. Rashid</p><p className="text-slate-600 text-[10px]">Next: Thu, Apr 11 • 3:00 PM</p></div>
                            </div>
                            <button className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">Book New Session</button>
                        </div>
                        <div className="rounded-xl p-4 border border-white/5" style={{ background: "#0d1117", borderLeft: "3px solid #ec4899" }}>
                            <h3 className="text-white font-semibold text-sm mb-3">Society Updates</h3>
                            <div className="space-y-2.5">
                                {[{ t: "AI Club meeting tomorrow", d: "1h ago" }, { t: "New event by Debate Society", d: "3h ago" }, { t: "Sports Club tryouts open", d: "1d ago" }].map(u => (
                                    <div key={u.t} className="flex items-center gap-2 text-xs"><span className="material-symbols-outlined text-pink-500/60 text-[14px]">notifications</span><span className="text-slate-300 flex-1">{u.t}</span><span className="text-slate-700">{u.d}</span></div>
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
export default function StudentThemePreview() {
    const [selectedTheme, setSelectedTheme] = useState(null);

    const themes = [
        { id: "aurora", name: "Aurora", desc: "Dark navy with glassmorphism stat cards, indigo accents, and smooth gradient sidebar", component: <AuroraStudent /> },
        { id: "campus", name: "Campus", desc: "Charcoal with teal/emerald accents, hero card with semester progress, and timeline schedule", component: <CampusStudent /> },
        { id: "minimal", name: "Minimal", desc: "Ultra-dark with neon purple/blue glows, icon-only sidebar, and compact week calendar", component: <MinimalStudent /> },
    ];

    return (
        <div className="min-h-screen" style={{ background: "#030712" }}>
            <div className="text-center py-12 px-6">
                <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Student Dashboard Redesign</p>
                <h1 className="text-white text-5xl font-black tracking-tight mb-4">Choose Your Theme</h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Each theme is fully interactive — click sidebar items, explore widgets, and pick your favorite.</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20 space-y-20">
                {themes.map((theme, idx) => (
                    <div key={theme.id} className="space-y-6">
                        <div className="flex items-end justify-between">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-white/20 text-6xl font-black">0{idx + 1}</span>
                                <div><h2 className="text-white text-3xl font-bold">{theme.name}</h2><p className="text-slate-500 text-sm mt-1">{theme.desc}</p></div>
                            </div>
                            <button onClick={() => setSelectedTheme(theme.id)} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${selectedTheme === theme.id ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-slate-400 border border-white/10 hover:border-indigo-500/30 hover:text-white"}`}>
                                {selectedTheme === theme.id ? "✓ Selected" : "Select This Theme"}
                            </button>
                        </div>
                        <div className={`transition-all duration-300 ${selectedTheme === theme.id ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#030712] rounded-2xl" : ""}`}>{theme.component}</div>
                    </div>
                ))}
            </div>

            {selectedTheme && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-6" style={{ background: "rgba(13,17,23,0.95)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                    <p className="text-white font-semibold">Selected: <span className="text-indigo-400 font-bold capitalize">{selectedTheme}</span></p>
                    <button onClick={() => alert(`🎉 The "${selectedTheme}" theme will be implemented. Go back and tell me to proceed!`)}
                        className="px-6 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30">
                        Confirm & Build This Theme →
                    </button>
                </div>
            )}
        </div>
    );
}
