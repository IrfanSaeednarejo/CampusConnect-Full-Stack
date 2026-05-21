import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchEvents,
  selectAllEvents,
  selectEventLoading,
  selectEventError,
} from '../../redux/slices/eventSlice';
import { selectUser } from '../../redux/slices/authSlice';
import { selectHasRole } from '../../redux/slices/authSlice';
import PageHeader from '../../components/common/PageHeader';
import Button, { getButtonClassName } from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import useHomeTheme from '../../hooks/useHomeTheme';

const STATE_COLORS = {
  draft:               'bg-slate-500/10 text-slate-500',
  registration_open:   'bg-primary/10 text-primary',
  registration_closed: 'bg-warning/10 text-warning',
  ongoing:             'bg-info/10 text-info',
  submission_open:     'bg-info/10 text-info',
  submission_closed:   'bg-slate-500/10 text-slate-500',
  judging:             'bg-info/10 text-info',
  results_published:   'bg-success/10 text-success',
  archived:            'bg-slate-600/30 text-slate-500',
};

const TYPE_ICONS = {
  hackathon:           'terminal',
  coding_competition:  'code',
  workshop:            'school',
  seminar:             'record_voice_over',
  general:             'event',
};

const CATEGORY_FILTERS = [
  { value: 'all',         label: 'All Events' },
  { value: 'hackathon',   label: 'Hackathons' },
  { value: 'workshop',    label: 'Workshops' },
  { value: 'seminar',     label: 'Seminars' },
  { value: 'competition', label: 'Competitions' },
];

