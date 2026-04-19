import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchMyBookings, 
  selectMyBookings, 
  selectMentoringLoading,
  confirmBookingThunk,
  cancelBookingThunk,
  completeBookingThunk
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import Avatar from "../../components/common/Avatar";
import { toast } from "react-hot-toast";

export default function MentorSessionsManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookings = useSelector(selectMyBookings) || [];
  const loading = useSelector(selectMentoringLoading);
  const currentUser = useSelector(selectUser);
  
  const [activeTab, setActiveTab] = useState("scheduled");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchMyBookings({ sort: '-scheduledAt', limit: 100 }));
  }, [dispatch]);

  const scheduledSessions = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const completedSessions = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const handleStatusChange = async (bookingId, action) => {
    setActionLoading(bookingId);
    try {
      if (action === 'confirm') await dispatch(confirmBookingThunk(bookingId)).unwrap();
      else if (action === 'cancel') await dispatch(cancelBookingThunk(bookingId)).unwrap();
      else if (action === 'complete') await dispatch(completeBookingThunk(bookingId)).unwrap();
      
      toast.success(`Session ${action}ed successfully`);
      dispatch(fetchMyBookings({ sort: '-scheduledAt', limit: 100 }));
    } catch (err) {
      toast.error(err || `Failed to ${action} session`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPartnerInfo = (session) => {
    // If current user is mentor, show mentee info, else show mentor info
    const isMentor = session.mentorId?.userId?._id === currentUser?._id;
    return isMentor ? session.studentId : session.mentorId?.userId;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <div className="w-8 h-8 border-4 border-[#3fb950] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-4 lg:p-10 overflow-y-auto">
      <div className="flex w-full max-w-6xl mx-auto flex-col gap-6">
        
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#c9d1d9] tracking-tight">
            My Sessions
          </h1>
          <p className="text-[#8b949e]">Manage your upcoming and past mentoring sessions.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#30363d] gap-8 mt-2">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`flex flex-col items-center justify-center border-b-2 py-3 transition-colors ${
              activeTab === "scheduled"
                ? "border-b-[#3fb950] text-white"
                : "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span className="text-sm font-semibold tracking-wide">
              Scheduled ({scheduledSessions.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex flex-col items-center justify-center border-b-2 py-3 transition-colors ${
              activeTab === "completed"
                ? "border-b-[#3fb950] text-white"
                : "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span className="text-sm font-semibold tracking-wide">
              History ({completedSessions.length})
            </span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex flex-col gap-4 mt-2">
          
          {/* SCHEDULED SESSIONS */}
          {activeTab === "scheduled" && scheduledSessions.map((session) => {
            const partner = getPartnerInfo(session);
            const partnerName = partner?.profile?.displayName || `${partner?.profile?.firstName || 'Unknown'} ${partner?.profile?.lastName || ''}`;
            const date = new Date(session.scheduledAt);
            const isMentor = session.mentorId?.userId?._id === currentUser?._id;

            return (
              <div
                key={session._id}
                className="flex flex-col md:flex-row gap-5 bg-[#161b22] rounded-xl p-5 md:items-center border border-[#30363d] hover:border-[#8b949e] transition-colors"
              >
                <div className="flex flex-1 items-center gap-4 min-w-0">
                  <div className="shrink-0">
                    {partner?.profile?.avatar ? (
                      <img src={partner.profile.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-[#30363d]" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#30363d] flex items-center justify-center text-xl font-bold text-white">
                        {partnerName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col min-w-0">
                    <p className="text-lg font-bold text-white truncate">
                      {partnerName}
                      <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#0d1117] border border-[#30363d] text-[#8b949e]">
                        {isMentor ? 'Mentee' : 'Mentor'}
                      </span>
                    </p>
                    <p className="text-sm text-[#8b949e] truncate mt-0.5">Topic: {session.topic || 'General Guidance'}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-sm font-medium text-[#c9d1d9] flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
                        <span className="material-symbols-outlined text-[16px] text-[#3fb950]">calendar_today</span> 
                        {date.toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium text-[#c9d1d9] flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
                        <span className="material-symbols-outlined text-[16px] text-[#3fb950]">schedule</span> 
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        session.status === 'confirmed' ? 'bg-[#3fb950]/20 text-[#3fb950]' : 'bg-[#d29922]/20 text-[#d29922]'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex shrink-0 gap-3 flex-wrap md:flex-col lg:flex-row justify-start md:justify-end mt-2 md:mt-0 pt-4 md:pt-0 border-t border-[#30363d] md:border-t-0">
                  {isMentor && session.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(session._id, 'confirm')}
                      disabled={actionLoading === session._id}
                      className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-semibold rounded-lg hover:bg-[#2ea043] transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      Accept
                    </button>
                  )}
                  {session.status === 'confirmed' && (
                    <>
                      <button 
                        onClick={() => navigate(`/workspace/session/${session._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#388bfd] text-white text-sm font-semibold rounded-lg hover:bg-[#1f6feb] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        Go to Workspace
                      </button>
                      <button 
                        onClick={() => handleStatusChange(session._id, 'complete')}
                        disabled={actionLoading === session._id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-semibold rounded-lg hover:bg-[#2ea043] transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Mark Completed
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleStatusChange(session._id, 'cancel')}
                    disabled={actionLoading === session._id}
                    className="flex items-center gap-2 px-4 py-2 bg-[#da3633]/10 text-[#ff7b72] border border-[#da3633]/30 text-sm font-semibold rounded-lg hover:bg-[#da3633]/20 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}

          {/* COMPLETED SESSIONS */}
          {activeTab === "completed" && completedSessions.map((session) => {
            const partner = getPartnerInfo(session);
            const partnerName = partner?.profile?.displayName || `${partner?.profile?.firstName || 'Unknown'} ${partner?.profile?.lastName || ''}`;
            const date = new Date(session.scheduledAt);
            const isMentor = session.mentorId?.userId?._id === currentUser?._id;

            return (
              <div
                key={session._id}
                className="flex flex-col md:flex-row gap-5 bg-[#0d1117] rounded-xl p-5 md:items-center border border-[#30363d] opacity-80"
              >
                <div className="flex flex-1 items-center gap-4 min-w-0">
                  <div className="shrink-0 grayscale">
                    {partner?.profile?.avatar ? (
                      <img src={partner.profile.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-[#30363d]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#30363d] flex items-center justify-center text-lg font-bold text-[#8b949e]">
                        {partnerName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col min-w-0">
                    <p className="text-base font-bold text-[#8b949e] truncate flex items-center gap-2">
                      {partnerName}
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        session.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/30' : 'bg-[#da3633]/10 text-[#ff7b72] border-[#da3633]/30'
                      }`}>
                        {session.status}
                      </span>
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs font-medium text-[#8b949e] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                        {date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty States */}
          {activeTab === "scheduled" && scheduledSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 text-center bg-[#161b22] rounded-2xl p-12 mt-4 border border-[#30363d]">
              <div className="w-16 h-16 rounded-full bg-[#0d1117] flex items-center justify-center border border-[#30363d] mb-2">
                <span className="material-symbols-outlined text-3xl text-[#8b949e]">event_busy</span>
              </div>
              <p className="text-xl font-bold text-white">No scheduled sessions</p>
              <p className="text-[#8b949e] max-w-md">You don't have any upcoming mentoring sessions booked at the moment.</p>
            </div>
          )}
          
          {activeTab === "completed" && completedSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 text-center bg-[#161b22] rounded-2xl p-12 mt-4 border border-[#30363d]">
              <div className="w-16 h-16 rounded-full bg-[#0d1117] flex items-center justify-center border border-[#30363d] mb-2">
                <span className="material-symbols-outlined text-3xl text-[#8b949e]">history</span>
              </div>
              <p className="text-xl font-bold text-white">No history found</p>
              <p className="text-[#8b949e] max-w-md">You haven't completed or cancelled any sessions yet.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
