import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEvents } from "../../api/eventApi";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import SharedFooter from "../../components/common/SharedFooter";

export default function MentorEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await getAllEvents();
        const items = res.data?.docs || res.data || [];
        setEvents(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(err?.message || "Failed to load events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-500/20 text-gray-400",
      registration: "bg-blue-500/20 text-blue-400",
      ongoing: "bg-primary/20 text-[#1dc964]",
      completed: "bg-[#9eb7a9]/20 text-text-secondary",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return colors[status?.toLowerCase()] || "bg-primary/20 text-[#1dc964]";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                Campus Events
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal">
                Browse and participate in campus events and competitions
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="w-10 h-10 border-4 border-[#1dc964] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-secondary">Loading events...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const eId = event._id || event.id;
                  const title = event.title || event.name || "Untitled Event";
                  const status = event.status || "upcoming";
                  const startDate = event.startAt || event.startDate || event.date;
                  const endDate = event.endAt || event.endDate;
                  const location = event.venue || event.location || "Online";
                  const participants = event.registrations?.length || event.attendees || 0;
                  const coverImage = event.coverImage || event.image;
                  const description = event.description || "";

                  return (
                    <div
                      key={eId}
                      className="flex flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-[#1dc964] transition-colors"
                    >
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-[#1dc964]/20 to-[#0d1117] flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-[#1dc964]/40">
                            event
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-3 p-5 flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-white font-semibold text-lg flex-1 line-clamp-2">
                            {title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 capitalize ${getStatusColor(status)}`}
                          >
                            {status}
                          </span>
                        </div>

                        {description && (
                          <p className="text-text-secondary text-sm line-clamp-2">{description}</p>
                        )}

                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <span className="material-symbols-outlined text-base">calendar_today</span>
                          {formatDate(startDate)}
                          {endDate && ` — ${formatDate(endDate)}`}
                        </div>

                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {location}
                        </div>

                        <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                          <span className="material-symbols-outlined text-base">people</span>
                          {participants} participant{participants !== 1 ? "s" : ""}
                        </div>

                        <button
                          onClick={() => navigate(`/event/dashboard?id=${eId}`)}
                          className="mt-4 w-full px-4 py-2 bg-primary text-white font-bold rounded hover:opacity-90 transition-opacity"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-text-secondary">
                  event_busy
                </span>
                <div>
                  <p className="text-white text-lg font-bold">No events yet</p>
                  <p className="text-text-secondary text-sm">
                    Campus events and competitions will appear here once they're created.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        <SharedFooter />
      </div>
    </div>
  );
}