function EventCard({ event, onClick, isDark }) {
  const status     = event.status ?? 'draft';
  const colorClass = STATE_COLORS[status] ?? STATE_COLORS.draft;
  const icon       = TYPE_ICONS[event.eventType] ?? 'event';
  const startDate  = event.startAt ? new Date(event.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const regOpen    = status === 'registration_open';

  return (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all ${
        isDark
          ? "border-border-dark bg-surface-dark hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
          : "border-border-light bg-surface-light hover:border-info/35 hover:shadow-lg hover:shadow-info/5"
      }`}
    >
      {/* Cover / Hero */}
      <div className={`relative flex h-36 items-center justify-center overflow-hidden ${isDark ? "bg-background-dark" : "bg-slate-100"}`}>
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
        ) : (
          <span className={`material-symbols-outlined text-6xl transition-colors ${isDark ? "text-border-dark group-hover:text-primary/40" : "text-slate-300 group-hover:text-info/40"}`}>
            {icon}
          </span>
        )}
        <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${colorClass}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-1">
          <span className={`text-xs capitalize ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{event.category ?? event.eventType ?? 'general'}</span>
        </div>
        <h3 className={`mb-2 line-clamp-2 text-base font-bold transition-colors ${isDark ? "text-text-primary-dark group-hover:text-info" : "text-text-primary-light group-hover:text-info"}`}>
          {event.title}
        </h3>
        <p className={`mb-4 flex-1 line-clamp-2 text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
          {event.description ?? 'No description provided.'}
        </p>

        {/* Footer */}
        <div className={`flex items-center justify-between border-t pt-3 ${isDark ? "border-border-dark" : "border-border-light"}`}>
          <div className={`flex items-center gap-1 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {startDate}
          </div>
          {event.maxCapacity > 0 && (
            <div className={`flex items-center gap-1 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              <span className="material-symbols-outlined text-sm">people</span>
              {event.registrationCount ?? 0}/{event.maxCapacity}
            </div>
          )}
        </div>

        {regOpen && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={getButtonClassName({
              variant: "primary",
              size: "sm",
              isDark,
              className: "mt-3 w-full py-1.5 text-xs font-semibold",
            })}
          >
            Register Now
          </button>
        )}
      </div>
    </div>
  );
}

export default function EventsFeed() {
  const isDark = useHomeTheme();
  const dispatch  = useNavigate ? useNavigate : null; // satisfy lint
  const nav       = useNavigate();
  const dispatchR = useDispatch();

  const events  = useSelector(selectAllEvents);
  const loading = useSelector(selectEventLoading);
  const error   = useSelector(selectEventError);
  const user    = useSelector(selectUser);
  const isHead  = useSelector(selectHasRole('society_head'));
  const isAdmin = useSelector(selectHasRole('admin'));

  const [activeFilter, setActiveFilter] = useState('all');
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    dispatchR(fetchEvents({}));
  }, [dispatchR]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchCat = activeFilter === 'all' ||
        e.eventType === activeFilter ||
        e.category  === activeFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [events, activeFilter, search]);

  const upcoming = useMemo(() =>
    events.filter(e => e.status === 'registration_open').slice(0, 3),
    [events]
  );

  return (
    <div className={`min-h-screen pb-16 ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <PageHeader
          title="Events"
          subtitle="Discover hackathons, workshops, and competitions on your campus"
          icon="event"
          showBack={false}
          action={
            (isHead || isAdmin) && (
              <Button
                id="create-event-btn"
                onClick={() => nav('/events/create')}
                variant="primary"
                size="sm"
              >
                <span className="material-symbols-outlined text-sm mr-1">add</span>
                Create Event
              </Button>
            )
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">

          {/* ── Main Feed ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>search</span>
                <input
                  id="event-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events…"
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-4 transition-colors focus:outline-none ${isDark ? "border-border-dark bg-surface-dark text-text-primary-dark placeholder:text-text-secondary-dark focus:border-primary" : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light focus:border-primary"}`}
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  type="button"
                  key={f.value}
                  id={`filter-${f.value}`}
                  onClick={() => setActiveFilter(f.value)}
                  className={getButtonClassName({
                    variant: activeFilter === f.value ? "primary" : "secondary",
                    size: "sm",
                    isDark,
                    className: "rounded-full px-3 py-1.5 text-xs font-medium",
                  })}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`h-72 rounded-2xl border animate-pulse ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
              <Card padding="p-12">
                <EmptyState
                  icon="event_busy"
                  title="No events found"
                  description={search ? 'Try adjusting your search.' : 'No events are available right now.'}
                  action={
                    (isHead || isAdmin) && (
                      <Button onClick={() => nav('/events/create')} variant="primary">
                        Create the first event
                      </Button>
                    )
                  }
                />
              </Card>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isDark={isDark}
                    onClick={() => nav(`/events/${event._id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Upcoming registrations */}
            <div className={`rounded-2xl border p-5 ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
              <h3 className={`mb-4 flex items-center gap-2 text-sm font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                <span className="material-symbols-outlined text-lg text-primary">local_fire_department</span>
                Registration Open
              </h3>
              {upcoming.length === 0 ? (
                <p className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>No open registrations right now.</p>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((e) => (
                    <div
                      key={e._id}
                      onClick={() => nav(`/events/${e._id}`)}
                      className="flex gap-3 group cursor-pointer"
                    >
                      <div className={`h-10 w-10 flex-shrink-0 rounded-xl border transition-all ${isDark ? "border-border-dark bg-background-dark group-hover:border-primary" : "border-border-light bg-slate-50 group-hover:border-info"} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-base ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                          {TYPE_ICONS[e.eventType] ?? 'event'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-xs font-semibold transition-colors ${isDark ? "text-text-primary-dark group-hover:text-info" : "text-text-primary-light group-hover:text-info"}`}>{e.title}</p>
                        <p className={`mt-0.5 text-[10px] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                          {e.startAt ? new Date(e.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                          {e.registrationCount !== undefined ? ` · ${e.registrationCount} registered` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Host CTA */}
            {(isHead || isAdmin) && (
              <div className={`rounded-2xl border p-5 text-center ${isDark ? "border-border-dark bg-container-dark" : "border-border-light bg-surface-light"}`}>
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${isDark ? "border-info bg-background-dark text-info" : "border-info/30 bg-info/5 text-info"}`}>
                  <span className="material-symbols-outlined text-2xl">emoji_events</span>
                </div>
                <h3 className={`mb-1 text-sm font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>Host an Event</h3>
                <p className={`mb-4 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Inspire your community. Create a hackathon, workshop, or seminar today.</p>
                <Button
                  onClick={() => nav('/events/create')}
                  variant="primary"
                  className="w-full text-xs"
                >
                  Create Event
                </Button>
              </div>
            )}

            {/* My events link */}
            <button
              type="button"
              onClick={() => nav('/my-events')}
              className={getButtonClassName({
                variant: "secondary",
                size: "md",
                isDark,
                className: "w-full justify-between p-4 text-left group",
              })}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">event_available</span>
                <span className={`text-sm font-medium transition-colors ${isDark ? "text-text-primary-dark group-hover:text-info" : "text-text-primary-light group-hover:text-info"}`}>My Events</span>
              </div>
              <span className={`material-symbols-outlined text-lg ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
