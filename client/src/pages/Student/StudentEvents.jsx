import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEvents,
  registerForEvent,
  cancelEventRegistration,
  selectUpcomingEvents,
  selectPastEvents,
  selectOngoingEvents,
  selectEventActionLoading,
} from "../../redux/slices/eventsSlice";
import { useModal, MODAL_TYPES } from "../../contexts/ModalContext";

// --- SUBCOMPONENTS ---

function EventActionBlock({ event }) {
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const isLoading = useSelector((state) => selectEventActionLoading(state, event._id));
  
  const { liveStatus, isRegistered } = event;

  let buttonText = "Action";
  let buttonAction = null;
  let disabled = false;
  let icon = "";
  let baseClasses = "w-full flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] transition-colors";
  let activeClasses = "";

  if (liveStatus === 'upcoming') {
    if (!isRegistered) {
      buttonText = "Register Now";
      icon = "add_circle";
      activeClasses = "bg-primary text-[#0d1117] hover:bg-primary-hover";
      buttonAction = () => openModal(MODAL_TYPES.REGISTER_EVENT, { 
        eventId: event._id,
        onConfirm: () => dispatch(registerForEvent(event._id))
      });
    } else {
      buttonText = "Registered ✓";
      icon = "check_circle";
      activeClasses = "bg-surface text-primary border border-primary hover:bg-primary/10";
      buttonAction = () => openModal(MODAL_TYPES.CANCEL_EVENT_REGISTRATION, { 
        eventId: event._id,
        onConfirm: () => dispatch(cancelEventRegistration(event._id))
      });
    }
  } else if (liveStatus === 'ongoing') {
    if (isRegistered) {
      buttonText = "Join Now";
      icon = "videocam";
      activeClasses = "bg-blue-600 text-white hover:bg-blue-500";
      buttonAction = () => window.open(event.meetingLink || "https://meet.google.com/mock-link-123", '_blank');
    } else {
      buttonText = "Registration Closed";
      icon = "do_not_disturb";
      disabled = true;
      activeClasses = "bg-[#30363d] text-text-secondary cursor-not-allowed";
    }
  } else if (liveStatus === 'completed') {
    if (isRegistered) {
      buttonText = "View Details";
      icon = "info";
      activeClasses = "bg-surface text-text-primary border border-border hover:bg-[#30363d]";
      buttonAction = () => navigate(`/student/events`); // FIX [C2]: Navigate instead of alert()
    } else {
      buttonText = "Ended";
      icon = "event_available";
      disabled = true;
      activeClasses = "bg-[#30363d] text-text-secondary cursor-not-allowed";
    }
  }

  return (
    <button 
      onClick={buttonAction} 
      disabled={disabled || isLoading}
      className={`${baseClasses} ${activeClasses} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          <span className="material-symbols-outlined text-base">
            {icon}
          </span>
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}

// --- MAIN COMPONENT ---

export default function StudentEvents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState("upcoming");

  // Get user profile and auth state
  const userProfile = useSelector((state) => state.user?.profile);
  const authUser = useSelector((state) => state.auth?.user);
  const campusId = authUser?.campusId || userProfile?.campusId;

  const status = useSelector((state) => state.eventsLegacy?.status);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const pastEvents = useSelector(selectPastEvents);
  const ongoingEvents = useSelector(selectOngoingEvents);

  useEffect(() => {
    const filters = campusId ? { campusId } : {};
    dispatch(fetchEvents(filters));
  }, [dispatch, campusId]);

  const displayEvents = activeTab === "upcoming" ? [...ongoingEvents, ...upcomingEvents] : pastEvents;

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">


      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 py-5 md:py-10 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">All Events</h1>
          <p className="text-text-secondary">Discover and register for campus events in your institution.</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-surface border border-border rounded-lg p-2 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "upcoming"
                ? "bg-primary text-white"
                : "text-text-primary hover:bg-[#30363d]"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">event_upcoming</span>
              Upcoming ({(upcomingEvents.length + ongoingEvents.length)})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "past"
                ? "bg-primary text-white"
                : "text-text-primary hover:bg-[#30363d]"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">event_note</span>
              Past ({pastEvents.length})
            </span>
          </button>
        </div>

        {/* Loading Skeletons */}
        {status === 'loading' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-surface h-72 rounded-lg border border-border"></div>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {status === 'succeeded' && displayEvents.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">
              event_busy
            </span>
            <h3 className="text-xl font-bold text-white mb-2">No {activeTab} events yet</h3>
            <p className="text-text-secondary">Check back later for new opportunities.</p>
          </div>
        ) : status === 'succeeded' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event) => (
              <div
                key={event._id}
                className="bg-surface border border-border rounded-lg flex flex-col overflow-hidden hover:border-primary/50 transition-colors"
              >
                {/* Event Image Placeholder */}
                <div className="h-40 bg-surface relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105"
                    style={{ backgroundImage: `url("${event.coverImage || event.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9RA_fMuSaLKstjcMP5ozR-vSaxtqQ_kzINRu0QEbitLaiaOGSvhHQ0t3zi1Py769dste1tAWujcMGzeKsHP3LIDU8GpBrAtxlzAEKMTgoN2PCuAMYnxMVStac_6sgv9hNluDqsTZg4B7sFD-1sE6Uqn7KpdMC_eKzapyTUfan20XYGE2tBdjBB1D9B7MnCMh1-NNhn67QqbuDD5OKhys_-_9nTeollnRzd23QBgopcA4rmFIaSDdXU_42pp-765L5mTwpjWlySM8'}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent opacity-60"></div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        event.liveStatus === "ongoing"
                          ? "bg-blue-600 border-blue-500 text-white animate-pulse"
                          : event.isRegistered
                          ? "bg-primary/10 text-primary border-primary"
                          : "bg-surface text-text-secondary border-border"
                      }`}
                    >
                      {event.liveStatus === 'ongoing' ? 'LIVE NOW' : (event.isRegistered ? "Registered" : "Available")}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div>
                    <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                      {event.organizer || event.society?.name || "Society Event"}
                    </p>
                    <h3 className="text-white text-lg font-bold leading-tight">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-text-secondary text-sm line-clamp-2 min-h-[40px]">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 py-3 mt-auto border-t border-b border-border">
                    <div className="flex items-center gap-2 text-text-primary text-sm">
                      <span className="material-symbols-outlined text-text-secondary">calendar_month</span>
                      <span>
                        {new Date(event.startAt || event.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-text-primary text-sm">
                      <span className="material-symbols-outlined text-text-secondary">location_on</span>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Action Button Block */}
                  <EventActionBlock event={event} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
