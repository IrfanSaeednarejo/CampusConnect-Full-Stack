// FIX [Bug 1]: Removed hardcoded events array — now wired to Redux eventsSlice via fetchEvents thunk
// FIX [Bug 2]: Uses liveStatus (upcoming/ongoing/completed) derived in eventsApi.getAll() for correct button states
// FIX [Bug 3]: Register buttons have auth check, loading spinner, cancel toggle, and post-login intent
// FIX [Bug 4]: Added Upcoming / Past / All tabs with count badges
// FIX [Bug 5]: Added search bar and tag filter pills
// FIX [Bug 6]: Event card titles and "View Details" links navigate to /student/events (or open login modal)
// FIX [Bug 7]: Loading skeletons and error state with retry button

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotification } from "../contexts/NotificationContext";
import {
  fetchEvents,
  registerForEvent,
  cancelEventRegistration,
  selectUpcomingEvents,
  selectOngoingEvents,
  selectPastEvents,
} from "../redux/slices/eventsSlice";
import CTACard from "../components/common/CTACard";
import LoginPromptModal from "../components/modals/LoginPromptModal";

export default function Events() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { addNotification } = useNotification();

  // FIX [Bug 1]: Read from Redux (state.eventsLegacy — mapped in rootReducer)
  const { status, error } = useSelector((state) => state.eventsLegacy || {});
  const actionLoading = useSelector(
    (state) => state.eventsLegacy?.actionLoading ?? {}
  );
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const ongoingEvents = useSelector(selectOngoingEvents);
  const pastEvents = useSelector(selectPastEvents);

  // FIX [Bug 4]: Tabs
  const [activeTab, setActiveTab] = useState("upcoming");

  // FIX [Bug 5]: Search + tag filter
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const [showLoginModal, setShowLoginModal] = useState(false);

  // FIX [Bug 1]: Fetch events from mockStorage on mount
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // FIX [Bug 3]: Post-login intent — auto-register after login redirect
  useEffect(() => {
    if (isAuthenticated) {
      const action = sessionStorage.getItem("postLoginAction");
      const eventId = sessionStorage.getItem("postLoginEventId");
      if (action === "registerEvent" && eventId) {
        sessionStorage.removeItem("postLoginAction");
        sessionStorage.removeItem("postLoginEventId");
        dispatch(registerForEvent(eventId));
      }
    }
  }, [isAuthenticated, dispatch]);

  // FIX [Bug 4]: Compute tab data
  const activeTabEvents = useMemo(() => {
    if (activeTab === "upcoming") return [...ongoingEvents, ...upcomingEvents];
    if (activeTab === "past") return pastEvents;
    return [...ongoingEvents, ...upcomingEvents, ...pastEvents];
  }, [activeTab, upcomingEvents, ongoingEvents, pastEvents]);

  // FIX [Bug 5]: Derive unique tags across all events
  const allTags = useMemo(() => {
    const all = [...upcomingEvents, ...ongoingEvents, ...pastEvents];
    const tagSet = new Set();
    all.forEach((e) => (e.tags || []).forEach((t) => tagSet.add(t)));
    return ["All", ...Array.from(tagSet).sort()];
  }, [upcomingEvents, ongoingEvents, pastEvents]);

  // FIX [Bug 5]: Combined filter logic
  const displayedEvents = useMemo(() => {
    return activeTabEvents
      .filter((e) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (e.title || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q) ||
          (e.location || "").toLowerCase().includes(q)
        );
      })
      .filter((e) => {
        if (activeTag === "All") return true;
        return (e.tags || []).includes(activeTag);
      });
  }, [activeTabEvents, search, activeTag]);

  // FIX [Bug 3]: Register handler with auth check
  const handleRegister = (eventId) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("postLoginAction", "registerEvent");
      sessionStorage.setItem("postLoginEventId", eventId);
      setShowLoginModal(true);
      return;
    }
    dispatch(registerForEvent(eventId));
  };

  // FIX [Bug 3]: Cancel handler with confirmation
  const handleCancel = (eventId) => {
    if (window.confirm("Cancel your registration for this event?")) {
      dispatch(cancelEventRegistration(eventId));
    }
  };

  // FIX [Bug 6]: Detail navigation with auth check
  const handleViewDetails = (eventId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate("/student/events");
  };

  // Existing Create Event handler (confirmed working)
  const handleCreateEvent = () => {
    // CASE 1 — Not logged in at all
    if (!isAuthenticated) {
      sessionStorage.setItem("postLoginRedirect", "/events/create");
      setShowLoginModal(true);
      return;
    }

    // CASE 2 & 3 — Logged in as society_head or admin (the ONLY roles that can create)
    if (role === "society_head" || role === "admin") {
      navigate("/events/create");
      return;
    }

    // CASE 4 — Logged in but wrong role (student, mentor, alumni)
    // Show informational toast — do NOT navigate to access-denied
    addNotification({
      type: "info",
      title: "Society Head Access Required",
      message:
        "Only registered Society Heads can create events. Become a Society Head to unlock this feature.",
    });
  };

  // FIX [Bug 2]: Format date from ISO string
  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const formatTime = (isoStr) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // FIX [Bug 2]: Render action button per event status
  const renderActionButton = (event) => {
    const isLoading = actionLoading[event._id];
    const { liveStatus, isRegistered } = event;

    // Spinner SVG
    const spinner = (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    );

    if (isLoading) {
      return (
        <button
          disabled
          className="h-8 px-4 text-xs font-semibold rounded-lg bg-primary text-white flex items-center justify-center gap-2 opacity-70"
        >
          {spinner}
        </button>
      );
    }

    if (liveStatus === "completed") {
      return (
        <button
          disabled
          className="h-8 px-4 text-xs font-semibold rounded-lg bg-[#C7D2FE] text-text-secondary cursor-not-allowed"
        >
          Ended
        </button>
      );
    }

    if (liveStatus === "ongoing") {
      if (isRegistered) {
        return (
          <button
            onClick={() =>
              window.open(event.meetingLink || "#", "_blank")
            }
            className="h-8 px-4 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
          >
            Join Now
          </button>
        );
      }
      return (
        <button
          disabled
          className="h-8 px-4 text-xs font-semibold rounded-lg bg-[#C7D2FE] text-text-secondary cursor-not-allowed"
        >
          Registration Closed
        </button>
      );
    }

    // liveStatus === 'upcoming'
    if (isRegistered) {
      return (
        <button
          onClick={() => handleCancel(event._id)}
          className="h-8 px-4 text-xs font-semibold rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
        >
          Registered ✓
        </button>
      );
    }

    return (
      <button
        onClick={() => handleRegister(event._id)}
        className="h-8 px-4 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
      >
        Register
      </button>
    );
  };

  // FIX [Bug 2]: Status badge per event
  const renderStatusBadge = (liveStatus) => {
    if (liveStatus === "upcoming") {
      return (
        <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-primary/20 text-primary border border-primary/40">
          Upcoming
        </span>
      );
    }
    if (liveStatus === "ongoing") {
      return (
        <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-primary/20 text-primary border border-primary/20">
          Live Now 🔴
        </span>
      );
    }
    return (
      <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#C7D2FE] text-text-secondary border border-[#475569]">
        Ended
      </span>
    );
  };

  // Tab config
  const tabs = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: upcomingEvents.length + ongoingEvents.length,
    },
    { key: "past", label: "Past", count: pastEvents.length },
    {
      key: "all",
      label: "All",
      count:
        upcomingEvents.length + ongoingEvents.length + pastEvents.length,
    },
  ];

  return (
    <div className="w-full bg-background text-text-primary min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-text-primary text-4xl font-black leading-tight tracking-[-0.033em]">
            Campus Events
          </h1>
          <p className="text-text-secondary text-base mt-2">
            Discover and join exciting events happening on campus. From tech
            talks to social gatherings, find what interests you.
          </p>
        </div>

        {/* FIX [Bug 4]: Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
                  ? "text-primary border-b-2 border-[#3fb950] font-semibold"
                  : "text-text-secondary hover:text-text-primary"
                }`}
            >
              {tab.label}{" "}
              <span
                className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key
                    ? "bg-primary/20 text-primary"
                    : "bg-[#C7D2FE] text-text-secondary"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* FIX [Bug 5]: Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm placeholder-[#475569] focus:outline-none focus:border-[#3fb950] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            )}
          </div>
        </div>

        {/* FIX [Bug 5]: Tag Filter Pills */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === tag
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary border border-border hover:text-text-primary hover:border-[#475569]"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-text-secondary text-xs mb-6">
          Showing {displayedEvents.length} event
          {displayedEvents.length !== 1 ? "s" : ""}
        </p>

        {/* FIX [Bug 7]: Loading State — skeleton cards */}
        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-surface border border-border h-64 animate-pulse"
              >
                <div className="p-5 space-y-4">
                  <div className="h-5 bg-[#C7D2FE] rounded w-3/4" />
                  <div className="h-3 bg-[#C7D2FE] rounded w-1/2" />
                  <div className="h-3 bg-[#C7D2FE] rounded w-2/3" />
                  <div className="h-3 bg-[#C7D2FE] rounded w-full" />
                  <div className="h-3 bg-[#C7D2FE] rounded w-full" />
                  <div className="pt-6 flex justify-between items-center">
                    <div className="h-3 bg-[#C7D2FE] rounded w-20" />
                    <div className="h-8 bg-[#C7D2FE] rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FIX [Bug 7]: Error State */}
        {status === "failed" && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-20 h-20 bg-[#DC2626]/10 rounded-full flex items-center justify-center border border-[#DC2626]/30 mb-4">
              <span className="material-symbols-outlined text-4xl text-[#DC2626]">
                warning
              </span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              Could not load events
            </h3>
            <p className="text-text-secondary mb-6">
              {error || "Try refreshing the page."}
            </p>
            <button
              onClick={() => dispatch(fetchEvents())}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Refresh
            </button>
          </div>
        )}

        {/* Events Grid */}
        {status !== "loading" && status !== "failed" && (
          <>
            {displayedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedEvents.map((event) => (
                  <div
                    key={event._id}
                    className="relative flex flex-col gap-3 p-5 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors group"
                  >
                    {/* FIX [Bug 2]: Status Badge */}
                    {renderStatusBadge(event.liveStatus)}

                    {/* FIX [Bug 6]: Clickable Title */}
                    <h2
                      className="text-text-primary text-lg font-bold leading-tight cursor-pointer hover:text-primary transition-colors pr-24"
                      onClick={() => handleViewDetails(event._id)}
                    >
                      {event.title}
                    </h2>

                    <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
                      <p>
                        📅 {formatDate(event.startTime)}{" "}
                        {event.liveStatus !== "completed" &&
                          `– ${formatDate(event.endTime)}`}
                      </p>
                      <p>⏰ {formatTime(event.startTime)}</p>
                      <p>📍 {event.location}</p>
                      {event.organizer && (
                        <p>🏢 {event.organizer}</p>
                      )}
                    </div>

                    <p className="text-text-primary text-sm font-normal leading-normal line-clamp-2">
                      {event.description}
                    </p>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-border mt-auto">
                      {/* FIX [Bug 6]: View Details link */}
                      <span
                        onClick={() => handleViewDetails(event._id)}
                        className="text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer"
                      >
                        View Details →
                      </span>
                      {/* FIX [Bug 2,3]: Dynamic action button */}
                      {renderActionButton(event)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* FIX [Bug 4]: Empty state per tab */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-5xl text-[#C7D2FE] mb-4">
                  event_busy
                </span>
                <h3 className="text-lg font-bold text-text-primary mb-1">
                  No{" "}
                  {activeTab === "upcoming"
                    ? "upcoming"
                    : activeTab === "past"
                      ? "past"
                      : ""}{" "}
                  events
                  {search ? ` matching "${search}"` : ""}
                </h3>
                <p className="text-text-secondary text-sm">
                  Check back soon for new events.
                </p>
              </div>
            )}
          </>
        )}

        {/* CTA Section — confirmed working */}
        <CTACard
          title="Create an Event"
          description="Are you a society or organizer? Create an event on CampusConnect."
          buttonText="Create Event"
          onButtonClick={handleCreateEvent}
        />
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in or create an account to register for events."
      />
    </div>
  );
}
