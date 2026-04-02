import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { useModal, MODAL_TYPES } from "@/contexts/ModalContext";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import SocietySummary from "@/components/dashboard/SocietySummary";
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

export default function SocietyDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const societies = useSelector(selectRegisteredSocieties) || [];
  const upcomingEvents = useSelector(selectUpcomingEvents) || [];
  const memberRequests = useSelector(selectMemberRequests) || [];
  const { user } = useAuth();

  const displayName =
    user?.profile?.displayName ||
    `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""
      }`.trim() ||
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
      dispatch(fetchUpcomingEvents({ campusId: user.campusId, limit: 3 }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Fetch pending requests for societies led by this user
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-background border-r border-border hidden lg:flex">
        <div className="flex h-full flex-col justify-between p-4">
          {/* Top Section */}
          <div className="flex flex-col gap-4">
            {/* Profile */}
            <button
              onClick={() => navigate("/society/profile")}
              className="flex gap-3 items-center hover:opacity-80 transition-opacity cursor-pointer text-left overflow-hidden"
            >
              {user?.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <h1 className="text-white text-base font-medium leading-normal truncate">
                  {displayName}
                </h1>
                <p className="text-text-secondary text-sm font-normal leading-normal truncate">
                  Society Head
                </p>
              </div>
            </button>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 mt-4">
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface"
                to="/society/dashboard"
              >
                <span className="material-symbols-outlined text-white">
                  dashboard
                </span>
                <p className="text-white text-sm font-medium leading-normal">
                  Dashboard
                </p>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface/50 transition-colors"
                to="/societies"
              >
                <span className="material-symbols-outlined text-text-secondary">
                  groups
                </span>
                <p className="text-text-secondary text-sm font-medium leading-normal">
                  Societies
                </p>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface/50 transition-colors"
                to="/society/events"
              >
                <span className="material-symbols-outlined text-text-secondary">
                  event
                </span>
                <p className="text-text-secondary text-sm font-medium leading-normal">
                  Events
                </p>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface/50 transition-colors"
                to="/society/mentoring"
              >
                <span className="material-symbols-outlined text-text-secondary">
                  school
                </span>
                <p className="text-text-secondary text-sm font-medium leading-normal">
                  Mentoring
                </p>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface/50 transition-colors"
                to="/society/networking"
              >
                <span className="material-symbols-outlined text-text-secondary">
                  lan
                </span>
                <p className="text-text-secondary text-sm font-medium leading-normal">
                  Networking
                </p>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface/50 transition-colors"
                to="/society/analytics"
              >
                <span className="material-symbols-outlined text-text-secondary">
                  analytics
                </span>
                <p className="text-text-secondary text-sm font-medium leading-normal">
                  Analytics
                </p>
              </Link>
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openModal(MODAL_TYPES.CREATE_SOCIETY)}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
            >
              <span className="truncate">Create New</span>
            </button>
            <div className="flex flex-col gap-1 border-t border-border pt-2 mt-2">
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface/50 transition-colors"
                to="/society/settings"
              >
                <span className="material-symbols-outlined text-text-secondary">
                  settings
                </span>
                <p className="text-text-secondary text-sm font-medium leading-normal">
                  Settings
                </p>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface/50 transition-colors"
                to="/logout"
              >
                <span className="material-symbols-outlined text-text-secondary">
                  logout
                </span>
                <p className="text-text-secondary text-sm font-medium leading-normal">
                  Logout
                </p>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                Society HQ
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal">
                Oversee your societies and campus impact
              </p>
            </div>
            <button
              onClick={() => openModal(MODAL_TYPES.CREATE_SOCIETY)}
              className="flex min-w-[5rem] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-5 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-white">
                add_circle
              </span>
              <span className="truncate">Create New Society</span>
            </button>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Societies Section (2 columns) */}
            <SocietySummary
              title="My Societies"
              societies={societies}
              variant="list"
              onItemAction={() => navigate("/society/manage")}
            />

            {/* Approvals Needed Widget */}
            <section className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
                Approvals Needed
              </h2>
              {memberRequests.length > 0 ? (
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                  {memberRequests.map((req) => {
                    const name = req.memberId?.profile?.displayName || req.userId?.profile?.displayName || req.name || "User";
                    const avatar = req.memberId?.profile?.avatar || req.userId?.profile?.avatar;
                    const memberId = req.memberId?._id || req.userId?._id || req._id;
                    const societyId = req.societyId?._id || req.societyId;
                    return (
                      <div key={req._id || memberId} className="bg-background border border-border rounded-lg p-3 flex items-center gap-3">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{name}</p>
                          <p className="text-text-secondary text-xs">Wants to join</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
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
                            className="px-3 py-1.5 bg-transparent border border-[#f85149] text-[#f85149] rounded-md text-xs font-bold hover:bg-[#f85149]/10 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-text-secondary">
                  <span className="material-symbols-outlined text-3xl mb-2 block">check_circle</span>
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </section>

            {/* Upcoming Events Section (2 columns) */}
            <section className="lg:col-span-2 bg-surface border border-border rounded-lg p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Upcoming Events
                </h2>
                <button
                  onClick={() => navigate("/society/events")}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-surface-hover text-white gap-2 text-sm font-medium leading-normal hover:bg-surface-hover/80 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span className="truncate">Add Event</span>
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => {
                    const startDate = new Date(event.startAt);
                    const month = startDate.toLocaleString("default", { month: "short" }).toUpperCase();
                    const dateObj = startDate.getDate().toString().padStart(2, '0');
                    const timeObj = startDate.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div key={event._id || event.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center bg-surface-hover rounded-md p-2 w-14 text-center flex-shrink-0">
                          <span className="text-text-secondary text-xs font-bold uppercase">
                            {month}
                          </span>
                          <span className="text-white text-2xl font-black">
                            {dateObj}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{event.title}</p>
                          <p className="text-sm text-text-secondary truncate">
                            {event.societyId?.name || "Campus Event"} • {timeObj}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-text-secondary text-sm">No upcoming events scheduled.</p>
                )}
              </div>
            </section>

            {/* Society Analytics Widget */}
            <AnalyticsWidget
              title="Society Analytics"
              options={["All Societies", ...societies.map(s => s.name)]}
              statLabel="Total Members"
              statValue={societies.reduce((sum, s) => sum + (s.members?.length || s.memberCount || 0), 0).toLocaleString()}
              trendLabel={`${societies.length} active societ${societies.length === 1 ? 'y' : 'ies'}`}
              onOpen={() => navigate("/society/analytics")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
