import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  getAdminMentors,
  getPendingMentors,
  verifyMentor,
  rejectMentor,
  suspendMentor,
  reactivateMentor,
  overrideMentorTier,
} from "../../api/adminApi";
import { decrementPending } from "../../redux/slices/adminSlice";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

const PendingMentorsTab = () => {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const [mentors, setMentors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [busyId, setBusyId] = useState(null);

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

  useEffect(() => {
    fetchPending(page);
  }, [page, fetchPending]);

  const handleVerify = async (mentorId) => {
    setBusyId(mentorId);
    try {
      await verifyMentor(mentorId);
      dispatch(decrementPending({ key: "mentors" }));
      setMentors((prev) => prev.filter((mentor) => mentor._id !== mentorId));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async ({ confirmed, reason }) => {
    if (!confirmed || !rejectModal) return setRejectModal(null);
    setBusyId(rejectModal);
    try {
      await rejectMentor(rejectModal, { reason });
      dispatch(decrementPending({ key: "mentors" }));
      setMentors((prev) => prev.filter((mentor) => mentor._id !== rejectModal));
    } finally {
      setBusyId(null);
      setRejectModal(null);
    }
  };

  const surfaceClassName = isDark
    ? "border-[#1e293b] bg-[#0f172a]"
    : "border-slate-200 bg-white";
  const insetClassName = isDark
    ? "bg-[#1e293b] text-[#94a3b8]"
    : "bg-slate-50 text-slate-600";

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-60 animate-pulse rounded-2xl border ${surfaceClassName}`}
          />
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border py-24 text-center ${surfaceClassName}`}
      >
        <span className={`material-symbols-outlined mb-4 text-6xl ${isDark ? "text-[#334155]" : "text-slate-300"}`}>
          how_to_reg
        </span>
        <p className={`mb-1 text-lg font-bold ${isDark ? "text-[#f8fafc]" : "text-slate-900"}`}>
          All clear!
        </p>
        <p className={isDark ? "text-[#64748b] text-sm" : "text-slate-500 text-sm"}>
          No pending mentor applications to review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mentors.map((mentor) => {
          const profile = mentor.userId?.profile ?? {};
          const name =
            profile.displayName ||
            `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
            "Unknown";
          const avatar = profile.avatar;
          const initials = name.slice(0, 2).toUpperCase();
          const isBusy = busyId === mentor._id;
          const isFree = !mentor.hourlyRate || mentor.hourlyRate === 0;

          return (
            <div
              key={mentor._id}
              className={`flex flex-col gap-4 rounded-2xl border p-5 transition-colors hover:border-slate-400/40 ${surfaceClassName}`}
            >
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className={`h-11 w-11 shrink-0 rounded-xl border object-cover ${
                      isDark ? "border-[#334155]" : "border-slate-200"
                    }`}
                  />
                ) : (
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      isDark
                        ? "bg-primary text-white"
                        : "bg-primary text-white"
                    }`}
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                    {name}
                  </p>
                  <p className={`truncate text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    {mentor.userId?.email}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold ${
                    isFree
                      ? isDark
                        ? "border-info/20 bg-info/10 text-info"
                        : "border-info/20 bg-info/10 text-info"
                      : isDark
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {isFree ? "Free" : `PKR ${mentor.hourlyRate}/hr`}
                </span>
              </div>

              <p className={`min-h-[44px] rounded-lg px-3 py-2 text-xs leading-relaxed ${insetClassName}`}>
                {mentor.bio || "No professional bio provided."}
              </p>

              {(mentor.categories?.length > 0 || mentor.yearsExperience) && (
                <div className="flex flex-wrap items-center gap-2">
                  {mentor.categories?.map((category) => (
                    <span
                      key={category}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isDark
                          ? "bg-slate-700/50 text-slate-400"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {(mentor.expertise ?? []).slice(0, 5).map((expertise) => (
                  <span
                    key={expertise}
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                      isDark
                        ? "border-info/20 bg-info/10 text-info"
                        : "border-info/20 bg-info/10 text-info"
                    }`}
                  >
                    {expertise}
                  </span>
                ))}
                {(mentor.expertise?.length ?? 0) > 5 && (
                  <span className={`px-1.5 py-0.5 text-[10px] ${isDark ? "text-[#64748b]" : "text-slate-500"}`}>
                    +{mentor.expertise.length - 5}
                  </span>
                )}
              </div>

              <div
                className={`flex items-center justify-between border-t pt-2 text-[11px] ${
                  isDark ? "border-[#1e293b] text-[#475569]" : "border-slate-200 text-slate-500"
                }`}
              >
                <span>{mentor.userId?.campusId?.name ?? "Campus"}</span>
                <span>
                  {new Date(mentor.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleVerify(mentor._id)}
                  disabled={isBusy}
                  className={getButtonClassName({
                    variant: "success",
                    size: "sm",
                    isDark,
                    className: "flex-1",
                  })}
                >
                  {isBusy ? "..." : "Approve"}
                </button>
                <button
                  onClick={() => setRejectModal(mentor._id)}
                  disabled={isBusy}
                  className={getButtonClassName({
                    variant: "danger",
                    size: "sm",
                    isDark,
                    className: "flex-1",
                  })}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={getButtonClassName({
                variant: p === page ? "primary" : "secondary",
                size: "sm",
                isDark,
                className: "min-w-0 w-8 px-0",
              })}
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

const MentorListTab = ({ filterParams }) => {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const [mentors, setMentors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [suspendModal, setSuspendModal] = useState(null);
  const [tierModal, setTierModal] = useState(null);

  const fetchMentors = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getAdminMentors({ ...filterParams, page: p, limit: 20 });
      setMentors(data.data?.docs ?? []);
      setPagination(data.data?.pagination ?? {});
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchMentors(page);
  }, [page, fetchMentors]);

  const handleSuspend = async ({ confirmed, reason }) => {
    if (!confirmed || !suspendModal) return setSuspendModal(null);
    await suspendMentor(suspendModal, { reason });
    setSuspendModal(null);
    fetchMentors(page);
  };

  const handleReactivate = async (mentorId) => {
    await reactivateMentor(mentorId);
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
      render: (mentor) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {mentor.userId?.profile?.avatar ? (
            <img
              src={mentor.userId.profile.avatar}
              alt=""
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                border: isDark ? "1px solid #334155" : "1px solid #dbe4ee",
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: isDark ? "#334155" : "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isDark ? "#94a3b8" : "#475569",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {(mentor.userId?.profile?.displayName ?? "?")[0]}
            </div>
          )}
          <div>
            <div style={{ color: isDark ? "#f8fafc" : "#0f172a", fontWeight: 600, fontSize: 14 }}>
              {mentor.userId?.profile?.displayName ?? "—"}
            </div>
            <div style={{ color: isDark ? "#64748b" : "#64748b", fontSize: 11 }}>
              {mentor.userId?.email}
            </div>
          </div>
        </div>
      ),
    },
    { key: "tier", label: "Tier", render: (mentor) => <AdminBadge value={mentor.tier} /> },
    { key: "totalSessions", label: "Sessions", render: (mentor) => mentor.totalSessions ?? 0 },
    {
      key: "averageRating",
      label: "Rating",
      render: (mentor) => mentor.averageRating ? `⭐ ${mentor.averageRating.toFixed(1)}` : "—",
    },
    {
      key: "isActive",
      label: "Status",
      render: (mentor) => <AdminBadge value={mentor.isActive ? "active" : "suspended"} />,
    },
  ];

  const rowActions = (mentor) => [
    { label: "View Profile", onClick: () => navigate(`/admin/mentors/${mentor._id}`) },
    ...(mentor.isActive
      ? [{ label: "Suspend", onClick: () => setSuspendModal(mentor._id), danger: true }]
      : [{ label: "Reactivate", onClick: () => handleReactivate(mentor._id) }]),
    { label: "Override Tier", onClick: () => setTierModal(mentor) },
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
        onRowClick={(mentor) => navigate(`/admin/mentors/${mentor._id}`)}
      />

      {suspendModal && (
        <ReasonModal
          title="Suspend Mentor"
          prompt="Reason for suspension:"
          onClose={handleSuspend}
        />
      )}

      {tierModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,15,30,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: isDark ? "#0f172a" : "#ffffff",
              borderRadius: 20,
              padding: 32,
              width: 380,
              border: isDark ? "1px solid #1e293b" : "1px solid #dbe4ee",
              boxShadow: isDark
                ? "0 24px 60px rgba(0,0,0,0.3)"
                : "0 24px 60px rgba(15,23,42,0.12)",
            }}
          >
            <h3 style={{ color: isDark ? "#f8fafc" : "#0f172a", fontWeight: 700, marginBottom: 6 }}>
              Override Tier
            </h3>
            <p style={{ color: isDark ? "#64748b" : "#64748b", fontSize: 13, marginBottom: 20 }}>
              {tierModal.userId?.profile?.displayName}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["bronze", "silver", "gold"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleTierOverride(tierModal._id, tier)}
                  className={getButtonClassName({
                    variant: tier === "silver" ? "secondary" : "warning",
                    size: "sm",
                    isDark,
                    className: "flex-1",
                  })}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setTierModal(null)}
              className={getButtonClassName({
                variant: "secondary",
                size: "md",
                isDark,
                className: "mt-3 w-full",
              })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const TABS = [
  { key: "pending", label: "Pending Applications", icon: "pending_actions" },
  { key: "verified", label: "Active Mentors", icon: "verified" },
  { key: "suspended", label: "Suspended", icon: "block" },
];

const AdminMentors = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const isDark = useHomeTheme();

  const filterMap = {
    verified: { verified: true, isActive: true },
    suspended: { isActive: false },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: isDark ? "#f8fafc" : "#0f172a",
            margin: 0,
          }}
        >
          Mentor Governance
        </h1>
        <p
          style={{
            color: isDark ? "#64748b" : "#64748b",
            marginTop: 4,
            fontSize: 14,
          }}
        >
          Review applications, manage verification lifecycle, tier assignments, and
          performance monitoring.
        </p>
      </div>

      <div
        className={`mb-8 flex w-fit gap-1.5 rounded-2xl border p-1 ${
          isDark ? "border-[#1e293b] bg-[#0f172a]" : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={getButtonClassName({
              variant: activeTab === tab.key ? "primary" : "ghost",
              size: "sm",
              isDark,
            })}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 400 }}>
        {activeTab === "pending" && <PendingMentorsTab />}
        {activeTab !== "pending" && <MentorListTab filterParams={filterMap[activeTab]} />}
      </div>
    </div>
  );
};

export default AdminMentors;
