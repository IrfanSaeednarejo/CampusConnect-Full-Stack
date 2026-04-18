import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, selectAllEvents, selectEventLoading } from '../../redux/slices/eventSlice';
import { selectUser } from '../../redux/slices/authSlice';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

const STATE_COLORS = {
  registration_open:   'bg-[#238636]/20 text-[#238636]',
  ongoing:             'bg-[#1f6feb]/20 text-[#58a6ff]',
  submission_open:     'bg-purple-500/20 text-purple-400',
  results_published:   'bg-[#238636]/20 text-[#238636]',
};

export default function MyEvents() {
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
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
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
              <div key={i} className="h-56 bg-[#161b22] border border-[#30363d] rounded-2xl animate-pulse" />
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
              const statusColor = STATE_COLORS[event.status] ?? 'bg-[#8b949e]/20 text-[#8b949e]';
              return (
                <div
                  key={event._id}
                  className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden hover:border-[#238636]/60 transition-all group flex flex-col"
                >
                  {/* Gradient header */}
                  <div className="h-28 bg-gradient-to-r from-[#1f6feb]/30 to-[#238636]/30 relative flex items-center justify-center">
                    {event.coverImage ? (
                      <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-[#30363d]">event</span>
                    )}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusColor}`}>
                      {event.status?.replace(/_/g, ' ') ?? 'upcoming'}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-[#58a6ff] transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#8b949e] mb-3">
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
