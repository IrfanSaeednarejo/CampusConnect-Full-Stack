import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminMentors,
  getPendingMentors,
  verifyMentor,
  rejectMentor,
  suspendMentor,
  overrideMentorTier,
} from "../../api/adminApi";
import { useDispatch } from "react-redux";
import { decrementPending } from "../../redux/slices/adminSlice";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";

// ── Pending Tab ────────────────────────────────────────────────────────────────

const PendingMentorsTab = () => {
  const dispatch = useDispatch();
  const [mentors,    setMentors]    = useState([]);
  const [pagination, setPagination] = useState({});
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [rejectModal,setRejectModal]= useState(null); // mentorId
  const [busyId,     setBusyId]     = useState(null);

  const fetchPending = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getPendingMentors({ page: p, limit: 12 });
      setMentors(data.data?.docs ?? data.data ?? []);
      setPagination(data.data?.pagination ?? {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(page); }, [page, fetchPending]);

  const handleVerify = async (mentorId) => {
    setBusyId(mentorId);
    try {
      await verifyMentor(mentorId);
      dispatch(decrementPending({ key: "mentors" }));
      setMentors(prev => prev.filter(m => m._id !== mentorId));
    } finally { setBusyId(null); }
  };

  const handleReject = async ({ confirmed, reason }) => {
    if (!confirmed || !rejectModal) return setRejectModal(null);
    setBusyId(rejectModal);
    try {
      await rejectMentor(rejectModal, { reason });
      dispatch(decrementPending({ key: "mentors" }));
      setMentors(prev => prev.filter(m => m._id !== rejectModal));
    } finally {
      setBusyId(null);
      setRejectModal(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-60 rounded-2xl bg-[#0f172a] border border-[#1e293b] animate-pulse" />
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#0f172a] border border-[#1e293b] rounded-2xl text-center">
        <span className="material-symbols-outlined text-[#334155] text-6xl mb-4">how_to_reg</span>
        <p className="text-[#f8fafc] font-bold text-lg mb-1">All clear!</p>
        <p className="text-[#64748b] text-sm">No pending mentor applications to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mentors.map(mentor => {
          const profile = mentor.userId?.profile ?? {};
          const name    = profile.displayName || `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Unknown";
          const avatar  = profile.avatar;
          const initials= name.slice(0, 2).toUpperCase();
          const isBusy  = busyId === mentor._id;
          const isFree  = !mentor.hourlyRate || mentor.hourlyRate === 0;

          return (
            <div
              key={mentor._id}
              className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#334155] transition-colors"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-11 h-11 rounded-xl object-cover border border-[#334155] shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[#f8fafc] font-bold text-sm truncate">{name}</p>
                  <p className="text-[#64748b] text-xs truncate">{mentor.userId?.email}</p>
                </div>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full shrink-0">
                  {isFree ? "Free" : `PKR ${mentor.hourlyRate}/hr`}
                </span>
              </div>

              {/* Bio */}
              <p className="text-[#94a3b8] text-xs leading-relaxed line-clamp-2 bg-[#1e293b] rounded-lg px-3 py-2 min-h-[44px]">
                {mentor.bio || "No professional bio provided."}
              </p>

              {/* Category + Experience */}
              {(mentor.categories?.length > 0 || mentor.yearsExperience) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {mentor.categories?.map(c => (
                    <span key={c} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-md">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {(mentor.expertise ?? []).slice(0, 5).map(e => (
                  <span
                    key={e}
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    {e}
                  </span>
                ))}
                {(mentor.expertise?.length ?? 0) > 5 && (
                  <span className="text-[10px] text-[#64748b] px-1.5 py-0.5">+{mentor.expertise.length - 5}</span>
                )}
              </div>

              {/* Applicant info */}
              <div className="flex items-center justify-between text-[11px] text-[#475569] pt-2 border-t border-[#1e293b]">
                <span>{mentor.userId?.campusId?.name ?? "Campus"}</span>
                <span>{new Date(mentor.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleVerify(mentor._id)}
                  disabled={isBusy}
                  className="flex-1 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  {isBusy ? "…" : "✓ Approve"}
                </button>
                <button
                  onClick={() => setRejectModal(mentor._id)}
                  disabled={isBusy}
                  className="flex-1 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                p === page ? "bg-indigo-600 text-white" : "bg-[#1e293b] text-[#64748b] hover:bg-[#334155]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {rejectModal && (
        <ReasonModal
          title="Reject Mentor Application"
          prompt="Provide a reason for rejection — this will be sent to the applicant:"
          onClose={handleReject}
        />
      )}
    </>
  );
};

// ── Verified / Suspended Tab ───────────────────────────────────────────────────

const MentorListTab = ({ filterParams }) => {
  const navigate = useNavigate();
  const [mentors,     setMentors]     = useState([]);
  const [pagination,  setPagination]  = useState({});
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [suspendModal,setSuspendModal]= useState(null);
  const [tierModal,   setTierModal]   = useState(null);

  const fetchMentors = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getAdminMentors({ ...filterParams, page: p, limit: 20 });
      setMentors(data.data?.docs ?? []);
      setPagination(data.data?.pagination ?? {});
    } finally { setLoading(false); }
  }, [filterParams]);

  useEffect(() => { fetchMentors(page); }, [page, fetchMentors]);

  const handleSuspend = async ({ confirmed, reason }) => {
    if (!confirmed || !suspendModal) return setSuspendModal(null);
    await suspendMentor(suspendModal, { reason });
    setSuspendModal(null);
    fetchMentors(page);
  };

  const handleTierOverride = async (mentorId, tier) => {
    await overrideMentorTier(mentorId, { tier });
    setTierModal(null);
    fetchMentors(page);
  };

  const columns = [
    {
      key: "user",
      label: "Mentor",
      render: (m) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {m.userId?.profile?.avatar ? (
            <img src={m.userId.profile.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>
              {(m.userId?.profile?.displayName ?? "?")[0]}
            </div>
          )}
          <div>
            <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{m.userId?.profile?.displayName ?? "—"}</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>{m.userId?.email}</div>
          </div>
        </div>
      ),
    },
    { key: "tier",         label: "Tier",     render: (m) => <AdminBadge type="tier" value={m.tier} /> },
    { key: "totalSessions",label: "Sessions", render: (m) => m.totalSessions ?? 0 },
    { key: "averageRating",label: "Rating",   render: (m) => m.averageRating ? `⭐ ${m.averageRating.toFixed(1)}` : "—" },
    { key: "isActive",     label: "Status",   render: (m) => <AdminBadge type="status" value={m.isActive ? "active" : "suspended"} /> },
  ];

  const rowActions = (m) => [
    { label: "View Profile", onClick: () => navigate(`/admin/mentors/${m._id}`) },
    ...(m.isActive ? [{ label: "Suspend", onClick: () => setSuspendModal(m._id), danger: true }] : []),
    { label: "Override Tier", onClick: () => setTierModal(m) },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={mentors}
        loading={loading}
        rowActions={rowActions}
        pagination={pagination}
        onPageChange={setPage}
        onRowClick={(m) => navigate(`/admin/mentors/${m._id}`)}
      />

      {suspendModal && (
        <ReasonModal title="Suspend Mentor" prompt="Reason for suspension:" onClose={handleSuspend} />
      )}

      {tierModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,30,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#0f172a", borderRadius: 20, padding: 32, width: 380, border: "1px solid #1e293b" }}>
            <h3 style={{ color: "#f8fafc", fontWeight: 700, marginBottom: 6 }}>Override Tier</h3>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{tierModal.userId?.profile?.displayName}</p>
            <div style={{ display: "flex", gap: 10 }}>
              {["bronze", "silver", "gold"].map(t => (
                <button
                  key={t}
                  onClick={() => handleTierOverride(tierModal._id, t)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                    background: t === "gold" ? "rgba(217,119,6,0.15)" : t === "silver" ? "rgba(100,116,139,0.15)" : "rgba(146,64,14,0.15)",
                    color: t === "gold" ? "#fbbf24" : t === "silver" ? "#94a3b8" : "#d97706",
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => setTierModal(null)} style={{ marginTop: 12, width: "100%", padding: "10px", background: "#1e293b", color: "#94a3b8", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "pending",   label: "Pending Applications", icon: "pending_actions" },
  { key: "verified",  label: "Active Mentors",        icon: "verified" },
  { key: "suspended", label: "Suspended",             icon: "block" },
];

const AdminMentors = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const filterMap = {
    verified:  { verified: true, isActive: true },
    suspended: { isActive: false },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Mentor Governance</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Review applications, manage verification lifecycle, tier assignments, and performance monitoring.
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1.5 p-1 rounded-2xl border border-[#1e293b] mb-8 w-fit"
        style={{ background: "#0f172a" }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.key
                ? "bg-indigo-600 text-white"
                : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e293b]"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ minHeight: 400 }}>
        {activeTab === "pending"   && <PendingMentorsTab />}
        {activeTab !== "pending"   && <MentorListTab filterParams={filterMap[activeTab]} />}
      </div>
    </div>
  );
};

export default AdminMentors;
