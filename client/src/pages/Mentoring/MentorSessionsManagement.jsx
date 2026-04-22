import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchMyBookings, 
  selectMyBookings, 
  selectMentoringLoading,
  confirmBookingThunk,
  cancelBookingThunk,
  completeBookingThunk,
  markNoShowThunk
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { toast } from "react-hot-toast";

// ── Modals ──────────────────────────────────────────────────────────────────

function ActionModal({ isOpen, onClose, title, message, inputLabel, inputPlaceholder, confirmText, confirmColor, onConfirm }) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-[#8b949e] text-sm mb-4">{message}</p>
        
        <label className="block text-sm font-medium text-[#c9d1d9] mb-1.5">
          {inputLabel}
        </label>
        <input
          type="text"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#58a6ff] transition-colors mb-6"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-3 font-medium">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[#8b949e] hover:bg-[#21262d] transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(inputValue)}
            disabled={!inputValue.trim()}
            className={`px-4 py-2 rounded-lg text-white transition-colors text-sm disabled:opacity-50 ${
              confirmColor === "green" ? "bg-[#238636] hover:bg-[#2ea043]" : 
              confirmColor === "red" ? "bg-[#da3633] hover:text-white hover:bg-[#b62324]" :
              "bg-[#1f6feb] hover:bg-[#388bfd]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MentorSessionsManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookings = useSelector(selectMyBookings) || [];
  const loading = useSelector(selectMentoringLoading);
  const currentUser = useSelector(selectUser);
  
  const [activeTab, setActiveTab] = useState("scheduled");
  const [actionLoading, setActionLoading] = useState(null);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, bookingId: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });

  useEffect(() => {
    dispatch(fetchMyBookings({ sort: '-startAt', limit: 100 }));
  }, [dispatch]);

  const pendingSessions = bookings.filter(b => b.status === 'pending');
  const scheduledSessions = bookings.filter(b => b.status === 'confirmed');
  const completedSessions = bookings.filter(b => ['completed', 'cancelled', 'no-show'].includes(b.status));

  const handleActionClick = (bookingId, action) => {
    if (action === "confirm") {
      setConfirmModal({ isOpen: true, bookingId });
    } else if (action === "cancel") {
      setCancelModal({ isOpen: true, bookingId });
    } else if (action === "complete" || action === "no-show") {
      // Direct action without text input
      executeAction(bookingId, action);
    }
  };

  const executeAction = async (bookingId, action, payload = null) => {
    setActionLoading(bookingId);
    setConfirmModal({ isOpen: false, bookingId: null });
    setCancelModal({ isOpen: false, bookingId: null });

    try {
      if (action === 'confirm') {
        await dispatch(confirmBookingThunk({ id: bookingId, data: { meetingLink: payload } })).unwrap();
        toast.success("Session confirmed! Note sent to mentee.");
      } else if (action === 'cancel') {
        await dispatch(cancelBookingThunk({ id: bookingId, data: { reason: payload } })).unwrap();
        toast.success("Session cancelled.");
      } else if (action === 'complete') {
        await dispatch(completeBookingThunk(bookingId)).unwrap();
        toast.success("Session marked as completed!");
      } else if (action === 'no-show') {
        await dispatch(markNoShowThunk(bookingId)).unwrap();
        toast.success("Session marked as No Show.");
      }
      dispatch(fetchMyBookings({ sort: '-startAt', limit: 100 }));
    } catch (err) {
      toast.error(err || `Failed to ${action} session`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPartnerInfo = (session) => {
    const isMentor = session.mentorId?.userId?._id === currentUser?._id;
    return isMentor ? session.menteeId : session.mentorId?.userId;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10 bg-[#0d1117]">
        <div className="w-8 h-8 border-4 border-[#3fb950] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-4 lg:p-10 overflow-y-auto bg-[#0d1117]">
      <div className="flex w-full max-w-6xl mx-auto flex-col gap-6">
        
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#c9d1d9] tracking-tight">
            My Sessions
          </h1>
          <p className="text-[#8b949e]">Track, manage, and join your mentoring sessions seamlessly.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#30363d] gap-8 mt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex flex-col items-center justify-center border-b-[3px] py-3 transition-colors shrink-0 ${
              activeTab === "pending"
                ? "border-b-[#e3b341] text-[#c9d1d9]"
                : "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span className="text-sm font-bold tracking-wide">
              Pending <span className="ml-1 bg-[#21262d] px-2 py-0.5 rounded-full text-xs border border-[#30363d]">{pendingSessions.length}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`flex flex-col items-center justify-center border-b-[3px] py-3 transition-colors shrink-0 ${
              activeTab === "scheduled"
                ? "border-b-[#3fb950] text-[#c9d1d9]"
                : "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span className="text-sm font-bold tracking-wide">
              Scheduled <span className="ml-1 bg-[#21262d] px-2 py-0.5 rounded-full text-xs border border-[#30363d]">{scheduledSessions.length}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex flex-col items-center justify-center border-b-[3px] py-3 transition-colors shrink-0 ${
              activeTab === "completed"
                ? "border-b-[#3fb950] text-[#c9d1d9]"
                : "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span className="text-sm font-bold tracking-wide">
              History <span className="ml-1 bg-[#21262d] px-2 py-0.5 rounded-full text-xs border border-[#30363d]">{completedSessions.length}</span>
            </span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex flex-col gap-5 mt-2">
          
        {/* PENDING SESSIONS */}
        {activeTab === "pending" && pendingSessions.map((session) => {
            const partner = getPartnerInfo(session);
            const partnerName = partner?.profile?.displayName || `${partner?.profile?.firstName || 'Unknown'} ${partner?.profile?.lastName || ''}`;
            const date = new Date(session.startAt);
            const isMentor = session.mentorId?.userId?._id === currentUser?._id;
            const isPending = session.status === 'pending';
            
            return (
              <div
                key={session._id}
                className={`flex flex-col gap-5 rounded-xl p-5 border transition-colors ${isPending ? 'bg-[#161b22]/50 border-[#e3b341]/30 hover:border-[#e3b341]/60' : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'}`}
              >
                {/* Header section */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="shrink-0 relative">
                      {partner?.profile?.avatar ? (
                        <img src={partner.profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#21262d]" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e3b341] to-[#b08800] flex items-center justify-center text-xl font-bold text-white border-2 border-[#21262d]">
                          {partnerName[0]}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#161b22] flex items-center justify-center ${isMentor ? 'bg-[#1f6feb]' : 'bg-[#e3b341]'}`}>
                         <span className="material-symbols-outlined text-[12px] text-white font-bold">{isMentor ? 'school' : 'person'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-white truncate">{partnerName}</p>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                          session.status === 'confirmed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/20' : 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/20'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#c9d1d9] mt-1 line-clamp-1">{session.topic || 'General Mentoring & Discussion'}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-[#8b949e] flex-wrap">
                        <span className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> 
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration} mins
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
                          <span className="material-symbols-outlined text-[14px]">{session.fee === 0 ? 'money_off' : 'payments'}</span> 
                          {session.fee === 0 ? 'Free' : `${session.currency} ${session.fee}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions desktop */}
                  <div className="hidden md:flex flex-col gap-2 shrink-0 items-end min-w-[200px]">
                    <SessionActions 
                      session={session} 
                      isMentor={isMentor} 
                      actionLoading={actionLoading} 
                      onAction={handleActionClick} 
                      navigate={navigate} 
                    />
                  </div>
                </div>

                {/* Details Section */}
                {(session.notes || session.meetingLink) && (
                  <div className="mt-2 bg-[#0d1117]/50 rounded-xl p-4 border border-[#30363d] space-y-3">
                    {session.meetingLink && session.status === 'confirmed' && (
                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-[#388bfd] text-[18px] mt-0.5">link</span>
                        <div>
                          <p className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-1">Meeting Link</p>
                          <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#58a6ff] hover:underline break-all">
                            {session.meetingLink}
                          </a>
                        </div>
                      </div>
                    )}
                    {session.notes && (
                       <div className="flex gap-3 items-start">
                       <span className="material-symbols-outlined text-[#8b949e] text-[18px] mt-0.5">edit_note</span>
                       <div>
                         <p className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-0.5">Notes from Mentee</p>
                         <p className="text-sm text-[#c9d1d9] leading-relaxed">{session.notes}</p>
                       </div>
                     </div>
                    )}
                  </div>
                )}

                {/* Actions mobile */}
                <div className="flex flex-col gap-2 md:hidden pt-4 border-t border-[#30363d] mt-2">
                   <SessionActions 
                      session={session} 
                      isMentor={isMentor} 
                      actionLoading={actionLoading} 
                      onAction={handleActionClick} 
                      navigate={navigate} 
                   />
                </div>
              </div>
            );
          })}

          {/* SCHEDULED SESSIONS */}
          {activeTab === "scheduled" && scheduledSessions.map((session) => {
            const partner = getPartnerInfo(session);
            const partnerName = partner?.profile?.displayName || `${partner?.profile?.firstName || 'Unknown'} ${partner?.profile?.lastName || ''}`;
            const date = new Date(session.startAt);
            const isMentor = session.mentorId?.userId?._id === currentUser?._id;
            const isPending = session.status === 'pending';
            
            return (
              <div
                key={session._id}
                className={`flex flex-col gap-5 rounded-xl p-5 border transition-colors ${isPending ? 'bg-[#161b22]/50 border-[#3fb950]/20' : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'}`}
              >
                {/* Header section */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="shrink-0 relative">
                      {partner?.profile?.avatar ? (
                        <img src={partner.profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#21262d]" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3fb950] to-[#2ea043] flex items-center justify-center text-xl font-bold text-white border-2 border-[#21262d]">
                          {partnerName[0]}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#161b22] flex items-center justify-center ${isMentor ? 'bg-[#1f6feb]' : 'bg-[#e3b341]'}`}>
                         <span className="material-symbols-outlined text-[12px] text-white font-bold">{isMentor ? 'school' : 'person'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-white truncate">{partnerName}</p>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                          session.status === 'confirmed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/20' : 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/20'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#c9d1d9] mt-1 line-clamp-1">{session.topic || 'General Mentoring & Discussion'}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-[#8b949e] flex-wrap">
                        <span className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> 
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration} mins
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
                          <span className="material-symbols-outlined text-[14px]">{session.fee === 0 ? 'money_off' : 'payments'}</span> 
                          {session.fee === 0 ? 'Free' : `${session.currency} ${session.fee}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions desktop */}
                  <div className="hidden md:flex flex-col gap-2 shrink-0 items-end min-w-[200px]">
                    <SessionActions 
                      session={session} 
                      isMentor={isMentor} 
                      actionLoading={actionLoading} 
                      onAction={handleActionClick} 
                      navigate={navigate} 
                    />
                  </div>
                </div>

                {/* Details Section */}
                {(session.notes || session.meetingLink) && (
                  <div className="mt-2 bg-[#0d1117]/50 rounded-xl p-4 border border-[#30363d] space-y-3">
                    {session.meetingLink && session.status === 'confirmed' && (
                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-[#388bfd] text-[18px] mt-0.5">link</span>
                        <div>
                          <p className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-1">Meeting Link</p>
                          <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#58a6ff] hover:underline break-all">
                            {session.meetingLink}
                          </a>
                        </div>
                      </div>
                    )}
                    {session.notes && (
                       <div className="flex gap-3 items-start">
                       <span className="material-symbols-outlined text-[#8b949e] text-[18px] mt-0.5">edit_note</span>
                       <div>
                         <p className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-0.5">Notes from Mentee</p>
                         <p className="text-sm text-[#c9d1d9] leading-relaxed">{session.notes}</p>
                       </div>
                     </div>
                    )}
                  </div>
                )}

                {/* Actions mobile */}
                <div className="flex flex-col gap-2 md:hidden pt-4 border-t border-[#30363d] mt-2">
                   <SessionActions 
                      session={session} 
                      isMentor={isMentor} 
                      actionLoading={actionLoading} 
                      onAction={handleActionClick} 
                      navigate={navigate} 
                   />
                </div>
              </div>
            );
          })}

          {/* COMPLETED SESSIONS */}
          {activeTab === "completed" && completedSessions.map((session) => {
            const partner = getPartnerInfo(session);
            const partnerName = partner?.profile?.displayName || `${partner?.profile?.firstName || 'Unknown'} ${partner?.profile?.lastName || ''}`;
            const date = new Date(session.startAt);
            const isMentor = session.mentorId?.userId?._id === currentUser?._id;

            return (
              <div
                key={session._id}
                className="flex flex-col md:flex-row gap-5 bg-[#0d1117] rounded-xl p-5 md:items-center border border-[#30363d] transition-all hover:bg-[#161b22]"
              >
                <div className="flex flex-1 items-center gap-4 min-w-0">
                  <div className="shrink-0 grayscale opacity-80">
                    {partner?.profile?.avatar ? (
                      <img src={partner.profile.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-[#21262d]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center text-lg font-bold text-[#8b949e] border border-[#30363d]">
                        {partnerName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold text-[#8b949e] truncate flex items-center gap-2">
                        {partnerName}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                        session.status === 'completed' ? 'bg-[#238636]/10 text-[#3fb950] border-[#3fb950]/20' : 
                        session.status === 'cancelled' ? 'bg-[#da3633]/10 text-[#ff7b72] border-[#da3633]/20' : 
                        'bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/20'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs font-medium text-[#8b949e] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                        {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      {session.cancellationReason && session.status === 'cancelled' && (
                        <span className="text-xs font-medium text-[#ff7b72] flex items-center gap-1.5 bg-[#da3633]/5 px-2 py-0.5 rounded border border-[#da3633]/20">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          Reason: {session.cancellationReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty States */}
          {activeTab === "pending" && pendingSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 text-center bg-[#161b22]/50 rounded-2xl p-16 mt-4 border border-[#30363d] border-dashed">
              <div className="w-20 h-20 rounded-full bg-[#0d1117] flex items-center justify-center border-2 border-[#30363d] mb-4">
                <span className="material-symbols-outlined text-4xl text-[#8b949e]">inbox</span>
              </div>
              <p className="text-2xl font-bold text-white">No pending requests</p>
              <p className="text-[#8b949e] max-w-md mt-2">You don't have any sessions awaiting confirmation.</p>
              <button 
                onClick={() => navigate('/mentors')} 
                className="mt-6 px-6 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9] font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">search</span> Browse Mentors
              </button>
            </div>
          )}

          {activeTab === "scheduled" && scheduledSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 text-center bg-[#161b22]/50 rounded-2xl p-16 mt-4 border border-[#30363d] border-dashed">
              <div className="w-20 h-20 rounded-full bg-[#0d1117] flex items-center justify-center border-2 border-[#30363d] mb-4">
                <span className="material-symbols-outlined text-4xl text-[#8b949e]">event_busy</span>
              </div>
              <p className="text-2xl font-bold text-white">No scheduled sessions</p>
              <p className="text-[#8b949e] max-w-md mt-2">You don't have any upcoming confirmed mentoring sessions.</p>
              <button 
                onClick={() => navigate('/mentors')} 
                className="mt-6 px-6 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9] font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">search</span> Browse Mentors
              </button>
            </div>
          )}
          
          {activeTab === "completed" && completedSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 text-center bg-[#161b22]/50 rounded-2xl p-16 mt-4 border border-[#30363d] border-dashed">
              <div className="w-20 h-20 rounded-full bg-[#0d1117] flex items-center justify-center border-2 border-[#30363d] mb-4">
                <span className="material-symbols-outlined text-4xl text-[#8b949e]">history_toggle_off</span>
              </div>
              <p className="text-2xl font-bold text-white">No history found</p>
              <p className="text-[#8b949e] max-w-md mt-2">You haven't completed or cancelled any sessions yet.</p>
            </div>
          )}

        </div>
      </div>

      {/* Action Modals */}
      <ActionModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, bookingId: null })}
        title="Confirm Session"
        message="Please provide a Google Meet or Zoom link for the mentee to join."
        inputLabel="Meeting Link URL"
        inputPlaceholder="https://meet.google.com/xyz-abcd-efg"
        confirmText="Confirm Session"
        confirmColor="green"
        onConfirm={(val) => executeAction(confirmModal.bookingId, "confirm", val)}
      />

      <ActionModal 
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: null })}
        title="Cancel Session"
        message="Are you sure you want to cancel this session? Please provide a reason to notify the other party."
        inputLabel="Cancellation Reason"
        inputPlaceholder="e.g. Scheduling conflict, emergency, etc."
        confirmText="Cancel Session"
        confirmColor="red"
        onConfirm={(val) => executeAction(cancelModal.bookingId, "cancel", val)}
      />
    </div>
  );
}

// Extracted Action Buttons Component
function SessionActions({ session, isMentor, actionLoading, onAction, navigate }) {
  const loading = actionLoading === session._id;
  
  return (
    <>
      {isMentor && session.status === 'pending' && (
        <button 
          onClick={() => onAction(session._id, 'confirm')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#238636] text-white text-sm font-semibold rounded-lg hover:bg-[#2ea043] transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">edit_calendar</span>}
          Accept & Add Link
        </button>
      )}
      {session.status === 'confirmed' && (
        <>
          <button 
            onClick={() => navigate(`/workspace/session/${session._id}`)}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#1f6feb] to-[#238636]/60 border border-[#388bfd]/30 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Join Workspace
          </button>
          {isMentor && (
            <button 
              onClick={() => onAction(session._id, 'complete')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] text-xs font-semibold rounded-lg hover:bg-[#30363d] transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px] text-[#3fb950]">done_all</span>
              Mark Completed
            </button>
          )}
        </>
      )}
      {isMentor && session.status === 'confirmed' && new Date() > new Date(session.startAt) && (
        <button 
          onClick={() => onAction(session._id, 'no-show')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-2 bg-transparent border border-[#d29922]/40 text-[#e3b341] text-xs font-semibold rounded-lg hover:bg-[#d29922]/10 transition-colors disabled:opacity-50 mt-1"
        >
          <span className="material-symbols-outlined text-[16px]">person_off</span>
          Mark No-Show
        </button>
      )}
      <button 
        onClick={() => onAction(session._id, 'cancel')}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-5 py-2 bg-transparent border border-[#da3633]/40 text-[#ff7b72] text-xs font-semibold rounded-lg hover:bg-[#da3633]/10 transition-colors disabled:opacity-50 mt-1"
      >
        <span className="material-symbols-outlined text-[16px]">cancel</span>
        Cancel Session
      </button>
    </>
  );
}
