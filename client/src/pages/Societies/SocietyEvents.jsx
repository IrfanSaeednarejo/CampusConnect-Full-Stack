import { useEffect, useState } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
import {
  fetchSocietyEventsByStatus,
  selectHQEvents,
  selectHQEventsLoading,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  AlertTriangle,
  Hourglass,
  CheckCircle2,
  Archive,
  CalendarOff,
  ChevronRight,
} from "lucide-react";
import { getButtonClassName } from "../../components/common/Button";
import { cn, getSocietyTheme } from "./societyTheme";

const STATUS_CFG = {
  registration: { label: "Registration Open", cls: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-400" },
  ongoing: { label: "Ongoing", cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400" },
  completed: { label: "Completed", cls: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700/30 dark:text-slate-300" },
  cancelled: { label: "Cancelled", cls: "border-danger/20 bg-danger/5 text-danger dark:border-danger/25 dark:bg-danger/10 dark:text-danger" },
  draft: { label: "Draft", cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400" },
  published: { label: "Published", cls: "border-info/20 bg-info/5 text-info dark:border-info/25 dark:bg-info/10 dark:text-info" },
  judging: { label: "Judging", cls: "border-info/20 bg-info/5 text-info dark:border-info/25 dark:bg-info/10 dark:text-info" },
  submission_locked: { label: "Submissions Closed", cls: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400" },
};

function fmt(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function EventCard({ event, navigate, showRejectionReason, theme, isDark }) {
  const cfg = STATUS_CFG[event.status] || {
    label: event.status,
    cls: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700/30 dark:text-slate-300",
  };

  return (
    <div className={cn("overflow-hidden rounded-3xl border transition-colors", theme.card)}>
      {event.coverImage && (
        <div className="relative h-40 overflow-hidden">
          <img src={event.coverImage} alt={event.title} className="h-full w-full object-cover" />
          <div className={cn("absolute inset-0", isDark ? "bg-black/20" : "bg-white/10")} />
        </div>
      )}

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className={cn("line-clamp-2 text-lg font-medium", theme.text)}>{event.title}</h4>
          <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase", cfg.cls)}>
            {cfg.label}
          </span>
        </div>

        {event.description && <p className={cn("line-clamp-2 text-sm", theme.muted)}>{event.description}</p>}

        {showRejectionReason && event.rejectionReason && (
          <div className="flex items-start gap-2 rounded-2xl border border-danger/20 bg-danger/5 px-3 py-3 text-sm text-danger dark:border-danger/25 dark:bg-danger/10 dark:text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-semibold">Reason:</span> {event.rejectionReason}
            </p>
          </div>
        )}

        <div className={cn("flex flex-wrap gap-x-4 gap-y-2 text-xs", theme.muted)}>
          {event.startAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {fmt(event.startAt)}
            </span>
          )}
          {event.startAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {fmtTime(event.startAt)}
            </span>
          )}
          {event.venue?.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue.address}
            </span>
          )}
        </div>

        <button
          onClick={() => navigate(`/events/${event._id}`)}
          className={getButtonClassName({
            variant: "secondary",
            size: "md",
            isDark,
            className: "w-full",
          })}
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message, action, theme }) {
  return (
    <div className={cn("col-span-full rounded-3xl border p-12 text-center", theme.card)}>
      <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border", theme.subtle)}>
        <Icon className={cn("h-7 w-7", theme.muted)} />
      </div>
      <h3 className={cn("text-lg font-medium", theme.text)}>{title}</h3>
      <p className={cn("mx-auto mt-2 max-w-sm text-sm", theme.muted)}>{message}</p>
      {action}
    </div>
  );
}

const TABS = [
  { key: "pending", label: "Pending", icon: Hourglass, color: "text-amber-600 dark:text-amber-400" },
  { key: "rejected", label: "Rejected", icon: AlertTriangle, color: "text-danger" },
  { key: "active", label: "Active", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "past", label: "Past", icon: Archive, color: "text-slate-600 dark:text-slate-400" },
];

export default function SocietyEvents() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const { headSociety, societyId } = useOutletContext() ?? {};
  const user = useSelector(selectUser);
  const hqEvents = useSelector(selectHQEvents);
  const loading = useSelector(selectHQEventsLoading);

  const isHead = headSociety?.createdBy?._id === user?._id || headSociety?.createdBy === user?._id;
  const tabParam = searchParams.get("tab") || "pending";
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

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
  const activeEvents = approvedEvents.filter((event) => !["completed", "cancelled"].includes(event.status) && new Date(event.endAt) >= now);
  const pastEvents = approvedEvents.filter((event) => ["completed", "cancelled"].includes(event.status) || new Date(event.endAt) < now);

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
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>Society Events</h1>
          <p className={cn("text-sm", theme.muted)}>Manage event approvals, live activity, and event history.</p>
        </div>

        {isHead && (
          <button
            onClick={() => navigate(`/society/${societyId}/events/create`)}
            className={getButtonClassName({
              variant: "primary",
              size: "md",
              isDark,
            })}
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Pending Review", value: counts.pending, cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400" },
          { label: "Rejected", value: counts.rejected, cls: "border-danger/20 bg-danger/5 text-danger dark:border-danger/25 dark:bg-danger/10 dark:text-danger" },
          { label: "Active", value: counts.active, cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400" },
          { label: "Past", value: counts.past, cls: theme.badgeMuted },
        ].map((item) => (
          <div key={item.label} className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", item.cls)}>
            {item.value} {item.label}
          </div>
        ))}
      </div>

      <div className={cn("inline-flex flex-wrap gap-2 rounded-2xl border p-2", theme.card)}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => changeTab(tab.key)}
            className={getButtonClassName({
              variant: activeTab === tab.key ? "primary" : "secondary",
              size: "sm",
              isDark,
            })}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.key ? tab.color : theme.muted)} />
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", activeTab === tab.key ? theme.badge : theme.badgeMuted)}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "pending" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300">
          <Hourglass className="mt-0.5 h-4 w-4 shrink-0" />
          <p>These events are awaiting admin review and will appear publicly only after approval.</p>
        </div>
      )}

      {activeTab === "rejected" && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger dark:border-danger/25 dark:bg-danger/10 dark:text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>These events were not approved. Review the rejection reason on each card before recreating the event.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={cn("h-60 animate-pulse rounded-3xl border", theme.card)} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {getEvents(activeTab).length > 0 ? (
            getEvents(activeTab).map((event) => (
              <EventCard
                key={event._id}
                event={event}
                navigate={navigate}
                showRejectionReason={activeTab === "rejected"}
                theme={theme}
                isDark={isDark}
              />
            ))
          ) : (
            <EmptyState
              icon={CalendarOff}
              title={
                activeTab === "pending"
                  ? "No Pending Events"
                  : activeTab === "rejected"
                    ? "No Rejected Events"
                    : activeTab === "active"
                      ? "No Active Events"
                      : "No Past Events"
              }
              message={
                activeTab === "pending"
                  ? "Events waiting for admin review will appear here."
                  : activeTab === "rejected"
                    ? "Events that were not approved will appear here."
                    : activeTab === "active"
                      ? "Approved and currently active events will appear here."
                      : "Completed or cancelled events will appear here."
              }
              action={
                activeTab === "active" && isHead ? (
                  <button
                    onClick={() => navigate(`/society/${societyId}/events/create`)}
                    className={getButtonClassName({
                      variant: "primary",
                      size: "md",
                      isDark,
                      className: "mx-auto mt-5",
                    })}
                  >
                    <Plus className="h-4 w-4" />
                    Create First Event
                  </button>
                ) : null
              }
              theme={theme}
            />
          )}
        </div>
      )}
    </div>
  );
}
