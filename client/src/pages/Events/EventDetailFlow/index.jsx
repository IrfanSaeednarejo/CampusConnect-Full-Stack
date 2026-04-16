import { useEffect, useState } from "react";
import { useParams, useNavigate, Routes, Route, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent, selectEventLoading, selectEventError } from "../../../redux/slices/eventSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import EventStatusBadge from "../../../components/events/Shared/EventStatusBadge";
import { selectUser } from "../../../redux/slices/authSlice";
import EnrollmentCTA from "../../../components/events/Detail/EnrollmentCTA";

import OverviewTab from "../../../components/events/Detail/OverviewTab";
import TeamsTab from "../../../components/events/Detail/TeamsTab";
import LeaderboardTab from "../../../components/events/Detail/LeaderboardTab";

import useEventSocket from "../../../hooks/useEventSocket";

export default function EventDetailLayout() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const event = useSelector(selectSelectedEvent);
  const loading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const user = useSelector(selectUser);

  // Hook into live Websocket updates broadly for the event ecosystem
  useEventSocket(id);

  useEffect(() => {
    if (id) dispatch(fetchEventById(id));
  }, [dispatch, id]);

  if (loading) return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  if (error || !event) return <div className="h-screen flex justify-center items-center bg-[#0d1117] text-[#8b949e]">Event Not Found</div>;

  const isCreator = user?._id === event.createdBy?._id || user?.id === event.createdBy;
  const isParticipant = true; // Would check against user status

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Event Hero Banner */}
      <div className="w-full h-64 md:h-80 relative bg-[#161b22] border-b border-[#30363d]">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <span className="material-symbols-outlined text-8xl text-[#30363d]">space_dashboard</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent"></div>
        <div className="absolute bottom-0 w-full px-4 sm:px-10 lg:px-20 pb-8 flex justify-between items-end">
          <div>
            <EventStatusBadge status={event.status} className="mb-4" />
            <h1 className="text-4xl md:text-5xl font-black text-white">{event.title}</h1>
            <p className="text-lg text-[#8b949e] mt-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              {event.venue?.type === 'online' ? 'Online Event' : event.venue?.address}
            </p>
          </div>
          {isCreator && (
            <button 
              onClick={() => navigate(`/events/${id}/edit`)}
              className="bg-[#21262d] text-white px-4 py-2 rounded-lg border border-[#30363d] hover:bg-[#30363d] transition-colors"
            >
              Manage Event
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-20 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Left/Center Column for Tabs */}
        <div className="lg:col-span-3">
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-[#30363d] mb-6">
            <NavLink end to={`/events/${id}`} className={({isActive}) => `px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-[#1dc964] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}>
              Overview
            </NavLink>
            <NavLink to={`/events/${id}/teams`} className={({isActive}) => `px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-[#1dc964] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}>
              Teams & Participants
            </NavLink>
            <NavLink to={`/events/${id}/leaderboard`} className={({isActive}) => `px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-[#1dc964] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}>
              Leaderboard
            </NavLink>
          </div>

          {/* Sub-routes Content */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden min-h-[400px]">
            <Routes>
              <Route index element={<OverviewTab />} />
              <Route path="teams" element={<TeamsTab />} />
              <Route path="leaderboard" element={<LeaderboardTab />} />
            </Routes>
          </div>
        </div>

        {/* Right Sidebar (Details & CTA) */}
        <div className="lg:col-span-1 space-y-6">
          <EnrollmentCTA 
            eventId={event._id}
            status={event.status}
            isOnlineCompetition={event.isOnlineCompetition}
            registrationOpen={event.registrationOpen}
            spotsRemaining={event.spotsRemaining}
            isFull={event.isFull}
            onEnroll={() => navigate(`/events/${id}/register`)}
          />

          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl space-y-4">
            <h3 className="font-bold text-white border-b border-[#30363d] pb-2">Event Scope</h3>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8b949e]">category</span>
              <div>
                <p className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Category</p>
                <p className="text-sm text-white capitalize">{event.category}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8b949e]">calendar_month</span>
              <div>
                <p className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Start</p>
                <p className="text-sm text-white">{new Date(event.startAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8b949e]">event_busy</span>
              <div>
                <p className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">End</p>
                <p className="text-sm text-white">{new Date(event.endAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8b949e]">groups</span>
              <div>
                <p className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Capacity</p>
                <p className="text-sm text-white">{event.registrationCount} / {event.maxCapacity || '∞'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
