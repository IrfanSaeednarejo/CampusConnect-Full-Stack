import { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet, NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent, selectEventLoading, selectEventError } from "../../../redux/slices/eventSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import EventStatusBadge from "../../../components/events/Shared/EventStatusBadge";
import { selectUser } from "../../../redux/slices/authSlice";
import EnrollmentCTA from "../../../components/events/Detail/EnrollmentCTA";

import useEventSocket from "../../../hooks/useEventSocket";

export default function EventDetailLayout() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const event = useSelector(selectSelectedEvent);
  const loading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const user = useSelector(selectUser);

  // Hook into live Websocket updates broadly for the event ecosystem
  useEventSocket(id);

  useEffect(() => {
    if (id) dispatch(fetchEventById(id));
  }, [dispatch, id]);

  if (loading && !event) return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  if (!event && !loading) return <div className="h-screen flex justify-center items-center bg-[#0d1117] text-[#8b949e]">Event Not Found</div>;

  const isCreator = user?._id === event.createdBy?._id || user?.id === event.createdBy;
  const isAdmin = user?.roles?.includes("admin");
  const isJudge = event?.judgingConfig?.judges?.some(j => (j._id || j) === user?._id);

  const userRegistration = event?.registrations?.find(r => r.userId === user?._id || r.userId?._id === user?._id);
  const isRegistered = !!userRegistration;
  const isApproved = userRegistration?.status === "approved";

  // Check if we are in management mode (manage or edit sub-routes)
  const isManagementRoute = location.pathname.endsWith("/manage") || location.pathname.endsWith("/edit") || location.pathname.endsWith("/judging");

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] selection:bg-[#1f6feb]/30">

      {/* Event Hero Banner - Hidden in Management Mode to save space */}
      {!isManagementRoute && (
        <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden group">
          {event.coverImage ? (
            <div className="absolute inset-0">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#161b22] to-[#0d1117] flex justify-center items-center">
              <span className="material-symbols-outlined text-[120px] text-[#30363d] animate-pulse">landscape</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/20 to-transparent"></div>

          <div className="absolute bottom-0 w-full px-4 sm:px-10 lg:px-20 pb-12">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <EventStatusBadge status={event.status} />
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {event.category}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-[#8b949e]">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-[#1f6feb] text-xl">location_on</span>
                    {event.venue?.type === 'online' ? 'Global Online Access' : event.venue?.address}
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-[#1dc964] text-xl">schedule</span>
                    {new Date(event.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 ${!isManagementRoute ? '-mt-10 pb-20' : 'py-6'} relative z-20`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Main Content Column - Expanded if in Management Mode */}
          <div className={`${isManagementRoute ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>

            {/* Glassmorphic Navigation Tabs */}
            <div className="p-1.5 bg-[#161b22]/90 backdrop-blur-2xl border border-[#30363d] rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-xl sticky top-2 z-30">
              <NavLink
                end
                to=""
                className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'bg-[#1f6feb] text-white shadow-lg shadow-blue-500/20' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                Overview
              </NavLink>
              <NavLink
                to="teams"
                className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'bg-[#1f6feb] text-white shadow-lg shadow-blue-500/20' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-lg">groups</span>
                Roster
              </NavLink>
              <NavLink
                to="leaderboard"
                className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'bg-[#1f6feb] text-white shadow-lg shadow-blue-500/20' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-lg">trophy</span>
                Leaderboard
              </NavLink>

              {isApproved && (event.participationType === "team" || event.participationType === "both") && (
                <NavLink to="my-team" className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'bg-[#1f6feb] text-white shadow-lg shadow-blue-500/20' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}>
                  <span className="material-symbols-outlined text-lg">rocket_launch</span>
                  My Team
                </NavLink>
              )}

              {isApproved && ['ongoing', 'submission_open'].includes(event.status) && (
                <NavLink to="submission" className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'bg-[#1f6feb] text-white shadow-lg shadow-blue-500/20' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}>
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                  Submission
                </NavLink>
              )}

              {(isCreator || isAdmin) && (
                <NavLink to="manage" className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}>
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Manage HQ
                </NavLink>
              )}

              {(isCreator || isAdmin || isJudge) && (
                <NavLink to="judging" className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-[#8b949e] hover:text-white hover:bg-white/5'}`}>
                  <span className="material-symbols-outlined text-lg">gavel</span>
                  Judging
                </NavLink>
              )}
            </div>

            {/* Sub-routes Content - Larger rounded corners and full flex-1 */}
            <div className={`bg-[#0d1117] border border-[#30363d] rounded-3xl overflow-hidden min-h-[600px] ${isManagementRoute ? 'shadow-none border-none bg-transparent' : 'shadow-2xl'}`}>
              <Outlet />
            </div>
          </div>

          {/* Right Sidebar - Hidden in Management Mode */}
          {!isManagementRoute && (
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-24 space-y-8">
                <EnrollmentCTA
                  eventId={event._id}
                  status={event.status}
                  isOnlineCompetition={event.isOnlineCompetition}
                  registrationOpen={event.registrationOpen}
                  spotsRemaining={event.spotsRemaining}
                  isFull={event.isFull}
                  isRegistered={isRegistered}
                  registrationStatus={userRegistration?.status}
                  onEnroll={() => navigate("register")}
                />

                <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-3xl space-y-6 relative overflow-hidden group shadow-xl">
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1f6feb] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[#1f6feb] rounded-full"></span>
                    Event Logistics
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#8b949e] group-hover/item:text-[#1f6feb] group-hover/item:border-[#1f6feb]/50 transition-all">
                        <span className="material-symbols-outlined">category</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8b949e] uppercase tracking-widest font-black">Type</p>
                        <p className="text-sm text-white font-bold capitalize">{event.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#8b949e] group-hover/item:text-[#1dc964] group-hover/item:border-[#1dc964]/50 transition-all">
                        <span className="material-symbols-outlined">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8b949e] uppercase tracking-widest font-black">Timeline</p>
                        <p className="text-sm text-white font-bold">
                          {new Date(event.startAt).toLocaleDateString()} — {new Date(event.endAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#8b949e] group-hover/item:text-amber-400 group-hover/item:border-amber-400/50 transition-all">
                        <span className="material-symbols-outlined">groups</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8b949e] uppercase tracking-widest font-black">Capacity</p>
                        <p className="text-sm text-white font-bold">
                          {event.registrationCount} <span className="text-[#8b949e] font-medium">/</span> {event.maxCapacity || '∞'} Seats
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

