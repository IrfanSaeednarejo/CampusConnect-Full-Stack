import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSocietyEvents,
  selectSocietyEvents,
  selectEventsLoading,
} from "../../redux/slices/societySlice";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_CFG = {
  published:  { label: "Upcoming",  cls: "bg-blue-500/15 text-blue-400" },
  ongoing:    { label: "Ongoing",   cls: "bg-emerald-500/15 text-emerald-400" },
  completed:  { label: "Completed", cls: "bg-slate-500/15 text-slate-400" },
  cancelled:  { label: "Cancelled", cls: "bg-red-500/15 text-red-400" },
  draft:      { label: "Draft",     cls: "bg-amber-500/15 text-amber-400" },
};

function EventCard({ event, navigate }) {
  const statusCfg = STATUS_CFG[event.status] ?? { label: event.status, cls: "bg-slate-500/15 text-slate-400" };
  const banner = event.coverImage || event.banner;

  return (
    <div
      onClick={() => navigate(`/events/${event._id}`)}
      className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-slate-500 transition-all group"
    >
      <div className="h-40 bg-slate-700/40 relative overflow-hidden">
        {banner ? (
          <img src={banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl">event</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${statusCfg.cls}`}>{statusCfg.label}</span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-slate-200 font-semibold text-sm mb-1 line-clamp-1 group-hover:text-white transition-colors">{event.title}</h4>
        {event.description && (
          <p className="text-slate-500 text-xs line-clamp-2 mb-3">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            {formatDate(event.startDate)}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {event.venue}
            </span>
          )}
          {event.registrationCount !== undefined && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">person</span>
              {event.registrationCount} registered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EventSection({ title, icon, color, events, navigate }) {
  if (!events?.length) return null;
  return (
    <div>
      <h3 className={`font-semibold text-sm mb-4 flex items-center gap-2 ${color}`}>
        <span className="material-symbols-outlined text-base">{icon}</span>
        {title}
        <span className="text-slate-500 font-normal">({events.length})</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(ev => <EventCard key={ev._id} event={ev} navigate={navigate} />)}
      </div>
    </div>
  );
}

export default function SocietyEvents() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { societyId } = useOutletContext() ?? {};
  const events    = useSelector(selectSocietyEvents);
  const loading   = useSelector(selectEventsLoading);

  useEffect(() => {
    if (societyId) dispatch(fetchSocietyEvents(societyId));
  }, [dispatch, societyId]);

  const totalEvents = (events.upcoming?.length ?? 0) + (events.ongoing?.length ?? 0) + (events.past?.length ?? 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Society Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">All events organized by your society</p>
        </div>
        <button
          onClick={() => navigate("/events/create")}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl border border-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Create Event
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total",    value: totalEvents,                  cls: "bg-slate-800 text-slate-300 border-slate-700" },
          { label: "Upcoming", value: events.upcoming?.length ?? 0, cls: "bg-blue-500/10 text-blue-400 border-blue-500/25" },
          { label: "Ongoing",  value: events.ongoing?.length ?? 0,  cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
          { label: "Past",     value: events.past?.length ?? 0,     cls: "bg-slate-700/50 text-slate-500 border-slate-700" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${cls}`}>
            {value} {label}
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : totalEvents === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-slate-600 text-6xl block mb-4">event_busy</span>
          <p className="text-slate-300 font-semibold text-lg mb-1">No events yet</p>
          <p className="text-slate-500 text-sm mb-6">Create your first event to get started.</p>
          <button
            onClick={() => navigate("/events/create")}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl border border-slate-600 transition-colors text-sm"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          <EventSection title="Ongoing" icon="play_circle" color="text-emerald-400" events={events.ongoing} navigate={navigate} />
          <EventSection title="Upcoming" icon="upcoming" color="text-blue-400" events={events.upcoming} navigate={navigate} />
          <EventSection title="Past Events" icon="history" color="text-slate-400" events={events.past} navigate={navigate} />
        </div>
      )}
    </div>
  );
}
