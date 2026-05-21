import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, selectAllEvents, selectEventLoading } from '../../redux/slices/eventSlice';
import { selectUser } from '../../redux/slices/authSlice';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import useHomeTheme from '../../hooks/useHomeTheme';

const STATE_COLORS = {
  registration_open:   'bg-primary/10 text-primary',
  ongoing:             'bg-info/10 text-info',
  submission_open:     'bg-info/10 text-info',
  results_published:   'bg-success/10 text-success',
};

export default function MyEvents() {
  const isDark = useHomeTheme();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const events    = useSelector(selectAllEvents);
  const loading   = useSelector(selectEventLoading);
  const user      = useSelector(selectUser);

  useEffect(() => {
    // Fetch events registered by the user — backend filters by participant
    dispatch(fetchEvents({ participantId: user?._id }));
  }, [dispatch, user?._id]);

  const getEventCTA = (event) => {
    if (event.status === 'registration_open')   return { label: 'View Registration', path: `/events/${event._id}` };
    if (event.status === 'submission_open')     return { label: 'Submit Project',    path: `/events/${event._id}/submission` };
    if (event.status === 'results_published')   return { label: 'View Results',      path: `/events/${event._id}` };
    return { label: 'View Details', path: `/events/${event._id}` };
  };

  return (
    <div className={`flex min-h-screen flex-col ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
      <PageHeader
        title="My Events"
        subtitle="Hackathons, workshops, and competitions you've registered for"
        icon="event_available"
        showBack={false}
        action={
          <Button onClick={() => navigate('/events')} variant="secondary" size="sm">
            Browse Events
          </Button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-56 rounded-2xl border animate-pulse ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && events.length === 0 && (
          <Card padding="p-16">
            <EmptyState
              icon="event_note"
              title="No events yet"
              description="You haven't registered for any events. Discover exciting opportunities on campus."
              action={
                <Button onClick={() => navigate('/events')} variant="primary">
                  Explore Events
                </Button>
              }
            />
          </Card>
        )}

        {/* Grid */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const cta        = getEventCTA(event);
              const statusColor = STATE_COLORS[event.status] ?? 'bg-slate-500/10 text-slate-500';
              return (
                <div
                  key={event._id}
                  className={`group flex flex-col overflow-hidden rounded-2xl border transition-all ${isDark ? "border-border-dark bg-surface-dark hover:border-primary/50" : "border-border-light bg-surface-light hover:border-info/40 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"}`}
                >
                  <div className={`relative flex h-28 items-center justify-center ${isDark ? "bg-container-dark" : "bg-slate-100"}`}>
                    {event.coverImage ? (
                      <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <span className={`material-symbols-outlined text-5xl ${isDark ? "text-border-dark" : "text-slate-300"}`}>event</span>
                    )}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusColor}`}>
                      {event.status?.replace(/_/g, ' ') ?? 'upcoming'}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className={`mb-1 line-clamp-2 text-base font-bold transition-colors ${isDark ? "text-text-primary-dark group-hover:text-info" : "text-text-primary-light group-hover:text-info"}`}>
                      {event.title}
                    </h3>
                    <div className={`mb-3 flex items-center gap-2 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {event.startAt ? new Date(event.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </div>
                    <div className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate(cta.path)}
                    >
                      {cta.label}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
