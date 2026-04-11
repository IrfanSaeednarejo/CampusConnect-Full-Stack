import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useModal, MODAL_TYPES } from "../../contexts/ModalContext";
import MentorSidebar from "../../components/mentoring/MentorSidebar";
import DashboardTopBar from "../../components/common/DashboardTopBar";
import {
  fetchSessionsThunk,
  confirmSessionThunk,
  cancelSessionThunk,
  selectScheduledSessions,
  selectCompletedSessions,
  selectMentoringLoading,
} from "../../redux/slices/mentoringSlice";
import { getMyMentorProfile } from "../../api/mentoringApi";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const scheduledSessions = useSelector(selectScheduledSessions);
  const completedSessions = useSelector(selectCompletedSessions);
  const loading = useSelector(selectMentoringLoading);
  const authUser = useSelector((state) => state.auth?.user);

  const displayName = authUser?.profile?.displayName || authUser?.name || "Mentor";

  useEffect(() => {
    dispatch(fetchSessionsThunk());
    getMyMentorProfile()
      .then(() => setNeedsRegistration(false))
      .catch((err) => {
        const status = err?.statusCode || err?.response?.status || err?.status;
        const msg = (err?.message || err?.response?.data?.message || "").toLowerCase();
        if (status === 404 || msg.includes("register as a mentor") || msg.includes("not found")) {
          setNeedsRegistration(true);
        }
      });
  }, [dispatch]);

  const upcomingSessions = scheduledSessions.slice(0, 4);
  const recentRatings = completedSessions.filter((s) => s.reviewId?.rating).slice(0, 4);
  const pendingFeedback = completedSessions.filter((s) => !s.reviewId);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Stats from real data
  const statCards = [
    { label: "Upcoming Sessions", value: scheduledSessions.length, icon: "event_available", gradient: "from-primary to-indigo-800" },
    { label: "Completed", value: completedSessions.length, icon: "check_circle", gradient: "from-emerald-600 to-emerald-800" },
    { label: "Pending Feedback", value: pendingFeedback.length, icon: "rate_review", gradient: "from-amber-600 to-amber-800" },
    { label: "Avg Rating", value: recentRatings.length > 0 ? (recentRatings.reduce((s, r) => s + (r.reviewId?.rating || 0), 0) / recentRatings.length).toFixed(1) : "—", icon: "star", gradient: "from-yellow-600 to-yellow-800" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Collapsible Sidebar */}
      <MentorSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          title="Mentor Portal"
          notificationsPath="/mentor-notifications"
          profilePath="/mentor-profile-view"
          roleBadge="Mentor"
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-text-primary text-2xl font-bold">
                {greeting}, {displayName}! 👋
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Manage your sessions, ratings, and mentee feedback.
              </p>
            </div>
            <button
              onClick={() => openModal(MODAL_TYPES.SET_AVAILABILITY)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              Set Availability
            </button>
          </div>

          {/* Registration Banner */}
          {needsRegistration && (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <span className="material-symbols-outlined text-amber-500 text-2xl">info</span>
              <div className="flex-1">
                <p className="text-text-primary font-semibold text-sm">Complete Your Mentor Profile</p>
                <p className="text-text-secondary text-xs mt-0.5">Register as a mentor to accept sessions and earn.</p>
              </div>
              <button
                onClick={() => navigate("/mentor-registration")}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Register Now
              </button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl p-4 bg-surface border border-border hover:border-primary/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3`}>
                  <span className="material-symbols-outlined text-white text-[20px]">{card.icon}</span>
                </div>
                <p className="text-text-primary text-2xl font-bold">{card.value}</p>
                <p className="text-text-secondary text-xs mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Sessions — 2 cols */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">Upcoming Sessions</h2>
                {scheduledSessions.length > 0 && (
                  <button onClick={() => navigate("/my-sessions")} className="text-primary text-sm font-medium hover:underline">
                    View All
                  </button>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session._id} className="p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={session.menteeId?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.menteeId?.profile?.displayName}`}
                            className="w-10 h-10 rounded-full"
                            alt="Mentee"
                          />
                          <div>
                            <p className="text-text-primary font-semibold text-sm">{session.menteeId?.profile?.displayName || "Student"}</p>
                            <p className="text-text-secondary text-xs">
                              {new Date(session.startAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} • {session.duration || 60} min
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${session.status === "confirmed" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-500"
                          }`}>
                          {session.status}
                        </span>
                      </div>
                      {session.topic && (
                        <p className="text-text-secondary text-xs mt-2 pl-[52px]">Topic: {session.topic}</p>
                      )}
                      {session.status === "pending" && (
                        <div className="flex gap-2 mt-3 pl-[52px]">
                          <button
                            onClick={() => dispatch(confirmSessionThunk(session._id))}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span> Confirm
                          </button>
                          <button
                            onClick={() => dispatch(cancelSessionThunk(session._id))}
                            className="flex items-center gap-1 px-3 py-1.5 bg-transparent border border-red-500 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-5xl mb-2">event_busy</span>
                  <p className="text-text-primary text-sm font-medium">No sessions yet</p>
                  <p className="text-text-secondary text-xs mt-1">Once a student books a session, it will appear here.</p>
                </div>
              )}
            </div>

            {/* Pending Feedback — 1 col */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="text-text-primary text-lg font-bold mb-4">Pending Feedback</h2>
              {pendingFeedback.length > 0 ? (
                <div className="space-y-3">
                  {pendingFeedback.slice(0, 4).map((session) => (
                    <button
                      key={session._id}
                      onClick={() => navigate("/my-sessions")}
                      className="w-full flex items-center gap-3 p-3 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors text-left"
                    >
                      <img
                        src={session.menteeId?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.menteeId?.profile?.displayName}`}
                        className="w-8 h-8 rounded-full"
                        alt="Mentee"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary text-sm font-medium truncate">{session.menteeId?.profile?.displayName || "Student"}</p>
                        <p className="text-text-secondary text-[10px]">Awaiting review</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/15 text-amber-500">Pending</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="material-symbols-outlined text-primary text-4xl mb-2">check_circle</span>
                  <p className="text-text-primary text-sm font-medium">All Caught Up!</p>
                  <p className="text-text-secondary text-xs mt-1">No pending feedback requests.</p>
                </div>
              )}
            </div>

            {/* Recent Ratings — Full Width */}
            <div className="lg:col-span-3 bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">Recent Mentee Ratings</h2>
                {recentRatings.length > 0 && (
                  <button onClick={() => navigate("/my-sessions")} className="text-primary text-sm font-medium hover:underline">
                    View All
                  </button>
                )}
              </div>
              {recentRatings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentRatings.map((session) => (
                    <div key={session._id} className="p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={session.menteeId?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.menteeId?.profile?.displayName}`}
                          className="w-8 h-8 rounded-full"
                          alt="Mentee"
                        />
                        <p className="text-text-primary font-semibold text-sm flex-1">{session.menteeId?.profile?.displayName || "Student"}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < (session.reviewId?.rating || 0) ? "text-yellow-400 text-xs" : "text-text-secondary/30 text-xs"}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {session.reviewId?.comment && (
                        <p className="text-text-secondary text-xs italic line-clamp-2">"{session.reviewId.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-5xl mb-2">star_outline</span>
                  <p className="text-text-primary text-sm font-medium">No ratings yet</p>
                  <p className="text-text-secondary text-xs mt-1">Your mentee ratings will appear here after completed sessions.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
