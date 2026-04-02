import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getEventById } from "../../api/eventApi";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function EventDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("id");
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getEventById(eventId);
        setEvent(res.data);
      } catch (err) {
        setError(err?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [eventId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#112118] text-[#1dc964]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1dc964] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary animate-pulse">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || (!event && eventId)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#112118] text-white p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-text-secondary mb-6 max-w-md">{error || "The event you're looking for doesn't exist or is no longer available."}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90">
          Go Back
        </button>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#112118] text-white p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-[#1dc964] mb-4">dashboard_customize</span>
        <h2 className="text-2xl font-bold mb-2">Event Dashboard</h2>
        <p className="text-text-secondary mb-6 max-w-md">Select an event from your list to view detailed analytics and manage participants.</p>
        <button onClick={() => navigate("/mentor-events")} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90">
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display text-text-primary bg-[#112118] overflow-x-hidden">
      <MentorTopBar backPath="/mentor-events" />
      
      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 py-8 max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="relative rounded-3xl overflow-hidden bg-surface border border-border mb-8 shadow-2xl">
          {event.coverImage ? (
            <div className="h-64 w-full relative">
              <img src={event.coverImage} className="w-full h-full object-cover opacity-60" alt="Cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent" />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-[#1dc964]/20 to-[#0d1117] flex items-center justify-center" />
          )}
          
          <div className="p-8 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#1dc96422] text-[#1dc964] border border-[#1dc96444] mb-4 inline-block tracking-wider">
                  {event.status}
                </span>
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-text-secondary text-sm">
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    {formatDate(event.startAt)}
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {event.venue?.type || event.venue || "Campus Location"}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-primary text-white font-black rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[#1dc96433]">
                  Edit Event
                </button>
                <button className="p-3 bg-[#30363d] text-white rounded-xl hover:bg-[#484f58] transition-colors">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <section className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1dc964]">description</span>
                About Event
              </h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {event.description || "No description provided for this event."}
              </p>
            </section>

            <section className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1dc964]">group</span>
                Registered Participants
              </h2>
              {event.teamCount > 0 ? (
                <div className="flex flex-col gap-4 text-center py-10 opacity-50">
                  <span className="material-symbols-outlined text-5xl mb-2">analytics</span>
                  <p>Participation analytics coming soon for this event.</p>
                  <p className="text-sm">{event.teamCount} teams registered so far.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary border-2 border-dashed border-border rounded-xl">
                  <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                  <p>No participants registered yet.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="flex flex-col gap-8">
            <section className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-white text-lg font-bold mb-4">Event Details</h2>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-text-secondary text-sm font-medium">Organizer</span>
                  <span className="text-white text-sm font-semibold">{event.societyId?.name || "Campus Society"}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-text-secondary text-sm font-medium">Status</span>
                  <span className="text-[#1dc964] text-xs font-bold uppercase">{event.status}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-text-secondary text-sm font-medium">Category</span>
                  <span className="text-white text-sm font-semibold">{event.category || "General"}</span>
                </div>
                <div className="flex justify-between items-start py-2">
                  <span className="text-text-secondary text-sm font-medium">Type</span>
                  <span className="text-white text-sm font-semibold capitalize">{event.eventType || "Workshop"}</span>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#1dc96411] to-transparent border border-[#1dc96433] rounded-2xl p-6">
              <h2 className="text-white text-lg font-bold mb-2">Registration Open</h2>
              <p className="text-text-secondary text-xs mb-4 leading-normal">
                Registration for this event is currently active. Participants can join the event through the campus portal.
              </p>
              <div className="p-3 bg-background rounded-xl border border-[#1dc96422] flex items-center justify-between">
                <span className="text-[#1dc964] font-bold text-lg">{event.teamCount || 0}</span>
                <span className="text-text-secondary text-xs uppercase font-black">Active Registrations</span>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
