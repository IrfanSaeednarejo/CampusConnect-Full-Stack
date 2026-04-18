import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchEventById,
  fetchAnnouncementsThunk,
  fetchLeaderboardThunk,
  transitionStateThunk,
  selectCurrentEvent,
  selectEventLoading,
  selectEventError,
  selectEventAnnouncements,
  selectLeaderboard,
  selectEventActionLoading,
  clearCurrentEvent,
} from '../../redux/slices/eventSlice';
import { selectUser, selectHasRole } from '../../redux/slices/authSlice';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

// ── Lifecycle constants ───────────────────────────────────────────────────────
const LIFECYCLE = [
  'draft', 'registration_open', 'registration_closed',
  'ongoing', 'submission_open', 'submission_closed',
  'judging', 'results_published', 'archived',
];

const STATE_COLORS = {
  draft:               'bg-[#8b949e]/20 text-[#8b949e] border-[#8b949e]/20',
  registration_open:   'bg-[#238636]/20 text-[#238636] border-[#238636]/20',
  registration_closed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  ongoing:             'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/20',
  submission_open:     'bg-purple-500/20 text-purple-400 border-purple-500/20',
  submission_closed:   'bg-[#8b949e]/20 text-[#8b949e] border-[#8b949e]/20',
  judging:             'bg-orange-500/20 text-orange-400 border-orange-500/20',
  results_published:   'bg-[#238636]/20 text-[#238636] border-[#238636]/20',
  archived:            'bg-[#30363d]/40 text-[#8b949e] border-[#30363d]/40',
};

