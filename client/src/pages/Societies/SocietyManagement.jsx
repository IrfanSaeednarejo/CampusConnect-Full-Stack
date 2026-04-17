import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMySocieties,
  fetchSocietyMembers,
  fetchSocietyStats,
  removeMemberThunk,
  updateMemberRoleThunk,
  selectCurrentSociety,
  selectMySocieties,
  selectSocietyMembers,
  selectMemberRequests,
  selectSocietyStats,
  selectSocietyLoading,
  selectMembersLoading,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";

const TABS = ["overview", "members", "events", "announcements", "analytics"];

export default function SocietyManagement() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { showSuccess, showError } = useNotification();

  const user       = useSelector(selectUser);
  const mySocieties = useSelector(selectMySocieties);
  const society    = useSelector(selectCurrentSociety);
  const members    = useSelector(selectSocietyMembers);
  const requests   = useSelector(selectMemberRequests);
  const stats      = useSelector(selectSocietyStats);
  const loading    = useSelector(selectSocietyLoading);
  const membersLoading = useSelector(selectMembersLoading);

  const [activeTab, setActiveTab] = useState("overview");

  // Load the head's society on mount
  useEffect(() => {
    dispatch(fetchMySocieties(user?._id));
  }, [dispatch, user?._id]);

  // When we know the society, load members + stats
  const headSociety = society ?? mySocieties?.[0] ?? null;
  const societyId   = headSociety?._id;

  useEffect(() => {
    if (societyId) {
      dispatch(fetchSocietyMembers({ id: societyId }));
      dispatch(fetchSocietyStats(societyId));
    }
  }, [dispatch, societyId]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleRemoveMember = async (memberId) => {
    if (!societyId) return;
    try {
      await dispatch(removeMemberThunk({ societyId, memberId })).unwrap();
      showSuccess("Member removed.");
    } catch (err) {
      showError(err || "Failed to remove member.");
    }
  };

  const handleRoleChange = async (memberId, role) => {
    if (!societyId) return;
    try {
      await dispatch(updateMemberRoleThunk({ societyId, memberId, role })).unwrap();
      showSuccess("Member role updated.");
    } catch (err) {
      showError(err || "Failed to update role.");
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d1117]">
        <div className="max-w-6xl mx-auto px-4 py-8 w-full space-y-6 animate-pulse">
          <div className="h-10 bg-[#161b22] rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#161b22] border border-[#30363d] rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-xl" />
        </div>
      </div>
    );
  }

  // ── No Society Guard ──────────────────────────────────────────────────────────

  if (!headSociety) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d1117] items-center justify-center p-8">
        <Card padding="p-12">
          <EmptyState
            icon="groups"
            title="No society found"
            description="You don't manage a society yet. Create one to get started."
            action={
              <Button onClick={() => navigate("/society/create")} variant="primary">
                Create a Society
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const statusColor = {
    active:    "bg-[#238636]/20 text-[#238636]",
    pending:   "bg-yellow-500/20 text-yellow-400",
    suspended: "bg-[#f85149]/20 text-[#f85149]",
  }[headSociety.status] ?? "bg-[#8b949e]/20 text-[#8b949e]";

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title={headSociety.name}
        subtitle="Society Management"
        icon={headSociety.logo ? undefined : "admin_panel_settings"}
        backPath="/dashboard"
        action={
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => navigate("/society/member-requests")}
              variant="secondary"
              size="sm"
            >
              <span className="material-symbols-outlined text-sm mr-1">person_add</span>
              Requests
              {requests.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500/30 text-yellow-300 text-xs rounded-full">
                  {requests.length}
                </span>
              )}
            </Button>
            <Button
              onClick={() => navigate(`/society/edit/${societyId}`)}
              variant="secondary"
              size="sm"
            >
              Edit Society
            </Button>
          </div>
        }
      />

      {/* Pending / Suspended Banner */}
      {headSociety.status !== "active" && (
        <div className={`mx-4 sm:mx-6 mt-4 p-4 rounded-lg border flex items-center gap-3 ${
          headSociety.status === "pending"
            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            : "bg-[#f85149]/10 border-[#f85149]/30 text-[#f85149]"
        }`}>
          <span className="material-symbols-outlined">
            {headSociety.status === "pending" ? "pending" : "block"}
          </span>
          <div>
            <p className="font-semibold capitalize">{headSociety.status}</p>
            {headSociety.statusReason && (
              <p className="text-sm opacity-80">{headSociety.statusReason}</p>
            )}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Members",    value: headSociety.memberCount ?? members.length, icon: "group" },
            { label: "Pending Requests", value: requests.length, icon: "person_add" },
            { label: "Total Events",     value: stats?.eventCount ?? headSociety.eventCount ?? "—", icon: "event" },
            { label: "Status",           value: headSociety.status ?? "active", icon: "verified", badge: statusColor },
          ].map((s) => (
            <Card key={s.label} padding="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#8b949e] text-xs mb-1">{s.label}</p>
                  {s.badge ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>{s.value}</span>
                  ) : (
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                  )}
                </div>
                <span className="material-symbols-outlined text-[#238636] text-3xl">{s.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#30363d] mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`mgmt-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-[#238636] border-[#238636]"
                  : "text-[#8b949e] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card padding="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Society Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Description", value: headSociety.description },
                  { label: "Category",    value: headSociety.category },
                  { label: "Created",     value: headSociety.createdAt ? new Date(headSociety.createdAt).toLocaleDateString() : "—" },
                  { label: "Campus",      value: headSociety.campusId ?? "—" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[#8b949e] text-xs mb-1">{item.label}</p>
                    <p className="text-white text-sm">{item.value || "—"}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── Members ── */}
        {activeTab === "members" && (
          <Card padding="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Members ({members.length})</h3>
            </div>
            {membersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-[#0d1117] border border-[#30363d] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <EmptyState icon="people" title="No members yet" description="Members will appear here once approved." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#30363d]">
                      {["Member", "Role", "Joined", "Actions"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-[#8b949e] font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => {
                      const profile = m.user?.profile ?? m.profile ?? {};
                      const name = profile.displayName ||
                        `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
                        m.user?.email || "Unknown";
                      const memberId = m._id || m.user?._id;
                      return (
                        <tr key={memberId} className="border-b border-[#30363d] hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {profile.avatar ? (
                                <img src={profile.avatar} alt={name} className="w-8 h-8 rounded-full object-cover border border-[#30363d]" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-white text-xs font-bold">
                                  {name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="text-white">{name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={m.role ?? "member"}
                              onChange={(e) => handleRoleChange(memberId, e.target.value)}
                              className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#238636]"
                            >
                              {["member", "moderator", "treasurer", "secretary"].map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-[#8b949e]">
                            {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemoveMember(memberId)}
                              className="text-[#f85149] hover:text-[#ff7b72] text-xs transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ── Events ── */}
        {activeTab === "events" && (
          <Card padding="p-12">
            <EmptyState
              icon="event"
              title="Society Events"
              description="Create and manage events for your society members."
              action={
                <Button onClick={() => navigate("/events")} variant="primary">
                  Go to Events
                </Button>
              }
            />
          </Card>
        )}

        {/* ── Announcements ── */}
        {activeTab === "announcements" && (
          <Card padding="p-12">
            <EmptyState
              icon="campaign"
              title="Announcements"
              description="Post announcements to keep your members informed."
            />
          </Card>
        )}

        {/* ── Analytics ── */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(stats).map(([key, val]) => (
                  typeof val === "number" && (
                    <Card key={key} padding="p-5">
                      <p className="text-[#8b949e] text-xs capitalize mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-2xl font-bold text-white">{val}</p>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <Card padding="p-12">
                <EmptyState icon="analytics" title="No analytics yet" description="Stats will appear once your society has activity." />
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
