import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import {
  fetchPendingMentorsThunk,
  fetchAllMentorsAdminThunk,
  approveMentorThunk,
  suspendMentorAdminThunk,
  selectPendingMentors,
  selectAllAdminMentors,
  selectMentorActionLoading,
  selectAdminLoading,
} from '../../redux/slices/adminSlice';

const TABS = [
  { id: 'pending',   label: 'Pending Applications', icon: 'pending' },
  { id: 'verified',  label: 'Verified Mentors',      icon: 'verified' },
  { id: 'suspended', label: 'Suspended',              icon: 'block' },
];

function MentorCard({ mentor, onApprove, onSuspend, tab, actionLoading }) {
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const user = mentor.userId || {};
  const name = user.profile?.displayName || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Unknown';
  const avatar = user.profile?.avatar;
  const dept = user.academic?.department;

  const handleSuspendSubmit = () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a suspension reason.');
      return;
    }
    onSuspend(mentor._id, suspendReason);
    setShowSuspendModal(false);
    setSuspendReason('');
  };

  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-5 flex flex-col gap-4 hover:border-[#30363d] transition-colors">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-[#21262d] overflow-hidden shrink-0 flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[#58a6ff] text-2xl">person</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#e6edf3] font-bold capitalize truncate">{name}</h3>
          {dept && <p className="text-[#8b949e] text-xs">{dept}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              mentor.verified && mentor.isActive  ? 'bg-[#3fb950]/20 text-[#3fb950]' :
              !mentor.isActive                   ? 'bg-red-500/20 text-red-400' :
              'bg-[#e3b341]/20 text-[#e3b341]'
            }`}>
              {mentor.verified && mentor.isActive ? 'Verified' : !mentor.isActive ? 'Suspended' : 'Pending'}
            </span>
            <span className="text-[#3d444d] text-[10px]">•</span>
            <span className="text-[#8b949e] text-xs capitalize">{mentor.tier || 'bronze'}</span>
            {mentor.hourlyRate > 0 && (
              <>
                <span className="text-[#3d444d] text-[10px]">•</span>
                <span className="text-[#8b949e] text-xs">{mentor.currency} {mentor.hourlyRate}/hr</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {mentor.bio && (
        <p className="text-[#8b949e] text-sm leading-relaxed border-t border-[#21262d] pt-3 line-clamp-3">
          {mentor.bio}
        </p>
      )}

      {/* Expertise */}
      {mentor.expertise?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {mentor.expertise.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] text-[11px] rounded-md capitalize"
            >
              {skill}
            </span>
          ))}
          {mentor.expertise.length > 6 && (
            <span className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] text-[11px] rounded-md">
              +{mentor.expertise.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Categories */}
      {mentor.categories?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {mentor.categories.map(cat => (
            <span key={cat} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#388bfd]/10 text-[#388bfd] capitalize">
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 border-t border-[#21262d] pt-3 text-center">
        <div>
          <p className="text-[#e6edf3] text-base font-bold">{mentor.totalSessions || 0}</p>
          <p className="text-[#8b949e] text-[10px]">Sessions</p>
        </div>
        <div>
          <p className="text-[#e6edf3] text-base font-bold">{mentor.averageRating?.toFixed(1) || '—'}</p>
          <p className="text-[#8b949e] text-[10px]">Rating</p>
        </div>
        <div>
          <p className="text-[#e6edf3] text-base font-bold">{mentor.totalReviews || 0}</p>
          <p className="text-[#8b949e] text-[10px]">Reviews</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-[#21262d] pt-3">
        {tab === 'pending' && (
          <>
            <button
              onClick={() => onApprove(mentor._id)}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">verified</span>
                  Approve
                </>
              )}
            </button>
            <button
              onClick={() => setShowSuspendModal(true)}
              disabled={actionLoading}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">block</span>
              Reject
            </button>
          </>
        )}

        {tab === 'verified' && (
          <button
            onClick={() => setShowSuspendModal(true)}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">block</span>
            Suspend
          </button>
        )}

        {tab === 'suspended' && (
          <span className="text-[#8b949e] text-xs italic">
            {mentor.suspendReason ? `Reason: ${mentor.suspendReason}` : 'No reason provided'}
          </span>
        )}
      </div>

      {/* Suspend/Reject Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">
              {tab === 'pending' ? 'Reject Application' : 'Suspend Mentor'}
            </h3>
            <p className="text-[#8b949e] text-sm mb-4">
              Please provide a reason. The mentor will be notified.
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full bg-[#0d1117] text-white border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#58a6ff] resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowSuspendModal(false); setSuspendReason(''); }}
                className="flex-1 px-4 py-2 rounded-lg bg-[#21262d] text-white text-sm font-medium hover:bg-[#30363d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendSubmit}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyQueue({ tab }) {
  const messages = {
    pending:   { icon: 'assignment_ind', text: 'No pending mentor applications.' },
    verified:  { icon: 'verified',       text: 'No verified mentors yet.' },
    suspended: { icon: 'block',          text: 'No suspended mentors.' },
  };
  const { icon, text } = messages[tab] || messages.pending;
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-[#8b949e]">
      <span className="material-symbols-outlined text-5xl mb-3 text-[#3d444d]">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

/**
 * Administrative Mentor Verification Dashboard.
 * Fetches real data from the API and allows admins to approve/suspend mentors.
 */
export default function MentorVerification() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingMentors  = useSelector(selectPendingMentors);
  const allMentors      = useSelector(selectAllAdminMentors);
  const actionLoading   = useSelector(selectMentorActionLoading);
  const loading         = useSelector(selectAdminLoading);

  useEffect(() => {
    dispatch(fetchPendingMentorsThunk());
    dispatch(fetchAllMentorsAdminThunk({})); // All mentors (verified + suspended)
  }, [dispatch]);

  const handleApprove = async (mentorId) => {
    try {
      await dispatch(approveMentorThunk(mentorId)).unwrap();
      toast.success('Mentor approved successfully. They have been notified.');
    } catch (err) {
      toast.error(err || 'Failed to approve mentor');
    }
  };

  const handleSuspend = async (mentorId, reason) => {
    try {
      await dispatch(suspendMentorAdminThunk({ mentorId, reason })).unwrap();
      toast.success('Mentor suspended. They have been notified.');
    } catch (err) {
      toast.error(err || 'Failed to suspend mentor');
    }
  };

  const verifiedMentors  = allMentors.filter(m => m.verified && m.isActive);
  const suspendedMentors = allMentors.filter(m => !m.isActive);

  const listByTab = {
    pending:   pendingMentors,
    verified:  verifiedMentors,
    suspended: suspendedMentors,
  };

  const currentList = listByTab[activeTab] || [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Mentor Verification"
          subtitle="Review and manage mentor applications and profiles."
          icon="fact_check"
        />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending',   count: pendingMentors.length,          icon: 'pending',  color: '#e3b341' },
            { label: 'Verified',  count: verifiedMentors.length,         icon: 'verified', color: '#3fb950' },
            { label: 'Suspended', count: suspendedMentors.length,        icon: 'block',    color: '#f85149' },
          ].map(stat => (
            <div
              key={stat.label}
              onClick={() => setActiveTab(stat.label.toLowerCase())}
              className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-[#30363d] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                <span className="material-symbols-outlined text-lg" style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-[#8b949e] text-xs">{stat.label}</p>
                <p className="text-[#e6edf3] text-xl font-bold">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
          <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={TABS} />

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#3fb950] rounded-full animate-spin" />
              </div>
            ) : currentList.length === 0 ? (
              <EmptyQueue tab={activeTab} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentList.map(mentor => (
                  <MentorCard
                    key={mentor._id}
                    mentor={mentor}
                    tab={activeTab}
                    onApprove={handleApprove}
                    onSuspend={handleSuspend}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
