import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats } from "../../api/adminApi";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
      { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-600 to-blue-800" },
      { label: "Students", value: stats.totalStudents, icon: "🎓", color: "from-green-600 to-green-800" },
      { label: "Mentors", value: stats.totalMentors, icon: "🧑‍🏫", color: "from-purple-600 to-purple-800" },
      { label: "Society Heads", value: stats.totalSocietyHeads, icon: "🏛️", color: "from-orange-600 to-orange-800" },
      { label: "Societies", value: stats.totalSocieties, icon: "🏢", color: "from-cyan-600 to-cyan-800" },
      { label: "Total Events", value: stats.totalEvents, icon: "📅", color: "from-pink-600 to-pink-800" },
    ]
    : [];

  const quickLinks = [
    { label: "Manage Users", desc: "View, search, suspend, or delete user accounts", path: "/admin/users", icon: "👥" },
    { label: "Mentor Approvals", desc: "Review pending mentor verification requests", path: "/admin/mentor-approvals", icon: "✅", badge: stats?.pendingMentors },
    { label: "Society Head Approvals", desc: "Review pending society head applications", path: "/admin/society-head-approvals", icon: "🏛️", badge: stats?.pendingSocietyHeads },
    { label: "Society Oversight", desc: "View and manage all societies on the platform", path: "/admin/societies", icon: "🏢" },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Control Panel</h1>
          <p className="text-sm text-gray-400 mt-1">
            Platform overview and management tools
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`bg-gradient-to-br ${card.color} rounded-lg p-4 border border-white/10`}
                >
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <p className="text-2xl font-bold text-white">{card.value ?? 0}</p>
                  <p className="text-xs text-white/70 mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Pending Approvals Alert */}
            {(stats?.pendingMentors > 0 || stats?.pendingSocietyHeads > 0) && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-8 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-yellow-400 font-semibold">Pending Approvals</p>
                  <p className="text-yellow-400/70 text-sm">
                    {stats.pendingMentors > 0 && `${stats.pendingMentors} mentor application(s)`}
                    {stats.pendingMentors > 0 && stats.pendingSocietyHeads > 0 && " and "}
                    {stats.pendingSocietyHeads > 0 && `${stats.pendingSocietyHeads} society head application(s)`}
                    {" "}awaiting your review.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <h2 className="text-xl font-bold text-white mb-4">Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="bg-surface border border-border rounded-lg p-5 text-left hover:border-primary/50 transition-colors group flex items-start gap-4"
                >
                  <span className="text-3xl">{link.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold group-hover:text-primary transition-colors">
                        {link.label}
                      </h3>
                      {link.badge > 0 && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm mt-1">{link.desc}</p>
                  </div>
                  <span className="text-text-secondary group-hover:text-white transition-colors mt-1">→</span>
                </button>
              ))}
            </div>

            {/* Recent Stats */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-text-secondary text-sm">New Users (30 days)</p>
                  <p className="text-2xl font-bold text-primary mt-1">{stats?.recentRegistrations ?? 0}</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-text-secondary text-sm">Active Societies</p>
                  <p className="text-2xl font-bold text-[#58a6ff] mt-1">{stats?.totalSocieties ?? 0}</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-text-secondary text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{stats?.totalEvents ?? 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