const TABS = ['overview', 'announcements', 'leaderboard'];

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── State-aware CTA ───────────────────────────────────────────────────────────
function EventCTA({ event, user, navigate }) {
  const status = event?.status;
  if (!event) return null;

  if (status === 'registration_open') {
    return (
      <Button
        id="event-register-btn"
        variant="primary"
        className="w-full"
        onClick={() => navigate(`/events/${event._id}/register`)}
      >
        Register Now
      </Button>
    );
  }
  if (status === 'submission_open') {
    return (
      <Button
        id="event-submit-btn"
        variant="primary"
        className="w-full"
        onClick={() => navigate(`/events/${event._id}/submission`)}
      >
        Submit Project
      </Button>
    );
  }
  if (status === 'results_published') {
    return (
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => navigate(`/events/${event._id}/leaderboard`)}
      >
        View Results
      </Button>
    );
  }
  if (['registration_closed', 'ongoing', 'submission_closed', 'judging'].includes(status)) {
    return (
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 text-center">
        {status === 'registration_closed' && 'Registration is closed.'}
        {status === 'ongoing' && 'Event is currently running.'}
        {status === 'submission_closed' && 'Submissions are closed. Judging in progress.'}
        {status === 'judging' && 'Judging in progress.'}
      </div>
    );
  }
  if (status === 'archived') {
    return <p className="text-xs text-center text-[#8b949e]">This event has ended.</p>;
  }
  return null;
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  const event         = useSelector(selectCurrentEvent);
  const loading       = useSelector(selectEventLoading);
  const error         = useSelector(selectEventError);
  const announcements = useSelector(selectEventAnnouncements);
  const leaderboard   = useSelector(selectLeaderboard);
  const actionLoading = useSelector(selectEventActionLoading);
  const user          = useSelector(selectUser);
  const isHead        = useSelector(selectHasRole('society_head'));
  const isAdmin       = useSelector(selectHasRole('admin'));

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
      dispatch(fetchAnnouncementsThunk(id));
    }
    return () => { dispatch(clearCurrentEvent()); };
  }, [dispatch, id]);

  // Fetch leaderboard lazily when tab selected
  useEffect(() => {
    if (activeTab === 'leaderboard' && id) {
      dispatch(fetchLeaderboardThunk(id));
    }
  }, [dispatch, activeTab, id]);

  const canManage = isHead || isAdmin;
  const isCreator = user?._id === event?.createdBy?._id || user?._id === event?.createdBy;

  const handleTransition = async (nextState) => {
    try {
      await dispatch(transitionStateThunk({ id, stateData: { status: nextState } })).unwrap();
      showSuccess(`Event moved to: ${nextState.replace(/_/g, ' ')}`);
    } catch (err) {
      showError(err || 'Failed to transition event state.');
    }
  };

  // Determine next valid lifecycle state
  const currentIdx  = LIFECYCLE.indexOf(event?.status);
  const nextState   = currentIdx >= 0 && currentIdx < LIFECYCLE.length - 1 ? LIFECYCLE[currentIdx + 1] : null;

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] animate-pulse">
        <div className="w-full h-64 bg-[#161b22]" />
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[#161b22] rounded w-3/4" />
            <div className="h-48 bg-[#161b22] border border-[#30363d] rounded-xl" />
          </div>
          <div className="h-48 bg-[#161b22] border border-[#30363d] rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (error || (!loading && !event)) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-8">
        <Card padding="p-12">
          <EmptyState
            icon="event_busy"
            title="Event not found"
            description={error || 'This event does not exist or has been removed.'}
            action={<Button onClick={() => navigate('/events')} variant="primary">Browse Events</Button>}
          />
        </Card>
      </div>
    );
  }

  const statusColor = STATE_COLORS[event.status] ?? STATE_COLORS.draft;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">

      {/* Cover */}
      <div className="w-full h-56 md:h-80 relative bg-[#161b22]">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-[#30363d]">event</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 lg:px-16 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-5xl mx-auto">
            <div>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-3 ${statusColor}`}>
                {event.status?.replace(/_/g, ' ') ?? 'Draft'}
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-white">{event.title}</h1>
            </div>
            {(canManage || isCreator) && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/events/${id}/edit`)}
                >
                  Edit
                </Button>
                {nextState && (
                  <Button
                    id="transition-btn"
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleTransition(nextState)}
                  >
                    {actionLoading ? 'Updating…' : `→ ${nextState.replace(/_/g, ' ')}`}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#30363d]">
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`event-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-[#238636] border-[#238636]'
                    : 'text-[#8b949e] border-transparent hover:text-white'
                }`}
              >
                {tab}
                {tab === 'announcements' && announcements.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-[#238636]/20 text-[#238636] text-xs rounded-full">
                    {announcements.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card padding="p-6">
                <h3 className="text-lg font-bold text-white mb-3">About</h3>
                <p className="text-[#8b949e] leading-relaxed whitespace-pre-wrap">
                  {event.description || 'No description provided.'}
                </p>
              </Card>

              <Card padding="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Event Details</h3>
                <dl className="space-y-4">
                  {[
                    { label: 'Starts',   value: formatDate(event.startAt) },
                    { label: 'Ends',     value: formatDate(event.endAt) },
                    { label: 'Venue',    value: event.venue?.type === 'online' ? event.venue.onlineUrl : event.venue?.address ?? '—' },
                    { label: 'Type',     value: (event.venue?.type ?? '—').charAt(0).toUpperCase() + (event.venue?.type ?? '').slice(1) },
                    { label: 'Capacity', value: event.maxCapacity ? `${event.registrationCount ?? 0} / ${event.maxCapacity}` : 'Unlimited' },
                    { label: 'Category', value: event.category ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col border-b border-[#30363d] pb-3 last:border-0">
                      <dt className="text-xs text-[#8b949e] font-medium mb-0.5">{label}</dt>
                      <dd className="text-[#c9d1d9] text-sm break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </div>
          )}

          {/* Announcements */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <Card padding="p-12">
                  <EmptyState icon="campaign" title="No announcements yet" description="Check back for updates from the organizers." />
                </Card>
              ) : (
                announcements.map((ann) => (
                  <Card key={ann._id} padding="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{ann.title ?? 'Announcement'}</h4>
                        <p className="text-[#8b949e] text-sm leading-relaxed">{ann.content ?? ann.message}</p>
                      </div>
                      <span className="text-xs text-[#8b949e] whitespace-nowrap">
                        {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div>
              {leaderboard.length === 0 ? (
                <Card padding="p-12">
                  <EmptyState
                    icon="leaderboard"
                    title="Leaderboard not available"
                    description={event.status === 'results_published' ? 'No results yet.' : 'Results will be published after judging.'}
                  />
                </Card>
              ) : (
                <Card padding="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#30363d]">
                          {['Rank', 'Team', 'Score', 'Members'].map((h) => (
                            <th key={h} className="text-left py-3 px-5 text-[#8b949e] font-medium text-xs">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry, i) => (
                          <tr key={entry._id ?? i} className="border-b border-[#30363d] hover:bg-white/5">
                            <td className="py-3 px-5">
                              <span className={`font-bold text-lg ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-[#8b949e]' : i === 2 ? 'text-orange-400' : 'text-white'}`}>
                                #{i + 1}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-white font-medium">{entry.team?.name ?? entry.name ?? '—'}</td>
                            <td className="py-3 px-5 text-[#238636] font-semibold">{entry.score ?? entry.totalScore ?? '—'}</td>
                            <td className="py-3 px-5 text-[#8b949e]">{entry.team?.members?.length ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-24 space-y-4">
            <Card padding="p-5">
              <h3 className="text-sm font-bold text-white mb-4">
                {event.status === 'registration_open' ? 'Registration Open' : 'Event Status'}
              </h3>
              <EventCTA event={event} user={user} navigate={navigate} />
            </Card>

            {/* Stats */}
            <Card padding="p-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Registered',   value: event.registrationCount ?? 0, icon: 'people' },
                  { label: 'Max Capacity', value: event.maxCapacity ?? '∞',     icon: 'event_seat' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="text-center">
                    <span className="material-symbols-outlined text-2xl text-[#238636] block mb-1">{icon}</span>
                    <div className="text-xl font-bold text-white">{value}</div>
                    <div className="text-xs text-[#8b949e]">{label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Team management */}
            {['ongoing', 'registration_open', 'submission_open'].includes(event.status) && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(`/events/${id}/team`)}
              >
                <span className="material-symbols-outlined text-sm mr-1">group</span>
                Manage Team
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
