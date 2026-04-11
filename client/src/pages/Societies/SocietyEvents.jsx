import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAllEvents } from "@/api/eventApi";
import { getUserSocieties } from "@/api/societyApi";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import { useNotification } from "../../contexts/NotificationContext";
import { deleteEvent } from "@/api/eventApi";

export default function SocietyEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let societies = [];
        try {
          const userId = user?._id || user?.id;
          const socRes = await getUserSocieties(userId);
          societies = socRes.data || socRes || [];
        } catch (socErr) {
          console.error("Failed to fetch user societies:", socErr);
        }

        if (societies.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }

        // Fetch events for each society the user manages/belongs to
        const results = await Promise.all(
          societies.map(async (soc) => {
            try {
              const res = await getAllEvents({ societyId: soc._id || soc.id, limit: 100 });
              // Backend returns { docs, totalDocs, ... } for paginated results
              return res.data?.docs || res.data?.items || (Array.isArray(res.data) ? res.data : (res.docs || []));
            } catch (err) {
              console.error(`Failed to fetch events for society ${soc.name}:`, err);
              return [];
            }
          })
        );

        // Flatten the results and remove duplicates if any
        const allMyEvents = results.flat();
        const uniqueEvents = Array.from(new Map(allMyEvents.map(e => [e._id || e.id, e])).values());

        setEvents(uniqueEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    const targetUserId = user?._id || user?.id;
    if (targetUserId) fetchEvents();
  }, [user]);

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => (e._id || e.id) !== eventId));
      addNotification({
        type: 'success',
        title: 'Event Deleted',
        message: `"${title}" has been removed successfully.`
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete event.'
      });
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      draft: "Draft",
      registration: "Upcoming",
      ongoing: "Ongoing",
      submission_locked: "Submissions Locked",
      judging: "Judging",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return map[status] || status;
  };

  const isUpcoming = (s) => ["registration", "ongoing", "draft"].includes(s);
  const isCompleted = (s) => ["completed", "cancelled", "judging"].includes(s);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (filter === "all") return true;
        if (filter === "upcoming") return isUpcoming(event.status);
        if (filter === "completed") return isCompleted(event.status);
        return true;
      }),
    [events, filter]
  );

  const totalRegistrations = events.reduce(
    (sum, e) => sum + (e.registrations?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <SocietyPageHeader
        title="Society Events"
        subtitle="Manage and organize your events"
        icon="event"
        backPath="/society/dashboard"
        action={
          <button
            onClick={() => navigate("/events/create")}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create Event
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface/80 hover:text-text-primary"
                }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "upcoming"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface/80 hover:text-text-primary"
                }`}
            >
              Upcoming ({events.filter((e) => isUpcoming(e.status)).length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "completed"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface/80 hover:text-text-primary"
                }`}
            >
              Completed ({events.filter((e) => isCompleted(e.status)).length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary/40 block mb-4">
              event
            </span>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No events found
            </h3>
            <p className="text-text-secondary">
              Create your first event to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const startDate = event.startAt ? new Date(event.startAt) : null;
              const dateStr = startDate
                ? startDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : "TBD";
              const timeStr = startDate
                ? startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                : "";
              const statusLabel = getStatusLabel(event.status);
              const isUpcomingStatus = isUpcoming(event.status);

              return (
                <div
                  key={event._id}
                  className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div
                    className="h-48 bg-cover bg-center bg-surface-hover"
                    style={
                      event.coverImage
                        ? { backgroundImage: `url("${event.coverImage}")` }
                        : {}
                    }
                  >
                    {!event.coverImage && (
                      <div className="h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-text-secondary/30">
                          event
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${isUpcomingStatus
                          ? "bg-primary/20 text-primary"
                          : "bg-text-secondary/20 text-text-secondary"
                          }`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-text-secondary text-xs truncate ml-2">
                        {typeof event.societyId === "object"
                          ? event.societyId?.name
                          : ""}
                      </span>
                    </div>
                    <h3 className="text-text-primary font-bold text-lg mb-2 truncate">
                      {event.title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span>{dateStr}</span>
                      </div>
                      {timeStr && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>
                          <span>{timeStr}</span>
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="material-symbols-outlined text-sm">
                            location_on
                          </span>
                          <span>{typeof event.venue === 'string' ? event.venue : event.venue.address || 'Online'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="material-symbols-outlined text-sm">
                          group
                        </span>
                        <span>
                          {event.registrations?.length || 0}/
                          {event.maxParticipants || "∞"} registered
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/event/dashboard?id=${event._id || event.id}`)}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id || event.id, event.title)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        title="Delete Event"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {events.length}
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Events</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {events.filter((e) => isUpcoming(e.status)).length}
            </div>
            <div className="text-sm text-text-secondary mt-1">Upcoming</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {totalRegistrations}
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Registrations</div>
          </div>
        </div>
      </main>
    </div>
  );
}
