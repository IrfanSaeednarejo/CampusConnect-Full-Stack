import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSocietyStats,
  selectSocietyStats,
  selectSocietyMembers,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";

function BarRow({ label, value, max, color = "from-slate-600 to-slate-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-400 text-sm capitalize">{label}</span>
        <span className="text-slate-200 text-sm font-bold">{value}</span>
      </div>
      <div className="h-2.5 bg-slate-900/80 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = "text-slate-200" }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value ?? "—"}</p>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-400 text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function SocietyAnalytics() {
  const dispatch  = useDispatch();
  const { societyId } = useOutletContext() ?? {};
  const stats   = useSelector(selectSocietyStats);
  const members = useSelector(selectSocietyMembers);
  const loading = useSelector(selectSocietyLoading);

  useEffect(() => {
    if (societyId) dispatch(fetchSocietyStats(societyId));
  }, [dispatch, societyId]);

  const approved = members.filter(m => m.status === "approved");
  const pending  = members.filter(m => m.status === "pending");
  const rejected = members.filter(m => m.status === "rejected");

  // Role breakdown for bar chart
  const byRole = stats?.members?.byRole ?? {};
  const byRoleTotal = Object.values(byRole).reduce((a, b) => a + b, 0);

  // Event breakdown
  const evStats = stats?.events ?? {};
  const evTotal = evStats.total ?? 0;

  const ROLE_COLORS = {
    "society_head":   "from-emerald-600 to-emerald-400",
    "co-coordinator": "from-blue-600 to-blue-400",
    "executive":      "from-purple-600 to-purple-400",
    "active-member":  "from-slate-600 to-slate-400",
    "student":        "from-slate-700 to-slate-500",
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-slate-100 text-2xl font-bold">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track your society's growth and engagement</p>
      </div>

      {/* KPI Cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="group"
            label="Total Members"
            value={stats?.members?.total ?? approved.length}
            sub={`+${stats?.members?.joinedLast30Days ?? 0} this month`}
            color="text-slate-100"
          />
          <StatCard
            icon="pending"
            label="Pending Requests"
            value={pending.length}
            color={pending.length > 0 ? "text-amber-400" : "text-slate-300"}
          />
          <StatCard
            icon="event"
            label="Total Events"
            value={evTotal}
            sub={`${evStats.published ?? 0} upcoming`}
          />
          <StatCard
            icon="check_circle"
            label="Completed Events"
            value={evStats.completed ?? 0}
            color="text-emerald-400"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Role Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-slate-200 font-semibold mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">donut_small</span>
            Member Role Breakdown
          </h3>
          {byRoleTotal === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No member data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byRole).map(([role, count]) => (
                <BarRow
                  key={role}
                  label={role.replace(/-/g, " ")}
                  value={count}
                  max={byRoleTotal}
                  color={ROLE_COLORS[role] ?? "from-slate-600 to-slate-400"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Member Status Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-slate-200 font-semibold mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">bar_chart</span>
            Member Status
          </h3>
          <div className="space-y-4">
            {[
              { key: "approved", label: "Approved",  value: approved.length, color: "from-emerald-600 to-emerald-400" },
              { key: "pending",  label: "Pending",   value: pending.length,  color: "from-amber-600 to-amber-400" },
              { key: "rejected", label: "Rejected",  value: rejected.length, color: "from-red-600 to-red-400" },
            ].map(({ key, label, value, color }) => (
              <BarRow key={key} label={label} value={value} max={approved.length + pending.length + rejected.length} color={color} />
            ))}
          </div>
        </div>
      </div>

      {/* Event Stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-slate-200 font-semibold mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">event</span>
          Event Overview
        </h3>
        {evTotal === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-slate-600 text-4xl block mb-2">event_busy</span>
            <p className="text-slate-500 text-sm">No events organized yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total",     value: evTotal,               cls: "text-slate-200" },
              { label: "Upcoming",  value: evStats.published ?? 0, cls: "text-blue-400" },
              { label: "Completed", value: evStats.completed ?? 0, cls: "text-emerald-400" },
              { label: "Cancelled", value: evStats.cancelled ?? 0, cls: "text-red-400" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-slate-900/50 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                <p className="text-slate-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Joins */}
      {approved.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">person_add</span>
            Recent Joins (Last 30 Days)
            <span className="ml-auto bg-slate-700 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {stats?.members?.joinedLast30Days ?? 0}
            </span>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {[...approved]
              .filter(m => {
                const d = new Date(m.joinedAt);
                return d >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              })
              .slice(0, 12)
              .map(m => {
                const p = m.memberId?.profile ?? {};
                const name = p.displayName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "?";
                return p.avatar ? (
                  <img key={m.memberId?._id} src={p.avatar} alt={name} title={name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                ) : (
                  <div key={m.memberId?._id} title={name} className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-slate-400 text-xs font-bold">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                );
              })
            }
          </div>
        </div>
      )}
    </div>
  );
}
