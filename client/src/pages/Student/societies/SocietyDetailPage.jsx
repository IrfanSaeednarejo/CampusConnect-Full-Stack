import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSocietyDetail,
  fetchSocietyMembers,
  selectSocietyDetail,
  selectSocietyDetailStatus,
  selectSocietyDetailError,
  selectSocietyMembers,
  selectSocietyMembersStatus
} from '../../../redux/slices/societyDetailSlice';
import {
  joinSociety,
  leaveSociety,
  selectSocietyActionLoading
} from '../../../redux/slices/societiesSlice';
import { useModal, MODAL_TYPES } from '../../../contexts/ModalContext';
import { timeAgo, getInitials, formatDate } from '../../../utils/helpers';
import Avatar from '../../../components/common/Avatar';

export default function SocietyDetailPage() {
  const { societyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openModal } = useModal();

  const [activeTab, setActiveTab] = useState('Overview');

  const detail = useSelector(selectSocietyDetail);
  const status = useSelector(selectSocietyDetailStatus);
  const members = useSelector(selectSocietyMembers);
  const membersStatus = useSelector(selectSocietyMembersStatus);
  const actionLoading = useSelector((state) => selectSocietyActionLoading(state, societyId));

  // If the user's prompt said we should use events state, we read it
  const upcomingEvents = useSelector((state) => state.eventsLegacy?.items || []);

  useEffect(() => {
    if (societyId) {
      dispatch(fetchSocietyDetail(societyId));
      dispatch(fetchSocietyMembers(societyId));
    }
  }, [dispatch, societyId]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex justify-center items-center">
        <span className="material-symbols-outlined text-4xl text-[#8b949e] animate-spin">refresh</span>
      </div>
    );
  }

  if (status === 'failed' || !detail) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex justify-center items-center p-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-[#f85149] text-6xl mb-4">warning</span>
          <h2 className="text-2xl font-bold text-white mb-2">Society not found</h2>
          <p className="text-[#8b949e] mb-6">The society you're looking for doesn't exist or has been removed.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-md bg-[#21262d] border border-[#30363d] text-white hover:bg-[#30363d] transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/student/societies')}
              className="px-4 py-2 rounded-md bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
            >
              Browse Societies
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAction = () => {
    if (detail.membershipStatus === null) {
      dispatch(joinSociety(societyId)).then(() => {
        dispatch(fetchSocietyDetail(societyId)); // refresh status
      });
    } else {
      openModal(MODAL_TYPES.LEAVE_SOCIETY, {
        societyId,
        societyName: detail.name,
        onConfirm: () => {
          dispatch(leaveSociety(societyId)).then(() => {
            dispatch(fetchSocietyDetail(societyId));
          });
        }
      });
    }
  };

  const societyEvents = upcomingEvents.filter(e => detail.upcomingEvents?.includes(e.id) || e.societyId === societyId);

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen pb-12">
      {/* A) COVER BANNER */}
      <div className="relative w-full h-48 bg-gradient-to-r from-purple-700 to-blue-600">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 xl:left-8 bg-[#0d1117]/80 hover:bg-[#0d1117] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur border border-white/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>

        <div className="absolute bottom-4 left-4 xl:left-8 flex flex-col items-start">
          <div className="flex gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur border border-white/40 text-white text-xs px-2 py-1 rounded font-medium">
              {detail.category}
            </span>
            <span className="bg-white/20 backdrop-blur border border-white/40 text-white text-xs px-2 py-1 rounded font-medium">
              Est. {detail.founded}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md">
            {detail.name}
          </h1>
        </div>

        <div className="absolute bottom-4 right-4 xl:right-8">
          {detail.membershipStatus === null ? (
            <button
              onClick={handleAction}
              disabled={actionLoading}
              className="bg-[#2ea043] hover:bg-[#3fb950] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-75"
            >
              {actionLoading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Join Society'}
            </button>
          ) : (
            <button
              onClick={handleAction}
              disabled={actionLoading}
              className="bg-[#0d1117]/60 hover:bg-[#0d1117]/90 text-white border border-white/30 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-75"
            >
              {actionLoading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Leave Society'}
            </button>
          )}
        </div>
      </div>

      <main className="px-4 xl:px-8 py-6 max-w-7xl mx-auto">
        {/* B) STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-[#8b949e]">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4">
            <div className="bg-[#2ea043]/20 text-[#2ea043] p-2 rounded-full flex">
              <span className="material-symbols-outlined">people</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl">{detail.memberCount}</div>
              <div className="text-xs">Members</div>
            </div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4">
            <div className="bg-blue-500/20 text-blue-400 p-2 rounded-full flex">
              <span className="material-symbols-outlined">event</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl">{detail.eventCount}</div>
              <div className="text-xs">Events</div>
            </div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4">
            <div className="bg-purple-500/20 text-purple-400 p-2 rounded-full flex">
              <span className="material-symbols-outlined">flag</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl">{detail.founded}</div>
              <div className="text-xs">Founded</div>
            </div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4">
            <div className={`p-2 rounded-full flex ${detail.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <span className="material-symbols-outlined">{detail.isOpen ? 'lock_open' : 'lock'}</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl">{detail.isOpen ? 'Open' : 'Approval'}</div>
              <div className="text-xs">Status</div>
            </div>
          </div>
        </div>

        {/* C) TABS */}
        <div className="border-b border-[#30363d] sticky top-0 bg-[#0d1117]/95 backdrop-blur z-10 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <nav className="-mb-px flex space-x-8">
            {['Overview', 'Events', 'Members', 'Announcements'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors
                  ${activeTab === tab
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#8b949e]'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* D) TAB CONTENT */}
        <div className="min-h-[400px]">
          {activeTab === 'Overview' && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3 space-y-8">
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">info</span>
                    About {detail.name}
                  </h3>
                  <p className="text-[#8b949e] leading-relaxed text-lg whitespace-pre-wrap">
                    {detail.longDescription || detail.description}
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">photo_library</span>
                    Gallery
                  </h3>
                  {detail.gallery && detail.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {detail.gallery.map((img, i) => (
                        <div key={i} className="aspect-video bg-[#21262d] rounded-lg border border-[#30363d] overflow-hidden">
                          <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg py-12 flex flex-col items-center justify-center text-[#8b949e]">
                      <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                      <p>No photos yet</p>
                    </div>
                  )}
                </section>
              </div>

              <div className="md:w-1/3 space-y-8">
                <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">group</span>
                    Core Team
                  </h3>

                  {detail.president && (
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#30363d]">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">
                        {getInitials(detail.president.name)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{detail.president.name}</div>
                        <div className="text-xs text-[#2ea043] font-semibold uppercase">{detail.president.role}</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {detail.coreteam?.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#30363d]/50 border border-[#30363d] rounded-full flex items-center justify-center text-[#c9d1d9] text-sm">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{member.name}</div>
                          <div className="text-xs text-[#8b949e]">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Connect</h3>
                  <div className="flex gap-4">
                    {Object.entries(detail.socialLinks || {}).map(([platform, link]) => (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 bg-[#21262d] border border-[#30363d] rounded-full flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors capitalize"
                        title={platform}
                      >
                        {platform === 'facebook' && <span className="material-symbols-outlined">facebook</span>}
                        {platform === 'instagram' && <span className="material-symbols-outlined">photo_camera</span>}
                        {platform === 'linkedin' && <span className="material-symbols-outlined">work</span>}
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'Events' && (
            <div>
              {societyEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {societyEvents.map(event => (
                    <div key={event.id || event._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-blue-500/50 transition-colors">
                      <h4 className="font-bold text-white text-lg mb-2">{event.title}</h4>
                      <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex gap-4 text-xs text-[#8b949e]">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {formatDate(event.date || event.dateTime)}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg py-16 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-6xl text-[#8b949e] mb-4">event_busy</span>
                  <h3 className="text-xl font-bold text-white mb-2">No upcoming events</h3>
                  <p className="text-[#8b949e]">Check back later for new activities.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Members' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">All Members</h3>
                <span className="bg-[#21262d] border border-[#30363d] px-3 py-1 rounded-full text-sm">{members.length || detail.memberCount || 0} members</span>
              </div>

              {membersStatus === 'loading' ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {members.map((member, idx) => {
                    const name = member.userId?.profile?.displayName || member.profile?.displayName || member.name || 'Member';
                    const avatar = member.userId?.profile?.avatar || member.profile?.avatar;
                    const role = member.role || 'member';
                    const isHead = role === 'president' || role === 'head' || role === 'admin';
                    return (
                      <div key={member._id || idx} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 text-center flex flex-col items-center hover:border-purple-500/30 transition-colors">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-[#30363d]" />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 ${isHead ? 'bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg' : 'bg-[#21262d] border border-[#30363d] text-[#8b949e]'}`}>
                            {getInitials(name)}
                          </div>
                        )}
                        <div className="text-white font-bold text-sm">{name}</div>
                        <div className={`text-xs font-semibold uppercase tracking-wider mt-1 ${isHead ? 'text-[#2ea043]' : 'text-[#8b949e]'}`}>{role}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg py-16 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-6xl text-[#8b949e] mb-4">group_off</span>
                  <h3 className="text-xl font-bold text-white mb-2">No members yet</h3>
                  <p className="text-[#8b949e]">Be the first to join this society!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Announcements' && (
            <div className="max-w-4xl space-y-4">
              {detail.announcements && detail.announcements.length > 0 ? (
                detail.announcements.map((ann) => (
                  <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 relative">
                    <div className="absolute top-6 right-6 text-xs text-[#8b949e] bg-[#21262d] px-2 py-1 border border-[#30363d] rounded-md">
                      {timeAgo(ann.date)}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#30363d]/50 border border-[#30363d] rounded-full flex items-center justify-center text-[#c9d1d9] text-sm">
                        {getInitials(ann.author)}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{ann.author}</div>
                        <div className="text-xs text-purple-400 font-bold uppercase tracking-wider mt-0.5">Announcement</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{ann.title}</h3>
                    <p className="text-[#8b949e] text-base leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                  </div>
                ))
              ) : (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg py-16 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-6xl text-[#8b949e] mb-4">campaign</span>
                  <h3 className="text-xl font-bold text-white mb-2">No announcements yet</h3>
                  <p className="text-[#8b949e]">The leadership team hasn't posted anything.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
