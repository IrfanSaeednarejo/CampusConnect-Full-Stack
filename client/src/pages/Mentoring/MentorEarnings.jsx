import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectEarningsData, selectWithdrawalHistory, selectSessionEarnings, setEarningsData, setWithdrawalHistory, setSessionEarnings } from "../../redux/slices/mentoringSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function MentorEarnings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const earningsData = useSelector(selectEarningsData);
  const withdrawalHistory = useSelector(selectWithdrawalHistory);
  const sessionEarnings = useSelector(selectSessionEarnings);
  
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (earningsData.totalEarnings === 0) {
      dispatch(setEarningsData({
        totalEarnings: 2450.5,
        sessionCompleted: 15,
        averageRating: 4.8,
        pendingWithdrawal: 450.5,
        lastWithdrawal: "2024-01-15",
      }));
    }
  }, [dispatch, earningsData.totalEarnings]);

  useEffect(() => {
    if (withdrawalHistory.length === 0) {
      dispatch(setWithdrawalHistory([
        {
          id: 1,
          amount: 500,
          date: "2024-01-15",
          status: "Completed",
          method: "Bank Transfer",
        },
        {
          id: 2,
          amount: 750,
          date: "2024-01-08",
          status: "Completed",
          method: "Bank Transfer",
        },
        {
          id: 3,
          amount: 300,
          date: "2024-01-01",
          status: "Completed",
          method: "PayPal",
        },
      ]));
    }
  }, [dispatch, withdrawalHistory.length]);

  useEffect(() => {
    if (sessionEarnings.length === 0) {
      dispatch(setSessionEarnings([
        {
          id: 1,
          mentee: "John Doe",
          date: "2024-02-10",
          duration: "1h",
          amount: 150,
          status: "Paid",
        },
        {
          id: 2,
          mentee: "Jane Smith",
          date: "2024-02-09",
          duration: "1.5h",
          amount: 225,
          status: "Paid",
        },
        {
          id: 3,
          mentee: "Alex Johnson",
          date: "2024-02-08",
          duration: "1h",
          amount: 150,
          status: "Pending",
        },
      ]));
    }
  }, [dispatch, sessionEarnings.length]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                Earnings & Withdrawals
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                Track your earnings from mentoring sessions and manage
                withdrawals
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col gap-3 p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
                <p className="text-[#9eb7a9] text-sm font-normal">
                  Total Earnings
                </p>
                <p className="text-white text-3xl font-bold">
                  ${earningsData.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
                <p className="text-[#9eb7a9] text-sm font-normal">
                  Sessions Completed
                </p>
                <p className="text-white text-3xl font-bold">
                  {earningsData.sessionCompleted}
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
                <p className="text-[#9eb7a9] text-sm font-normal">
                  Avg. Rating
                </p>
                <p className="text-white text-3xl font-bold">
                  {earningsData.averageRating}⭐
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
                <p className="text-[#9eb7a9] text-sm font-normal">
                  Pending Withdrawal
                </p>
                <p className="text-white text-3xl font-bold">
                  ${earningsData.pendingWithdrawal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Withdrawal Button */}
            <div className="mb-8">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
                Withdraw Earnings
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[#30363d]">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === "overview"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : "text-[#9eb7a9] hover:text-white"
                }`}
              >
                Session Earnings
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === "history"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : "text-[#9eb7a9] hover:text-white"
                }`}
              >
                Withdrawal History
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">
                {sessionEarnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#1dc964] transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-white font-semibold">
                        {earning.mentee}
                      </p>
                      <p className="text-[#9eb7a9] text-sm">
                        {earning.date} • {earning.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold">
                          ${earning.amount.toFixed(2)}
                        </p>
                        <p
                          className={`text-sm ${earning.status === "Paid" ? "text-[#1dc964]" : "text-[#9eb7a9]"}`}
                        >
                          {earning.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "history" && (
              <div className="flex flex-col gap-4">
                {withdrawalHistory.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 bg-[#161b22] border border-[#30363d] rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#1dc964]">
                        check_circle
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="text-white font-semibold">
                          {withdrawal.method}
                        </p>
                        <p className="text-[#9eb7a9] text-sm">
                          {withdrawal.date}
                        </p>
                      </div>
                    </div>
                    <p className="text-white font-bold">
                      ${withdrawal.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
