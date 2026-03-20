import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectScheduledSessions, selectCompletedSessions, setScheduledSessions, setCompletedSessions } from "../../redux/slices/mentoringSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function MentorSessions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scheduledSessions = useSelector(selectScheduledSessions);
  const completedSessions = useSelector(selectCompletedSessions);
  
  const [activeTab, setActiveTab] = useState("scheduled");

  useEffect(() => {
    if (scheduledSessions.length === 0) {
      dispatch(setScheduledSessions([
        {
          id: 1,
          mentee: "John Doe",
          menteeImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          date: "2024-02-15",
          time: "10:00 AM",
          duration: "1 hour",
          topic: "Web Development Basics",
          status: "Confirmed",
        },
        {
          id: 2,
          mentee: "Jane Smith",
          menteeImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          date: "2024-02-16",
          time: "2:00 PM",
          duration: "1.5 hours",
          topic: "React Advanced Patterns",
          status: "Confirmed",
        },
      ]));
    }
  }, [dispatch, scheduledSessions.length]);

  useEffect(() => {
    if (completedSessions.length === 0) {
      dispatch(setCompletedSessions([
        {
          id: 3,
          mentee: "Alex Johnson",
          menteeImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
          date: "2024-02-10",
          time: "11:00 AM",
          duration: "1 hour",
          topic: "JavaScript Fundamentals",
          rating: 5,
          feedback: "Excellent mentor! Very helpful.",
        },
        {
          id: 4,
          mentee: "Sarah Williams",
          menteeImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          date: "2024-02-08",
          time: "3:00 PM",
          duration: "1.5 hours",
          topic: "Database Design",
          rating: 4.5,
          feedback: "Great session, learned a lot!",
        },
      ]));
    }
  }, [dispatch, completedSessions.length]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-5xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                My Mentoring Sessions
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                View and manage your scheduled and completed sessions
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[#30363d]">
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "scheduled"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : "text-[#9eb7a9] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
                Scheduled
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "completed"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : "text-[#9eb7a9] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined">check_circle</span>
                Completed
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === "scheduled" &&
                scheduledSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-5 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#1dc964] transition-colors"
                  >
                    <div className="flex gap-4 flex-1">
                      <img
                        src={session.menteeImage}
                        alt={session.mentee}
                        className="w-12 h-12 rounded-full border border-[#30363d]"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">
                          {session.mentee}
                        </h3>
                        <p className="text-[#9eb7a9] text-sm mb-2">
                          {session.topic}
                        </p>
                        <div className="flex gap-4 text-[#9eb7a9] text-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              calendar_today
                            </span>
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              schedule
                            </span>
                            {session.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              timer
                            </span>
                            {session.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#1dc964] text-[#112118] font-bold rounded hover:opacity-90 transition-opacity whitespace-nowrap">
                        <span className="material-symbols-outlined">
                          video_call
                        </span>
                        Join
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#30363d] text-white rounded hover:bg-[#404851] transition-colors">
                        <span className="material-symbols-outlined">send</span>
                        Remind
                      </button>
                    </div>
                  </div>
                ))}

              {activeTab === "completed" &&
                completedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-5 bg-[#161b22] border border-[#30363d] rounded-xl"
                  >
                    <div className="flex gap-4 flex-1">
                      <img
                        src={session.menteeImage}
                        alt={session.mentee}
                        className="w-12 h-12 rounded-full border border-[#30363d]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold text-lg">
                            {session.mentee}
                          </h3>
                          <div className="flex items-center gap-1">
                            {[...Array(Math.round(session.rating))].map(
                              (_, i) => (
                                <span key={i} className="text-yellow-400">
                                  ★
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                        <p className="text-[#9eb7a9] text-sm mb-2">
                          {session.topic}
                        </p>
                        <p className="text-[#9eb7a9] text-sm italic mb-2">
                          "{session.feedback}"
                        </p>
                        <div className="flex gap-4 text-[#9eb7a9] text-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              calendar_today
                            </span>
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              timer
                            </span>
                            {session.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
