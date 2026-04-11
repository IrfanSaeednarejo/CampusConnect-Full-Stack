import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSessions,
  cancelSession,
  selectUpcomingSessions,
  selectCompletedSessions,
  selectSessionActionLoading,
} from "../../redux/slices/sessionsSlice";
import { useModal, MODAL_TYPES } from "../../contexts/ModalContext";

export default function StudentSessions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openModal } = useModal();
  
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const status = useSelector((state) => state.sessions.status);
  const upcomingSessions = useSelector(selectUpcomingSessions);
  const pastSessions = useSelector(selectCompletedSessions);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const displaySessions = activeTab === "upcoming" ? upcomingSessions : pastSessions;

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">

      <main className="px-4 sm:px-10 lg:px-20 py-5 md:py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">My Sessions</h1>
            <p className="text-text-secondary">Track your mentoring sessions and feedback.</p>
          </div>
          <button 
            onClick={() => navigate("/student/book-mentor")}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Book a Mentor
          </button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-2 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "upcoming" ? "bg-primary text-white" : "text-text-primary hover:bg-[#C7D2FE]"
            }`}
          >
            Upcoming Sessions ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "past" ? "bg-primary text-white" : "text-text-primary hover:bg-[#C7D2FE]"
            }`}
          >
            Past Sessions ({pastSessions.length})
          </button>
        </div>

        {status === "loading" && (
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-surface rounded-xl border border-border"></div>
            <div className="h-40 bg-surface rounded-xl border border-border"></div>
          </div>
        )}

        {status === "succeeded" && displaySessions.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">forum</span>
            <h3 className="text-xl font-bold text-text-primary mb-2">No {activeTab} sessions</h3>
            <p className="text-text-secondary mb-6">Book a session to get personalized guidance.</p>
            <button 
              onClick={() => navigate("/student/book-mentor")}
              className="border border-border text-text-primary hover:bg-[#C7D2FE] px-6 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              Find a Mentor
            </button>
          </div>
        ) : status === "succeeded" ? (
          <div className="flex flex-col gap-4">
            {displaySessions.map((session) => (
              <SessionCard 
                key={session._id} 
                session={session} 
                activeTab={activeTab} 
                openModal={openModal} 
              />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function SessionCard({ session, activeTab, openModal }) {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => selectSessionActionLoading(state, session._id));

  return (
    <div className={`bg-surface border border-border p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#475569] transition-colors ${isLoading ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#4F46E5]/40 to-[#1f6feb]/40 flex items-center justify-center flex-shrink-0 border border-border text-white font-bold text-xl">
          {session.mentorName?.charAt(0) || "M"}
        </div>
        <div>
          <h3 className="text-text-primary text-lg font-bold leading-tight flex items-center gap-2 mb-1">
            {session.mentorName}
            {activeTab === 'past' && session.feedbackGiven && (
              <span className="bg-primary/20 text-primary border border-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Feedback Given ✓
              </span>
            )}
          </h3>
          <p className="text-text-secondary text-sm mb-2">{session.mentorTitle} at {session.mentorCompany}</p>
          <div className="flex flex-wrap gap-4 text-sm text-text-primary">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-text-secondary">calendar_today</span>{session.date}</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-text-secondary">schedule</span>{session.time}</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-text-secondary">timer</span>{session.duration}</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-text-secondary">topic</span>{session.topic}</span>
          </div>
        </div>
      </div>

      <div className="flex md:flex-col lg:flex-row gap-3 min-w-[140px]">
        {activeTab === "upcoming" ? (
          <>
            <button
              onClick={() => openModal(MODAL_TYPES.CANCEL_SESSION, { 
                sessionId: session._id, 
                mentorName: session.mentorName,
                onConfirm: () => dispatch(cancelSession(session._id))
              })}
              disabled={isLoading}
              className="flex-1 lg:flex-none justify-center px-4 py-2 rounded-lg border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10 font-bold text-sm transition-colors flex items-center gap-1.5"
            >
              {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[16px]">cancel</span>}
              Cancel
            </button>
            <a
              href={session.meetingLink || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex-1 lg:flex-none justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              Join
            </a>
          </>
        ) : (
          <>
            {!session.feedbackGiven && (
              <button
                onClick={() => openModal(MODAL_TYPES.SESSION_FEEDBACK, { sessionId: session._id, mentorName: session.mentorName })}
                disabled={isLoading}
                className="w-full justify-center px-4 py-2 rounded-lg border border-primary text-[#4338CA] hover:bg-primary/10 font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                {isLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[16px]">rate_review</span>}
                Leave Feedback
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
