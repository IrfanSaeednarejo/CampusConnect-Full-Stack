import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSocietyById,
  fetchSocietyMembers,
  joinSocietyThunk,
  leaveSocietyThunk,
  selectCurrentSociety,
  selectSocietyMembers,
  selectSocietyLoading,
  selectMembersLoading,
  selectSocietyError,
  clearCurrentSociety,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { useAuth } from "../../hooks/useAuth";

const TABS = ["overview", "members", "events"];

export default function SocietyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const { isAuthenticated, openAuth } = useAuth();

  const society        = useSelector(selectCurrentSociety);
  const members        = useSelector(selectSocietyMembers);
  const loading        = useSelector(selectSocietyLoading);
  const membersLoading = useSelector(selectMembersLoading);
  const error          = useSelector(selectSocietyError);
  const user           = useSelector(selectUser);

  const [activeTab,   setActiveTab]   = useState("overview");
  const [actionBusy,  setActionBusy]  = useState(false);

  // Load society + members on mount
  useEffect(() => {
    dispatch(fetchSocietyById(id));
    dispatch(fetchSocietyMembers({ id }));
    return () => { dispatch(clearCurrentSociety()); };
  }, [dispatch, id]);

  // Derive membership — check if logged-in user is in the members list
  const isMember = members.some(
    (m) => (m.user?._id || m.user || m._id) === user?._id
  );

  // Also check if current user is the society_head
  const isHead = society?.createdBy === user?._id ||
    society?.adminId === user?._id;

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    setActionBusy(true);
    try {
      if (isMember) {
        await dispatch(leaveSocietyThunk(id)).unwrap();
        showSuccess("You have left the society.");
        dispatch(fetchSocietyMembers({ id }));
      } else {
        await dispatch(joinSocietyThunk(id)).unwrap();
        showSuccess("Successfully joined the society!");
        dispatch(fetchSocietyMembers({ id }));
      }
    } catch (err) {
      showError(err || "Action failed. Please try again.");
    } finally {
      setActionBusy(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 py-8 w-full space-y-6 animate-pulse">
          <div className="h-10 bg-[#161b22] rounded w-1/2" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#161b22] border border-[#30363d] rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-[#161b22] border border-[#30363d] rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────────────
  if (error || (!loading && !society)) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d1117] items-center justify-center p-8">
        <Card padding="p-12">
          <EmptyState
            icon="error"
            title="Society not found"
            description={error || "This society doesn't exist or has been removed."}
            action={
              <Button onClick={() => navigate("/societies/browse")} variant="primary">
                Back to Societies
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
    rejected:  "bg-[#f85149]/20 text-[#f85149]",
  }[society.status] ?? "bg-[#8b949e]/20 text-[#8b949e]";

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title={society.name}
        subtitle={society.description}
        icon="groups"
        backPath="/societies/browse"
        action={
          <div className="flex gap-3 flex-wrap">
            {isHead && (
              <Button
                onClick={() => navigate(`/society/manage`)}
                variant="secondary"
                size="sm"
              >
                <span className="material-symbols-outlined text-sm mr-1">settings</span>
                Manage
              </Button>
            )}
            <Button
              id="join-leave-btn"
              onClick={handleJoinLeave}
              variant={isMember ? "secondary" : "primary"}
              size="sm"
              disabled={actionBusy || society.status !== "active"}
            >
              {actionBusy
                ? "Processing…"
                : isMember
                ? "Leave Society"
                : "Join Society"}
            </Button>
          </div>
        }
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Pending / Suspended Banner */}
        {society.status !== "active" && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            society.status === "pending"
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
              : "bg-[#f85149]/10 border-[#f85149]/30 text-[#f85149]"
          }`}>
            <span className="material-symbols-outlined">
              {society.status === "pending" ? "pending" : "block"}
            </span>
            <div>
              <p className="font-semibold capitalize">{society.status}</p>
              {society.statusReason && (
                <p className="text-sm opacity-80">{society.statusReason}</p>
              )}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Members", value: society.memberCount ?? members.length, icon: "people" },
            { label: "Category", value: society.category ?? "—", icon: "category" },
            { label: "Status", value: society.status ?? "active", icon: "verified", badge: statusColor },
            { label: "Founded", value: society.createdAt ? new Date(society.createdAt).getFullYear() : "—", icon: "calendar_today" },
          ].map((stat) => (
            <Card key={stat.label} padding="p-4">
              <div className="flex flex-col items-center text-center gap-1">
                <span className="material-symbols-outlined text-2xl text-[#238636]">{stat.icon}</span>
                {stat.badge ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.badge}`}>
                    {stat.value}
                  </span>
                ) : (
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                )}
                <div className="text-xs text-[#8b949e]">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#30363d]">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-[#238636] border-[#238636]"
                  : "text-[#8b949e] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <Card padding="p-6">
            <h3 className="text-lg font-bold text-white mb-3">About</h3>
            <p className="text-[#8b949e] mb-6 leading-relaxed">
              {society.description || "No description provided."}
            </p>
            {society.contact?.email && (
              <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                <span className="material-symbols-outlined text-sm">email</span>
                <a href={`mailto:${society.contact.email}`} className="hover:text-[#238636] transition-colors">
                  {society.contact.email}
                </a>
              </div>
            )}
          </Card>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {membersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
              ))
            ) : members.length === 0 ? (
              <Card padding="p-12">
                <EmptyState icon="people" title="No members yet" description="Be the first to join this society!" />
              </Card>
            ) : (
              members.map((m) => {
                const profile = m.user?.profile ?? m.profile ?? {};
                const name = profile.displayName || profile.firstName
                  ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
                  : m.user?.email ?? "Unknown";
                const avatar = profile.avatar;
                const initials = name.slice(0, 2).toUpperCase();
                return (
                  <Card key={m._id || m.user?._id} padding="p-4" hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-[#30363d]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#238636] flex items-center justify-center text-white text-xs font-bold">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">{name}</p>
                          <p className="text-[#8b949e] text-xs capitalize">{m.role ?? "member"}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#8b949e]">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <Card padding="p-12">
            <EmptyState
              icon="event"
              title="Events"
              description="Society events are managed through the Events module."
              action={
                <Button onClick={() => navigate("/events")} variant="secondary">
                  Browse Events
                </Button>
              }
            />
          </Card>
        )}
      </main>
    </div>
  );
}
