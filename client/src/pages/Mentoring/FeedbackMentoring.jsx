import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectPendingFeedback, setPendingFeedback, removePendingFeedback } from "../../redux/slices/mentoringSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function FeedbackMentoring() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pendingFeedback = useSelector(selectPendingFeedback);
  
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (pendingFeedback.length === 0) {
      dispatch(setPendingFeedback([
        {
          id: 1,
          mentee: "John Doe",
          menteeImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          sessionDate: "2024-02-10",
          topic: "Web Development Basics",
          duration: "1 hour",
        },
        {
          id: 2,
          mentee: "Jane Smith",
          menteeImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          sessionDate: "2024-02-08",
          topic: "React Advanced Patterns",
          duration: "1.5 hours",
        },
        {
          id: 3,
          mentee: "Sarah Williams",
          menteeImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          sessionDate: "2024-02-05",
          topic: "Database Design",
          duration: "1 hour",
        },
      ]));
    }
  }, [dispatch, pendingFeedback.length]);

  const handleSubmitFeedback = () => {
    if (selectedSession) {
      dispatch(removePendingFeedback(selectedSession.id));
      alert("Feedback submitted successfully!");
      setFeedback("");
      setRating(5);
      setSelectedSession(null);
    }
  };

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
                Session Feedback & Ratings
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                Review and provide feedback for completed mentoring sessions
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Feedback List */}
              <div className="flex flex-col gap-4">
                <h2 className="text-white font-semibold text-lg">
                  Pending Feedback ({pendingFeedback.length})
                </h2>
                {pendingFeedback.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedSession?.id === session.id
                        ? "bg-[#161b22] border-[#1dc964]"
                        : "bg-[#161b22] border-[#30363d] hover:border-[#1dc964]"
                    }`}
                  >
                    <img
                      src={session.menteeImage}
                      alt={session.mentee}
                      className="w-10 h-10 rounded-full mb-2 border border-[#30363d]"
                    />
                    <h3 className="text-white font-semibold">
                      {session.mentee}
                    </h3>
                    <p className="text-[#9eb7a9] text-sm">{session.topic}</p>
                    <p className="text-[#9eb7a9] text-xs mt-1">
                      {session.sessionDate}
                    </p>
                  </div>
                ))}
              </div>

              {/* Feedback Form */}
              <div className="lg:col-span-2">
                {selectedSession ? (
                  <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl">
                    <h2 className="text-white font-bold text-xl mb-6">
                      Provide Feedback for {selectedSession.mentee}
                    </h2>

                    {/* Session Details */}
                    <div className="bg-[#0d1117] p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={selectedSession.menteeImage}
                          alt={selectedSession.mentee}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-white font-semibold">
                            {selectedSession.mentee}
                          </p>
                          <p className="text-[#9eb7a9] text-sm">
                            {selectedSession.topic}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-[#9eb7a9] text-sm">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            calendar_today
                          </span>
                          {selectedSession.sessionDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            timer
                          </span>
                          {selectedSession.duration}
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-3">
                        Rate this session
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="text-3xl transition-colors"
                          >
                            {star <= rating ? (
                              <span className="text-yellow-400">★</span>
                            ) : (
                              <span className="text-[#30363d]">★</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Text */}
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-3">
                        Additional Feedback (Optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your thoughts about this session..."
                        className="w-full p-4 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none resize-none"
                        rows="5"
                      ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleSubmitFeedback}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity flex-1"
                      >
                        <span className="material-symbols-outlined">send</span>
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => setSelectedSession(null)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#30363d] text-white font-bold rounded-lg hover:bg-[#404851] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl text-center">
                    <span className="material-symbols-outlined text-6xl text-[#9eb7a9] mb-4 inline-block">
                      rate_review
                    </span>
                    <p className="text-[#9eb7a9]">
                      Select a session from the list to provide feedback
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
