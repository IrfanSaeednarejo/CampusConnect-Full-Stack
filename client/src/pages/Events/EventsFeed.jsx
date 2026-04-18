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
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

const STATE_COLORS = {
  draft:               'bg-[#8b949e]/20 text-[#8b949e]',
  registration_open:   'bg-[#238636]/20 text-[#238636]',
  registration_closed: 'bg-yellow-500/20 text-yellow-400',
  ongoing:             'bg-[#1f6feb]/20 text-[#58a6ff]',
  submission_open:     'bg-purple-500/20 text-purple-400',
  submission_closed:   'bg-[#8b949e]/20 text-[#8b949e]',
  judging:             'bg-orange-500/20 text-orange-400',
  results_published:   'bg-[#238636]/20 text-[#238636]',
  archived:            'bg-[#30363d]/60 text-[#8b949e]',
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

function EventCard({ event, onClick }) {
  const status     = event.status ?? 'draft';
  const colorClass = STATE_COLORS[status] ?? STATE_COLORS.draft;
  const icon       = TYPE_ICONS[event.eventType] ?? 'event';
  const startDate  = event.startAt ? new Date(event.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const regOpen    = status === 'registration_open';

  return (
    <div
      onClick={onClick}
      className="group bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden hover:border-[#238636]/60 hover:shadow-lg hover:shadow-[#238636]/5 transition-all cursor-pointer flex flex-col"
    >
      {/* Cover / Hero */}
      <div className="h-36 relative bg-[#0d1117] flex items-center justify-center overflow-hidden">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
        ) : (
          <span className="material-symbols-outlined text-6xl text-[#30363d] group-hover:text-[#238636]/40 transition-colors">
            {icon}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent" />
        <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${colorClass}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-1">
          <span className="text-xs text-[#8b949e] capitalize">{event.category ?? event.eventType ?? 'general'}</span>
        </div>
        <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-[#58a6ff] transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-[#8b949e] line-clamp-2 flex-1 mb-4">
          {event.description ?? 'No description provided.'}
        </p>

        {/* Footer */}
        <div className="pt-3 border-t border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-[#8b949e]">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {startDate}
          </div>
          {event.maxCapacity > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#8b949e]">
              <span className="material-symbols-outlined text-sm">people</span>
              {event.registrationCount ?? 0}/{event.maxCapacity}
            </div>
          )}
        </div>

        {regOpen && (
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="mt-3 w-full py-1.5 text-xs font-semibold bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
          >
            Register Now
          </button>
        )}
      </div>
    </div>
  );
}

export default function EventsFeed() {
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
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] pb-16">
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
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] text-xl">search</span>
                <input
                  id="event-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events…"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636] transition-colors"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  id={`filter-${f.value}`}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    activeFilter === f.value
                      ? 'bg-[#238636] text-white'
                      : 'bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#238636]/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg text-[#f85149] text-sm">
                {error}
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-72 bg-[#161b22] border border-[#30363d] rounded-2xl animate-pulse" />
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
                    onClick={() => nav(`/events/${event._id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Upcoming registrations */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#238636] text-lg">local_fire_department</span>
                Registration Open
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-xs text-[#8b949e]">No open registrations right now.</p>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((e) => (
                    <div
                      key={e._id}
                      onClick={() => nav(`/events/${e._id}`)}
                      className="flex gap-3 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center group-hover:border-[#238636] transition-all flex-shrink-0">
                        <span className="material-symbols-outlined text-[#8b949e] text-base">
                          {TYPE_ICONS[e.eventType] ?? 'event'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-[#58a6ff] transition-colors">{e.title}</p>
                        <p className="text-[10px] text-[#8b949e] mt-0.5">
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
              <div className="bg-gradient-to-br from-[#1f6feb]/20 to-[#238636]/20 border border-[#30363d] rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#0d1117] border-2 border-[#1f6feb] flex items-center justify-center text-[#1f6feb] mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl">emoji_events</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Host an Event</h3>
                <p className="text-xs text-[#8b949e] mb-4">Inspire your community. Create a hackathon, workshop, or seminar today.</p>
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
              onClick={() => nav('/my-events')}
              className="w-full flex items-center justify-between p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#238636]/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#238636]">event_available</span>
                <span className="text-sm font-medium text-white group-hover:text-[#58a6ff] transition-colors">My Events</span>
              </div>
              <span className="material-symbols-outlined text-[#8b949e] text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
