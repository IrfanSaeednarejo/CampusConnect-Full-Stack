import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getPendingMentorApplications, getPendingSocietyHeadApplications } from "../../api/adminApi";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [pendingSocietyHeads, setPendingSocietyHeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, mentorsRes, headsRes] = await Promise.allSettled([
          getAdminStats(),
          getPendingMentorApplications(),
          getPendingSocietyHeadApplications(),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (mentorsRes.status === "fulfilled") {
          const items = mentorsRes.value.data?.docs || mentorsRes.value.data || [];
          setPendingMentors(Array.isArray(items) ? items : []);
        }
        if (headsRes.status === "fulfilled") {
          const items = headsRes.value.data?.docs || headsRes.value.data || [];
          setPendingSocietyHeads(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        console.error("[AdminDashboard] Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build stat cards from real API data
  const statCards = stats
    ? [
      { label: "Total Users", value: stats.totalUsers ?? 0, icon: "group", gradient: "from-primary to-indigo-800" },
      { label: "Active Mentors", value: stats.totalMentors ?? 0, icon: "school", gradient: "from-cyan-600 to-cyan-800" },
      { label: "Societies", value: stats.totalSocieties ?? 0, icon: "groups", gradient: "from-emerald-600 to-emerald-800" },
      { label: "Pending Approvals", value: (stats.pendingMentors ?? 0) + (stats.pendingSocietyHeads ?? 0), icon: "pending_actions", gradient: "from-amber-600 to-amber-800" },
      { label: "Total Events", value: stats.totalEvents ?? 0, icon: "event", gradient: "from-pink-600 to-pink-800" },
      { label: "New Users (30d)", value: stats.recentRegistrations ?? 0, icon: "person_add", gradient: "from-purple-600 to-purple-800" },
    ]
    : [];

  // Merge pending approvals into a single list
  const allPending = [
    ...pendingMentors.map((u) => ({
      id: u._id || u.id,
      name: u.profile?.displayName || u.name || "Unknown",
      role: "Mentor",
      dept: u.academic?.department || "Not specified",
      time: u.createdAt ? formatTimeAgo(u.createdAt) : "",
      avatar: u.profile?.avatar,
    })),
    ...pendingSocietyHeads.map((u) => ({
      id: u._id || u.id,
      name: u.profile?.displayName || u.name || "Unknown",
      role: "Society Head",
      dept: u.academic?.department || "Not specified",
      time: u.createdAt ? formatTimeAgo(u.createdAt) : "",
      avatar: u.profile?.avatar,
    })),
  ];

  // Quick actions
  const quickActions = [
    { label: "Manage Users", icon: "group", path: "/admin/users" },
    { label: "Mentor Approvals", icon: "school", path: "/admin/mentor-approvals", badge: stats?.pendingMentors },
    { label: "Society Approvals", icon: "groups", path: "/admin/society-head-approvals", badge: stats?.pendingSocietyHeads },
    { label: "Society Oversight", icon: "domain", path: "/admin/societies" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-text-primary text-2xl font-bold">Welcome back, Admin 👋</h1>
        <p className="text-text-secondary text-sm mt-1">
          Here&apos;s what&apos;s happening on your platform today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4 bg-surface border border-border hover:border-primary/30 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-white text-[20px]">{card.icon}</span>
            </div>
            <p className="text-text-primary text-2xl font-bold">{card.value}</p>
            <p className="text-text-secondary text-xs mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Alert Banner */}
      {allPending.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
          <div className="flex-1">
            <p className="text-text-primary font-semibold text-sm">Pending Approvals</p>
            <p className="text-text-secondary text-xs">
              {stats?.pendingMentors > 0 && `${stats.pendingMentors} mentor application(s)`}
              {stats?.pendingMentors > 0 && stats?.pendingSocietyHeads > 0 && " and "}
              {stats?.pendingSocietyHeads > 0 && `${stats.pendingSocietyHeads} society head application(s)`}
              {" "}awaiting your review.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/society-head-approvals")}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Main Grid — Chart + Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Overview — 2 cols */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Platform Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background rounded-lg p-4 border border-border">
              <p className="text-text-secondary text-sm">Students</p>
              <p className="text-text-primary text-2xl font-bold mt-1">{stats?.totalStudents ?? 0}</p>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <p className="text-text-secondary text-sm">Society Heads</p>
              <p className="text-text-primary text-2xl font-bold mt-1">{stats?.totalSocietyHeads ?? 0}</p>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <p className="text-text-secondary text-sm">Total Events</p>
              <p className="text-text-primary text-2xl font-bold mt-1">{stats?.totalEvents ?? 0}</p>
            </div>
          </div>

          {/* Visual bar representation */}
          <div className="mt-6">
            <h4 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">User Distribution</h4>
            <div className="space-y-3">
              {[
                { label: "Students", value: stats?.totalStudents ?? 0, color: "bg-primary" },
                { label: "Mentors", value: stats?.totalMentors ?? 0, color: "bg-cyan-500" },
                { label: "Society Heads", value: stats?.totalSocietyHeads ?? 0, color: "bg-emerald-500" },
              ].map((bar) => {
                const total = stats?.totalUsers || 1;
                const pct = Math.round((bar.value / total) * 100);
                return (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="text-text-secondary text-xs w-28 text-right">{bar.label}</span>
                    <div className="flex-1 bg-background rounded-full h-3 border border-border overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-text-primary text-xs font-semibold w-12">{bar.value} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Approval Queue — 1 col */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold">Approval Queue</h3>
            {allPending.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">
                {allPending.length} pending
              </span>
            )}
          </div>

          {allPending.length > 0 ? (
            <div className="space-y-3 flex-1">
              {allPending.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{a.name}</p>
                    <p className="text-text-secondary text-[10px]">{a.role} • {a.dept}</p>
                  </div>
                  {a.time && <span className="text-text-secondary text-[10px] whitespace-nowrap">{a.time}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">check_circle</span>
              <p className="text-text-primary font-semibold text-sm">All caught up!</p>
              <p className="text-text-secondary text-xs mt-1">No pending approvals.</p>
            </div>
          )}

          {allPending.length > 0 && (
            <button
              onClick={() => navigate("/admin/society-head-approvals")}
              className="mt-4 w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Review All Approvals
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-text-primary font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl text-left hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-[20px]">{action.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-text-primary font-semibold text-sm group-hover:text-primary transition-colors">
                    {action.label}
                  </p>
                  {action.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                      {action.badge}
                    </span>
                  )}
                </div>
              </div>
              <span className="material-symbols-outlined text-text-secondary group-hover:text-primary text-[16px] transition-colors">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Helper: Format "time ago" from ISO date ─── */
function formatTimeAgo(isoStr) {
  if (!isoStr) return "";
  const now = Date.now();
  const past = new Date(isoStr).getTime();
  const diffMs = now - past;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
