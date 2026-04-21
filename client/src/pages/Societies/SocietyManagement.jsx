import { useOutletContext, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectSocietyMembers,
  selectMemberRequests,
  selectSocietyStats,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ icon, label, value, sub, color = "text-slate-300" }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value ?? "—"}</p>
          {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
        </div>
        <span className="material-symbols-outlined text-slate-600 text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, to, badge, navigate }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-left hover:border-slate-500 hover:bg-slate-800 transition-all group w-full"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-slate-700/60 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-slate-300 text-xl">{icon}</span>
        </div>
        {badge > 0 && (
          <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
            {badge} pending
          </span>
        )}
      </div>
      <p className="text-slate-200 font-semibold text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-0.5">{description}</p>
    </button>
  );
}

export default function SocietyManagement() {
  const navigate  = useNavigate();
  const { headSociety, societyId, pendingCount } = useOutletContext() ?? {};
  const members   = useSelector(selectSocietyMembers);
  const requests  = useSelector(selectMemberRequests);
  const stats     = useSelector(selectSocietyStats);
  const loading   = useSelector(selectSocietyLoading);

  const approvedMembers = members.filter(m => m.status === "approved");
  const pendingMembers  = members.filter(m => m.status === "pending");

  const getMemberName = (m) => {
    const p = m.memberId?.profile ?? {};
    return p.displayName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Member";
  };
  const getMemberAvatar = (m) => m.memberId?.profile?.avatar ?? null;

  const statusCls = {
    approved: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    pending:  "bg-amber-500/15 text-amber-400 border border-amber-500/25",
    rejected: "bg-red-500/15 text-red-400 border border-red-500/25",
  }[headSociety?.status] ?? "bg-slate-500/15 text-slate-400";

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">HQ Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Overview of your society's activity</p>
        </div>
        <button
          onClick={() => navigate(`/society/edit/${societyId}`)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit Society
        </button>
      </div>

      {/* Status banner */}
      {headSociety?.status !== "approved" && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          headSociety?.status === "pending"
            ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
            : "bg-red-500/10 border-red-500/25 text-red-400"
        }`}>
          <span className="material-symbols-outlined">{headSociety?.status === "pending" ? "pending" : "block"}</span>
          <div>
            <p className="font-semibold capitalize">{headSociety?.status}</p>
            {headSociety?.statusReason && <p className="text-xs opacity-75 mt-0.5">{headSociety.statusReason}</p>}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="group" label="Total Members" value={headSociety?.memberCount ?? approvedMembers.length} sub={`+${stats?.members?.joinedLast30Days ?? 0} this month`} color="text-slate-100" />
        <StatCard icon="pending" label="Pending Requests" value={pendingMembers.length} color={pendingMembers.length > 0 ? "text-amber-400" : "text-slate-300"} />
        <StatCard icon="event" label="Total Events" value={stats?.events?.total ?? "—"} sub={`${stats?.events?.published ?? 0} upcoming`} />
        <StatCard icon="check_circle" label="Status" value={headSociety?.status ?? "—"} color={headSociety?.status === "approved" ? "text-emerald-400" : "text-amber-400"} />
      </div>

      {/* Quick Actions + Society Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Society Identity Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="h-20 bg-slate-700/50 relative">
            {headSociety?.media?.coverImage ? (
              <img src={headSociety.media.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)" }} />
            )}
            <div className="absolute -bottom-5 left-4">
              {headSociety?.media?.logo ? (
                <img src={headSociety.media.logo} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-slate-800" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-base">groups</span>
                </div>
              )}
            </div>
          </div>
          <div className="pt-8 px-4 pb-4">
            <p className="text-slate-100 font-bold">{headSociety?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-500 text-xs">#{headSociety?.tag}</span>
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${statusCls}`}>{headSociety?.status}</span>
            </div>
            <p className="text-slate-500 text-xs mt-2 line-clamp-2">{headSociety?.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-900/50 rounded-lg p-2">
                <p className="text-slate-200 font-bold text-sm">{headSociety?.memberCount ?? approvedMembers.length}</p>
                <p className="text-slate-600 text-[10px]">Members</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2">
                <p className="text-slate-200 font-bold text-sm">{stats?.events?.total ?? 0}</p>
                <p className="text-slate-600 text-[10px]">Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <QuickActionCard icon="group" title="Manage Members" description="View & manage active members and roles" to="/society/members" badge={pendingMembers.length} navigate={navigate} />
          <QuickActionCard icon="campaign" title="Announcements" description="Post updates to your society members" to={`/societies/${societyId}`} navigate={navigate} />
          <QuickActionCard icon="event" title="Society Events" description="View and manage all organized events" to="/society/events" navigate={navigate} />
          <QuickActionCard icon="analytics" title="Analytics" description="Track growth, engagement, and stats" to="/society/analytics" navigate={navigate} />
        </div>
      </div>

      {/* Recent Members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-base">group</span>
            Recent Members
          </h2>
          <button onClick={() => navigate("/society/members")} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
            View all →
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : approvedMembers.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">No approved members yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...approvedMembers].sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt)).slice(0, 5).map(m => {
              const id  = m.memberId?._id ?? m.memberId;
              const name = getMemberName(m);
              const avatar = getMemberAvatar(m);
              return (
                <div key={id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{name}</p>
                    <p className="text-slate-600 text-xs">{m.memberId?.academic?.department ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-600 text-xs hidden sm:block">{formatDate(m.joinedAt)}</span>
                    <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full capitalize">{m.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
