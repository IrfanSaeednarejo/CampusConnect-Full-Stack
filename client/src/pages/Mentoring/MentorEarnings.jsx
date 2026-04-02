import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMentoringSessions } from "../../api/mentoringApi";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import SharedFooter from "../../components/common/SharedFooter";

export default function MentorEarnings() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await getMentoringSessions();
        const items = res.data?.docs || res.data || [];
        setSessions(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(err?.message || "Failed to load session data");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Derive earnings from real session data
  const completedSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "Completed"
  );
  const totalEarnings = completedSessions.reduce(
    (sum, s) => sum + (s.mentorPayout || s.fee || 0),
    0
  );
  const pendingAmount = sessions
    .filter((s) => s.status === "confirmed" || s.status === "pending")
    .reduce((sum, s) => sum + (s.fee || 0), 0);

  const ratedSessions = completedSessions.filter((s) => s.reviewId?.rating);
  const avgRating =
    ratedSessions.length > 0
      ? ratedSessions.reduce((sum, s) => sum + s.reviewId.rating, 0) /
        ratedSessions.length
      : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed" || s === "paid") return "text-[#1dc964]";
    if (s === "pending" || s === "confirmed") return "text-yellow-400";
    if (s === "cancelled") return "text-red-400";
    return "text-text-secondary";
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                Earnings & Sessions
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal">
                Track your earnings from mentoring sessions
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col gap-3 p-5 bg-surface border border-border rounded-xl">
                <p className="text-text-secondary text-sm font-normal">Total Earned</p>
                <p className="text-white text-3xl font-bold">
                  {loading ? "..." : `$${totalEarnings.toFixed(2)}`}
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-surface border border-border rounded-xl">
                <p className="text-text-secondary text-sm font-normal">Sessions Completed</p>
                <p className="text-white text-3xl font-bold">
                  {loading ? "..." : completedSessions.length}
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-surface border border-border rounded-xl">
                <p className="text-text-secondary text-sm font-normal">Avg. Rating</p>
                <p className="text-white text-3xl font-bold">
                  {loading ? "..." : avgRating > 0 ? `${avgRating.toFixed(1)}⭐` : "—"}
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-surface border border-border rounded-xl">
                <p className="text-text-secondary text-sm font-normal">Pending Amount</p>
                <p className="text-white text-3xl font-bold">
                  {loading ? "..." : `$${pendingAmount.toFixed(2)}`}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === "overview"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                All Sessions
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === "completed"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Completed ({completedSessions.length})
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="w-10 h-10 border-4 border-[#1dc964] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-secondary">Loading session data...</p>
              </div>
            ) : (
              <>
                {/* Tab Content */}
                {(() => {
                  const displaySessions =
                    activeTab === "completed" ? completedSessions : sessions;

                  if (displaySessions.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                        <span className="material-symbols-outlined text-6xl text-text-secondary">
                          account_balance_wallet
                        </span>
                        <div>
                          <p className="text-white text-lg font-bold">No sessions yet</p>
                          <p className="text-text-secondary text-sm">
                            Your mentoring sessions will appear here once students book with you.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      {displaySessions.map((session) => {
                        const sId = session._id || session.id;
                        const menteeName =
                          session.menteeId?.profile?.displayName ||
                          session.student?.profile?.displayName ||
                          session.menteeName ||
                          "Student";
                        const sessionDate =
                          session.startAt || session.scheduledAt || session.createdAt;
                        const amount = session.mentorPayout || session.fee || 0;
                        const status = session.status || "pending";
                        const duration = session.duration
                          ? `${session.duration} min`
                          : "—";

                        return (
                          <div
                            key={sId}
                            className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-[#1dc964] transition-colors"
                          >
                            <div className="flex flex-col gap-1">
                              <p className="text-white font-semibold capitalize">
                                {menteeName}
                              </p>
                              <p className="text-text-secondary text-sm">
                                {formatDate(sessionDate)} • {duration}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-white font-bold">
                                  {amount > 0 ? `$${amount.toFixed(2)}` : "Free"}
                                </p>
                                <p className={`text-sm capitalize ${getStatusColor(status)}`}>
                                  {status}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </main>
        <SharedFooter />
      </div>
    </div>
  );
}
