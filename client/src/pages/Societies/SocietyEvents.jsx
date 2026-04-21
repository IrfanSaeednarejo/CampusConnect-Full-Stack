import { useEffect, useState } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSocietyEventsByStatus,
  selectHQEvents,
  selectHQEventsLoading,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";
import { Calendar, Clock, MapPin, Plus, AlertTriangle, Hourglass, CheckCircle2, Archive, CalendarOff, ChevronRight } from "lucide-react";

const STATUS_CFG = {
  registration:     { label: "Registration Open", cls: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  ongoing:          { label: "Ongoing",            cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  completed:        { label: "Completed",          cls: "bg-slate-500/15 text-slate-400 border-slate-700" },
  cancelled:        { label: "Cancelled",          cls: "bg-red-500/15 text-red-400 border-red-500/25" },
  draft:            { label: "Draft",              cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  published:        { label: "Published",          cls: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25" },
  judging:          { label: "Judging",            cls: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  submission_locked:{ label: "Submissions Closed", cls: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
};

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function EventCard({ event, navigate, showRejectionReason }) {
  const cfg = STATUS_CFG[event.status] ?? { label: event.status, cls: "bg-slate-500/15 text-slate-400 border-slate-700" };
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-all group">
      {event.coverImage && (
        <div className="h-36 overflow-hidden relative">
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors line-clamp-2">{event.title}</h4>
          <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${cfg.cls}`}>{cfg.label}</span>
        </div>
        {event.description && <p className="text-slate-500 text-xs line-clamp-2">{event.description}</p>}
        {showRejectionReason && event.rejectionReason && (
          <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/25 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300"><span className="font-semibold">Reason: </span>{event.rejectionReason}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          {event.startAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(event.startAt)}</span>}
          {event.startAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(event.startAt)}</span>}
          {event.venue?.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue.address}</span>}
        </div>
        <button onClick={() => navigate(`/events/${event._id}`)} className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700">
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-800/30 border border-slate-700 rounded-2xl text-center">
      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-600" />
      </div>
      <h3 className="text-slate-300 font-semibold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs">{message}</p>
      {action}
    </div>
  );
}

const TABS = [
  { key: "pending",  label: "Pending",  icon: Hourglass,     bucket: "pending_admin_review",  color: "text-amber-400" },
  { key: "rejected", label: "Rejected", icon: AlertTriangle,  bucket: "rejected",              color: "text-red-400" },
  { key: "active",   label: "Active",   icon: CheckCircle2,   bucket: "approved",              color: "text-emerald-400" },
  { key: "past",     label: "Past",     icon: Archive,        bucket: "approved",              color: "text-slate-400" },
];

export default function SocietyEvents() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { headSociety, societyId } = useOutletContext() ?? {};
  const user = useSelector(selectUser);
  const hqEvents = useSelector(selectHQEvents);
  const loading = useSelector(selectHQEventsLoading);

  const isHead = headSociety?.createdBy?._id === user?._id || headSociety?.createdBy === user?._id;

  const tabParam = searchParams.get("tab") || "pending";
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => { setActiveTab(tabParam); }, [tabParam]);

  const changeTab = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    if (!societyId) return;
    dispatch(fetchSocietyEventsByStatus({ societyId, approvalStatus: "pending_admin_review" }));
    dispatch(fetchSocietyEventsByStatus({ societyId, approvalStatus: "rejected" }));
    dispatch(fetchSocietyEventsByStatus({ societyId, approvalStatus: "approved" }));
  }, [dispatch, societyId]);

  const now = new Date();
  const approvedEvents = hqEvents.approved || [];
  const activeEvents = approvedEvents.filter(e => !["completed","cancelled"].includes(e.status) && new Date(e.endAt) >= now);
  const pastEvents = approvedEvents.filter(e => ["completed","cancelled"].includes(e.status) || new Date(e.endAt) < now);

  const counts = {
    pending: hqEvents.pending?.length || 0,
    rejected: hqEvents.rejected?.length || 0,
    active: activeEvents.length,
    past: pastEvents.length,
  };

  const getEvents = (key) => {
    if (key === "pending") return hqEvents.pending || [];
    if (key === "rejected") return hqEvents.rejected || [];
    if (key === "active") return activeEvents;
    return pastEvents;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Society Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track all events for this society</p>
        </div>
        {isHead && (
          <button
            onClick={() => navigate(`/society/${societyId}/events/create`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Pending Review", value: counts.pending, cls: "bg-amber-500/10 text-amber-400 border-amber-500/25" },
          { label: "Rejected",       value: counts.rejected, cls: "bg-red-500/10 text-red-400 border-red-500/25" },
          { label: "Active",         value: counts.active,  cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
          { label: "Past",           value: counts.past,    cls: "bg-slate-700/50 text-slate-500 border-slate-700" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${cls}`}>
            {value} {label}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl border border-slate-700 w-fit">
        {TABS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? "bg-slate-700 text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${activeTab === key ? color : ""}`} />
            {label}
            {counts[key] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === key ? "bg-slate-600 text-slate-200" : "bg-slate-700 text-slate-400"
              }`}>{counts[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Helpers */}
      {activeTab === "pending" && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-xs">
          <Hourglass className="w-4 h-4 shrink-0 mt-0.5" />
          <p>These events are awaiting admin review. They will not appear publicly until approved. You will receive a notification when the admin takes action.</p>
        </div>
      )}
      {activeTab === "rejected" && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>These events were not approved by the admin. Review the reason below each event. You may create a new event addressing the admin's concerns.</p>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getEvents(activeTab).length > 0 ? (
            getEvents(activeTab).map(ev => (
              <EventCard
                key={ev._id}
                event={ev}
                navigate={navigate}
                showRejectionReason={activeTab === "rejected"}
              />
            ))
          ) : (
            <EmptyState
              icon={CalendarOff}
              title={
                activeTab === "pending" ? "No Pending Events" :
                activeTab === "rejected" ? "No Rejected Events" :
                activeTab === "active" ? "No Active Events" : "No Past Events"
              }
              message={
                activeTab === "pending" ? "Events waiting for admin review will appear here." :
                activeTab === "rejected" ? "Events that were not approved will appear here." :
                activeTab === "active" ? "Approved and live events will appear here." :
                "Completed or cancelled events will appear here."
              }
              action={
                activeTab === "active" && isHead ? (
                  <button onClick={() => navigate(`/society/${societyId}/events/create`)} className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" /> Create First Event
                  </button>
                ) : null
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
