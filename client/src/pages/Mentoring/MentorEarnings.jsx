import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchMyMentorProfile, 
  selectMyMentorProfile, 
  fetchMyBookings, 
  selectMyBookings, 
  selectMentoringLoading 
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";

export default function MentorEarnings() {
  const dispatch = useDispatch();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const bookings = useSelector(selectMyBookings) || [];
  const loading = useSelector(selectMentoringLoading);
  const currentUser = useSelector(selectUser);
  
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
    // Fetch specifically the past completed sessions where user is mentor
    dispatch(fetchMyBookings({ sort: '-scheduledAt', status: 'completed,cancelled', limit: 50 }));
  }, [dispatch]);

  // Derive metrics
  const totalEarnings = mentorProfile?.totalEarnings || 0;
  const sessionCompleted = mentorProfile?.totalSessions || 0;
  const averageRating = mentorProfile?.averageRating || 0;
  const pendingWithdrawal = mentorProfile?.pendingPayout || 0;
  const currency = mentorProfile?.currency || 'PKR';

  // We consider a session an "earning" if its status is completed and the user is the mentor
  const sessionEarnings = bookings.filter(b => 
    b.status === 'completed' && b.mentorId?.userId?._id === currentUser?._id
  );

  // Fallback history since we don't have a payout table right now
  const withdrawalHistory = [];

  if (loading && !mentorProfile) {
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
            Earnings & Withdrawals
          </h1>
          <p className="text-[#8b949e]">Track your earnings from mentoring sessions and manage payouts.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div className="flex flex-col gap-3 p-5 bg-[#161b22] border border-[#30363d] rounded-2xl">
            <p className="text-[#8b949e] text-sm font-semibold uppercase tracking-wider">Total Earnings</p>
            <p className="text-white text-3xl font-bold break-words">{currency} {totalEarnings.toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-3 p-5 bg-[#161b22] border border-[#30363d] rounded-2xl">
            <p className="text-[#8b949e] text-sm font-semibold uppercase tracking-wider">Sessions Completed</p>
            <p className="text-white text-3xl font-bold">{sessionCompleted}</p>
          </div>
          <div className="flex flex-col gap-3 p-5 bg-[#161b22] border border-[#30363d] rounded-2xl">
            <p className="text-[#8b949e] text-sm font-semibold uppercase tracking-wider">Avg. Rating</p>
            <p className="text-white text-3xl font-bold flex items-center gap-1">
              {averageRating.toFixed(1)} <span className="material-symbols-outlined text-[#e3b341] text-[24px]">star</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 p-5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-2xl">
            <p className="text-[#3fb950] text-sm font-semibold uppercase tracking-wider">Pending Payout</p>
            <p className="text-[#3fb950] text-3xl font-bold break-words">{currency} {pendingWithdrawal.toFixed(2)}</p>
          </div>
        </div>

        {/* Withdrawal Action */}
        <div className="mt-2">
          <button 
            disabled={pendingWithdrawal <= 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#238636] text-white font-bold rounded-xl hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined font-normal">account_balance_wallet</span>
            Request Withdrawal
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#30363d] gap-8 mt-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center border-b-2 py-3 transition-colors ${
              activeTab === "overview"
                ? "border-b-[#3fb950] text-white"
                : "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span className="text-sm font-semibold tracking-wide">Session Earnings</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center justify-center border-b-2 py-3 transition-colors ${
              activeTab === "history"
                ? "border-b-[#3fb950] text-white"
                : "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span className="text-sm font-semibold tracking-wide">Payout History</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex flex-col gap-4 mt-2">
          {activeTab === "overview" && (
            sessionEarnings.length > 0 ? (
              sessionEarnings.map((session) => {
                const mentee = session.menteeId;
                const menteeName = mentee?.profile?.displayName || `${mentee?.profile?.firstName || ''} ${mentee?.profile?.lastName || ''}`.trim() || 'Mentee';
                const date = new Date(session.startAt);
                // Use actual payout from booking if available, otherwise fall back to hourly rate
                const amount = session.mentorPayout || mentorProfile?.hourlyRate || 0;

                return (
                  <div
                    key={session._id}
                    className="flex flex-col md:flex-row items-center justify-between p-5 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e] transition-colors"
                  >
                    <div className="flex flex-col gap-1 w-full md:w-auto text-center md:text-left">
                      <p className="text-white font-bold text-lg">{menteeName}</p>
                      <p className="text-[#8b949e] text-sm">
                        {date.toLocaleDateString()} • 1 Hour Session
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <div className="text-center md:text-right">
                        <p className="text-white font-bold text-xl">{currency} {amount.toFixed(2)}</p>
                        <p className="text-[#3fb950] text-sm font-bold uppercase tracking-wider">{session.status}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-[#161b22] border border-[#30363d] rounded-2xl">
                <p className="text-[#8b949e] font-medium">No completed sessions yet to show earnings.</p>
              </div>
            )
          )}

          {activeTab === "history" && (
            withdrawalHistory.length > 0 ? (
              withdrawalHistory.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-5 bg-[#161b22] border border-[#30363d] rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#3fb950] text-3xl">check_circle</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-white font-bold">{withdrawal.method}</p>
                      <p className="text-[#8b949e] text-sm">{withdrawal.date}</p>
                    </div>
                  </div>
                  <p className="text-white font-bold text-xl">{currency} {withdrawal.amount.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[#161b22] border border-[#30363d] rounded-2xl">
                <p className="text-[#8b949e] font-medium">No past withdrawals.</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
