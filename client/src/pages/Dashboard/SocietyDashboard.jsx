import { useState, useEffect } from "react";
import DashboardTopBar from "@/components/common/DashboardTopBar";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { useModal, MODAL_TYPES } from "@/contexts/ModalContext";
import {
  selectRegisteredSocieties,
  fetchUserSocieties,
  fetchPendingRequests,
  selectMemberRequests,
  removeMemberRequest,
} from "@/redux/slices/societySlice";
import {
  selectUpcomingEvents,
  fetchUpcomingEvents,
} from "@/redux/slices/eventSlice";

/* ─── Sidebar Nav Items ─── */
const NAV_ITEMS = [
  { path: "/society/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/society/list", label: "Societies", icon: "groups" },
  { path: "/society/events", label: "Events", icon: "event" },
  { path: "/society/manage", label: "Manage", icon: "settings" },
  { path: "/society/mentoring", label: "Mentoring", icon: "school" },
  { path: "/society/networking", label: "Networking", icon: "lan" },
  { path: "/society/analytics", label: "Analytics", icon: "analytics" },
  { path: "/society/member-requests", label: "Requests", icon: "person_add" },
  { path: "/society/profile", label: "Profile", icon: "person" },
];

export default function SocietyDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const { user } = useAuth();

  const societies = useSelector(selectRegisteredSocieties) || [];
  const upcomingEvents = useSelector(selectUpcomingEvents) || [];
  const memberRequests = useSelector(selectMemberRequests) || [];
  const [isExpanded, setIsExpanded] = useState(true);

  const displayName =
    user?.profile?.displayName ||
    `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() ||
    user?.email?.split("@")[0] ||
    "Society Head";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      dispatch(fetchUserSocieties(userId));
      dispatch(fetchUpcomingEvents({ campusId: user.campusId, limit: 5 }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (societies.length > 0 && userId) {
      societies.forEach((soc) => {
        const creatorId = typeof soc.createdBy === "object" ? soc.createdBy?._id || soc.createdBy?.id : soc.createdBy;
        if (creatorId === userId) {
          dispatch(fetchPendingRequests(soc._id || soc.id));
        }
      });
    }
  }, [dispatch, societies, user]);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Stats
  const totalMembers = societies.reduce((sum, s) => sum + (s.members?.length || s.memberCount || 0), 0);
  const statCards = [
    { label: "My Societies", value: societies.length, icon: "groups", gradient: "from-primary to-indigo-800" },
    { label: "Total Members", value: totalMembers, icon: "people", gradient: "from-cyan-600 to-cyan-800" },
    { label: "Upcoming Events", value: upcomingEvents.length, icon: "event", gradient: "from-emerald-600 to-emerald-800" },
    { label: "Pending Requests", value: memberRequests.length, icon: "person_add", gradient: "from-amber-600 to-amber-800" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Collapsible Sidebar ─── */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto scrollbar-hide bg-surface transition-all duration-300 ease-in-out ${isExpanded ? "w-60" : "w-[68px] items-center"
          }`}
      >
        {/* Logo + Toggle */}
        <div className={`p-4 flex items-center border-b border-border ${isExpanded ? "justify-between gap-3" : "justify-center"}`}>
          {isExpanded && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <span className="text-text-primary font-bold text-base tracking-tight truncate">CampusConnect</span>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-md hover:bg-surface-hover transition-colors shrink-0"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExpanded ? "left_panel_close" : "left_panel_open"}
            </span>
          </button>
        </div>



        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isExpanded ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all no-underline ${isExpanded ? "px-3 py-2.5" : "justify-center w-10 h-10 mx-auto px-0"
                  } ${isActive
                    ? "bg-primary/15 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                {isExpanded && <span className="truncate">{item.label}</span>}
                {isExpanded && item.label === "Requests" && memberRequests.length > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                    {memberRequests.length > 9 ? "9+" : memberRequests.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => openModal(MODAL_TYPES.CREATE_SOCIETY)}
            className={`flex items-center gap-2 w-full rounded-lg text-sm font-bold text-white bg-primary hover:opacity-90 transition-opacity ${isExpanded ? "px-3 py-2.5 justify-center" : "justify-center w-10 h-10 mx-auto px-0"
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {isExpanded && <span>Create Society</span>}
          </button>
          <Link
            to="/logout"
            title={!isExpanded ? "Logout" : undefined}
            className={`flex items-center gap-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors no-underline ${isExpanded ? "px-3 py-2.5" : "justify-center w-10 h-10 mx-auto px-0"
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {isExpanded && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          title="Society HQ"
          notificationsPath={null}
          profilePath="/society/profile"
          roleBadge="Society Head"
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-text-primary text-2xl font-bold">
              {greeting}, {displayName}! 👋
            </h1>
            <p className="text-text-secondary text-sm mt-1">Oversee your societies and campus impact.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-xl p-4 bg-surface border border-border hover:border-primary/30 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3`}>
                  <span className="material-symbols-outlined text-white text-[20px]">{card.icon}</span>
                </div>
                <p className="text-text-primary text-2xl font-bold">{card.value}</p>
                <p className="text-text-secondary text-xs mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Societies — 2 cols */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">My Societies</h2>
                <button onClick={() => navigate("/societies")} className="text-primary text-sm font-medium hover:underline">View All</button>
              </div>
              {societies.length > 0 ? (
                <div className="space-y-3">
                  {societies.map((society) => {
                    const initial = (society.name || "S")[0].toUpperCase();
                    const imgUrl = society.logo || society.image || society.media?.logo;
                    return (
                      <button
                        key={society._id || society.id}
                        onClick={() => navigate("/society/manage")}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors text-left"
                      >
                        {imgUrl && imgUrl.length > 5 ? (
                          <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-border" style={{ backgroundImage: `url("${imgUrl}")` }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">{initial}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-semibold truncate">{society.name}</p>
                          <p className="text-text-secondary text-[10px]">{society.members?.length || society.memberCount || 0} members</p>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-4xl mb-2">group_off</span>
                  <p className="text-text-primary text-sm font-medium">No societies yet</p>
                  <button onClick={() => openModal(MODAL_TYPES.CREATE_SOCIETY)} className="mt-2 text-primary text-sm font-medium hover:underline">Create Your First Society →</button>
                </div>
              )}
            </div>

            {/* Approvals Needed — 1 col */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-text-primary text-lg font-bold">Approvals</h2>
                {memberRequests.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">{memberRequests.length} pending</span>
                )}
              </div>
              {memberRequests.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {memberRequests.map((req) => {
                    const name = req.memberId?.profile?.displayName || req.userId?.profile?.displayName || req.name || "User";
                    const avatar = req.memberId?.profile?.avatar || req.userId?.profile?.avatar;
                    const memberId = req.memberId?._id || req.userId?._id || req._id;
                    const societyId = req.societyId?._id || req.societyId;
                    return (
                      <div key={req._id || memberId} className="bg-background border border-border rounded-lg p-3 flex items-center gap-3">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">{name.charAt(0).toUpperCase()}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-medium truncate">{name}</p>
                          <p className="text-text-secondary text-[10px]">Wants to join</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={async () => {
                              try {
                                const { approveSocietyMember } = await import("@/api/societyApi");
                                await approveSocietyMember(societyId, memberId);
                                dispatch(removeMemberRequest(req._id || memberId));
                              } catch (err) { console.error("Approve failed:", err); }
                            }}
                            className="px-3 py-1.5 bg-primary text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const { rejectSocietyMember } = await import("@/api/societyApi");
                                await rejectSocietyMember(societyId, memberId);
                                dispatch(removeMemberRequest(req._id || memberId));
                              } catch (err) { console.error("Reject failed:", err); }
                            }}
                            className="px-3 py-1.5 bg-transparent border border-red-500 text-red-500 rounded-md text-xs font-bold hover:bg-red-500/10 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="material-symbols-outlined text-primary text-4xl mb-2">check_circle</span>
                  <p className="text-text-primary text-sm font-medium">All clear!</p>
                  <p className="text-text-secondary text-xs mt-1">No pending member requests.</p>
                </div>
              )}
            </div>

            {/* Upcoming Events — 2 cols */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">Upcoming Events</h2>
                <button
                  onClick={() => navigate("/society/events")}
                  className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Event
                </button>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const startDate = new Date(event.startAt);
                    const month = startDate.toLocaleString("default", { month: "short" }).toUpperCase();
                    const day = startDate.getDate().toString().padStart(2, "0");
                    const time = startDate.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <button
                        key={event._id || event.id}
                        onClick={() => navigate("/society/events")}
                        className="w-full flex items-center gap-4 text-left hover:bg-surface-hover rounded-lg p-2 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center bg-background border border-border rounded-lg p-2 w-14 text-center shrink-0">
                          <span className="text-text-secondary text-[9px] font-bold uppercase">{month}</span>
                          <span className="text-text-primary text-xl font-black">{day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-primary text-sm truncate">{event.title}</p>
                          <p className="text-text-secondary text-xs truncate">{event.societyId?.name || "Campus Event"} • {time}</p>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-text-secondary text-sm text-center py-6">No upcoming events scheduled.</p>
              )}
            </div>

            {/* Analytics Summary — 1 col */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="text-text-primary text-lg font-bold mb-4">Analytics</h2>
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-text-secondary text-xs">Total Members</p>
                  <p className="text-text-primary text-2xl font-bold mt-1">{totalMembers.toLocaleString()}</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-text-secondary text-xs">Active Societies</p>
                  <p className="text-text-primary text-2xl font-bold mt-1">{societies.length}</p>
                </div>
                <button
                  onClick={() => navigate("/society/analytics")}
                  className="w-full py-2.5 text-primary text-sm font-semibold border border-border rounded-lg hover:bg-surface-hover transition-colors"
                >
                  View Full Analytics →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div >
  );
}
