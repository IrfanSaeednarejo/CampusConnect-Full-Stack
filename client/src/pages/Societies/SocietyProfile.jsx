import { useOutletContext, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectSocietyMembers,
  selectSocietyStats,
} from "../../redux/slices/societySlice";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

const ROLE_CFG = {
  "society_head":   { label: "Society Head",   cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" },
  "co-coordinator": { label: "Co-Coordinator", cls: "bg-blue-500/15 text-blue-400 border border-blue-500/25" },
  "executive":      { label: "Executive",      cls: "bg-purple-500/15 text-purple-400 border border-purple-500/25" },
  "active-member":  { label: "Active Member",  cls: "bg-slate-500/15 text-slate-400 border border-slate-500/25" },
  "student":        { label: "Student",        cls: "bg-slate-600/15 text-slate-500 border border-slate-600/25" },
};

export default function SocietyProfile() {
  const navigate = useNavigate();
  const { headSociety, societyId } = useOutletContext() ?? {};
  const members = useSelector(selectSocietyMembers);
  const stats   = useSelector(selectSocietyStats);

  const approved = members.filter(m => m.status === "approved");

  const getMemberName = (m) => {
    const p = m.memberId?.profile ?? {};
    return p.displayName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Member";
  };

  const statusCls = {
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    pending:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  }[headSociety?.status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/25";

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Society Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your society's public identity</p>
        </div>
        <button
          onClick={() => navigate(`/society/edit/${societyId}`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl border border-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit Society
        </button>
      </div>

      {/* Cover + Identity Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="h-44 bg-slate-700/40 relative">
          {headSociety?.media?.coverImage ? (
            <img src={headSociety.media.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <span className="material-symbols-outlined text-slate-300 text-8xl">groups</span>
              </div>
            </div>
          )}
          <div className="absolute -bottom-8 left-6">
            {headSociety?.media?.logo ? (
              <img src={headSociety.media.logo} alt={headSociety.name} className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-900 shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-700 border-4 border-slate-900 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-slate-400 text-3xl">groups</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pt-12 px-6 pb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-slate-100 text-2xl font-bold">{headSociety?.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-slate-500 text-sm">#{headSociety?.tag}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-sm capitalize">{headSociety?.category}</span>
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${statusCls}`}>
                  {headSociety?.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/societies/${societyId}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Public View
            </button>
          </div>

          <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-2xl">
            {headSociety?.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: "group",     label: "Members",     value: headSociety?.memberCount ?? approved.length },
          { icon: "event",     label: "Events",      value: stats?.events?.total ?? 0 },
          { icon: "campaign",  label: "Completed Events", value: stats?.events?.completed ?? 0 },
          { icon: "calendar_today", label: "Founded", value: headSociety?.createdAt ? new Date(headSociety.createdAt).getFullYear() : "—" },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <span className="material-symbols-outlined text-slate-600 text-xl block mb-1">{icon}</span>
            <p className="text-slate-100 font-bold text-xl">{value}</p>
            <p className="text-slate-500 text-xs uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
          <h3 className="text-slate-300 font-semibold text-sm">Society Details</h3>
          {[
            { label: "Founded", value: formatDate(headSociety?.createdAt) },
            { label: "Category", value: headSociety?.category ?? "—" },
            { label: "Tag", value: headSociety?.tag ? `#${headSociety.tag}` : "—" },
            { label: "Join Mode", value: headSociety?.requireApproval ? "Approval Required" : "Open Join" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">{label}</span>
              <span className="text-slate-200 text-sm font-medium capitalize">{value}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-slate-300 font-semibold text-sm mb-4">Member Roster Preview</h3>
          {approved.length === 0 ? (
            <p className="text-slate-500 text-sm">No approved members yet.</p>
          ) : (
            <div className="space-y-2">
              {approved.slice(0, 6).map(m => {
                const p = m.memberId?.profile ?? {};
                const name = getMemberName(m);
                const roleCfg = ROLE_CFG[m.role] ?? ROLE_CFG["student"];
                return (
                  <div key={m.memberId?._id ?? m.memberId} className="flex items-center gap-2.5">
                    {p.avatar ? (
                      <img src={p.avatar} alt={name} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-slate-300 text-sm truncate flex-1">{name}</span>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${roleCfg.cls}`}>{roleCfg.label}</span>
                  </div>
                );
              })}
              {approved.length > 6 && (
                <p className="text-slate-600 text-xs mt-1">+{approved.length - 6} more members</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
