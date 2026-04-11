import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectScheduledSessions,
  selectCompletedSessions,
  fetchSessionsThunk,
  confirmSessionThunk,
  completeSessionThunk,
  cancelSessionThunk,
  selectMentoringLoading
} from "../../redux/slices/mentoringSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import SharedFooter from "../../components/common/SharedFooter";
import EmptyState from "../../components/common/EmptyState";

export default function MentorSessions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scheduledSessions = useSelector(selectScheduledSessions);
  const completedSessions = useSelector(selectCompletedSessions);
  const loading = useSelector(selectMentoringLoading);

  const [activeTab, setActiveTab] = useState("scheduled");

  useEffect(() => {
    dispatch(fetchSessionsThunk());
  }, [dispatch]);

  const handleConfirm = (id) => {
    dispatch(confirmSessionThunk(id));
  };

  const handleComplete = (id) => {
    dispatch(completeSessionThunk(id));
  };

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      dispatch(cancelSessionThunk(id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} mins`;
    const hours = (minutes / 60).toFixed(1);
    return `${hours} ${hours === "1.0" ? "hour" : "hours"}`;
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary group/design-root overflow-x-hidden bg-background">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-5xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-text-primary text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                My Mentoring Sessions
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal">
                View and manage your scheduled and completed sessions
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${activeTab === "scheduled"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
                Scheduled
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${activeTab === "completed"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <span className="material-symbols-outlined">check_circle</span>
                Completed
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-text-secondary">Loading sessions...</p>
                </div>
              ) : activeTab === "scheduled" ? (
                scheduledSessions.length > 0 ? (
                  scheduledSessions.map((session) => (
                    <div
                      key={session._id}
                      className="flex items-start justify-between p-5 bg-surface border border-border rounded-xl hover:border-primary transition-colors"
                    >
                      <div className="flex gap-4 flex-1">
                        <img
                          src={session.menteeId?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.menteeId?.profile?.displayName || "Student")}`}
                          alt={session.menteeId?.profile?.displayName}
                          className="w-12 h-12 rounded-full border border-border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-text-primary font-semibold text-lg">
                              {session.menteeId?.profile?.displayName || "Unknown Mentee"}
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${session.status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-[#F59E0B22] text-[#F59E0B]'
                              }`}>
                              {session.status}
                            </span>
                          </div>
                          <p className="text-text-secondary text-sm mb-2">
                            {session.topic || "Mentoring Session"}
                          </p>
                          <div className="flex flex-wrap gap-4 text-text-secondary text-sm">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">
                                calendar_today
                              </span>
                              {formatDate(session.startAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">
                                schedule
                              </span>
                              {formatTime(session.startAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">
                                timer
                              </span>
                              {calculateDuration(session.startAt, session.endAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 ml-4">
                        {session.status === 'pending' ? (
                          <button
                            onClick={() => handleConfirm(session._id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded hover:opacity-90 transition-opacity"
                          >
                            <span className="material-symbols-outlined">done</span>
                            Confirm
                          </button>
                        ) : (
                          <>
                            {/* If confirmed, show Join Meeting if link exists */}
                            {session.meetingLink ? (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded hover:opacity-90 transition-opacity"
                              >
                                <span className="material-symbols-outlined">videocam</span>
                                Join
                              </a>
                            ) : (
                              <button
                                disabled
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-surface text-text-secondary font-bold rounded cursor-not-allowed border border-border"
                                title="No meeting link provided"
                              >
                                <span className="material-symbols-outlined">videocam_off</span>
                                No Link
                              </button>
                            )}

                            {/* Only show Complete if session time has likely passed */}
                            {new Date() > new Date(session.endAt) && (
                              <button
                                onClick={() => handleComplete(session._id)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded hover:opacity-90 transition-opacity"
                              >
                                <span className="material-symbols-outlined">check_circle</span>
                                Complete
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleCancel(session._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-surface text-text-primary rounded hover:bg-[#ff444455] hover:text-[#ff4444] transition-all border border-border"
                        >
                          <span className="material-symbols-outlined">cancel</span>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon="calendar_today"
                    title="No scheduled sessions"
                    description="You don't have any upcoming mentoring sessions at the moment."
                  />
                )
              ) : completedSessions.length > 0 ? (
                completedSessions.map((session) => (
                  <div
                    key={session._id}
                    className="flex items-start justify-between p-5 bg-surface border border-border rounded-xl"
                  >
                    <div className="flex gap-4 flex-1">
                      <img
                        src={session.menteeId?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.menteeId?.profile?.displayName || "Student")}`}
                        alt={session.menteeId?.profile?.displayName}
                        className="w-12 h-12 rounded-full border border-border"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-text-primary font-semibold text-lg">
                            {session.menteeId?.profile?.displayName || "Unknown Mentee"}
                          </h3>
                          {session.reviewId && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < (session.reviewId.rating || 0) ? "text-yellow-400" : "text-border"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-text-secondary text-sm mb-2">
                          {session.topic || "Mentoring Session"}
                        </p>
                        {session.reviewId?.comment && (
                          <p className="text-text-secondary text-sm italic mb-2">
                            "{session.reviewId.comment}"
                          </p>
                        )}
                        <div className="flex gap-4 text-text-secondary text-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              calendar_today
                            </span>
                            {formatDate(session.startAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              timer
                            </span>
                            {calculateDuration(session.startAt, session.endAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon="check_circle"
                  title="No completed sessions"
                  description="Sessions you complete will appear here along with mentee feedback."
                />
              )}
            </div>
          </div>
        </main>
        <SharedFooter />
      </div>
    </div>
  );
}
