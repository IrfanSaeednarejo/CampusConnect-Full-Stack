import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyBookings,
  submitReviewThunk,
  selectMyBookings,
  selectMentoringActionLoading,
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";

export default function ReviewSession() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");
  
  const bookings = useSelector(selectMyBookings) || [];
  const actionLoading = useSelector(selectMentoringActionLoading);

  const [selectedBookingId, setSelectedBookingId] = useState(bookingIdParam || "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [detailedRatings, setDetailedRatings] = useState({
    communication: 5,
    expertise: 5,
    helpfulness: 5,
  });

  useEffect(() => {
    dispatch(fetchMyBookings({ sort: "-startAt", limit: 50 }));
  }, [dispatch]);

  // Mentee's completed sessions
  const completedSessions = bookings.filter(
    (b) => b.status === "completed" && b.mentorId && !b.reviewId
  );

  const selectedBooking = completedSessions.find(b => b._id === selectedBookingId);

  const handleSubmit = async () => {
    if (!selectedBooking) return toast.error("Please select a session to review.");
    if (!comment.trim()) return toast.error("Please provide a comment.");

    try {
      await dispatch(submitReviewThunk({
        mentorId: selectedBooking.mentorId._id,
        bookingId: selectedBooking._id,
        reviewData: {
          rating,
          comment: comment.trim(),
          isAnonymous,
          detailedRatings
        }
      })).unwrap();
      
      toast.success("Review submitted successfully!");
      navigate("/my-sessions");
    } catch (err) {
      toast.error(err || "Failed to submit review");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0d1117] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        
        {/* Header */}
        <div>
          <button onClick={() => navigate("/my-sessions")} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Sessions
          </button>
          <h1 className="text-2xl font-bold text-white">Review Mentoring Session</h1>
          <p className="text-slate-500 text-sm mt-1">Share your experience to help mentors improve and guide other students.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Sessions to review */}
          <div className="flex flex-col gap-3">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Sessions to Review</h2>
            {completedSessions.length > 0 ? (
              completedSessions.map((session) => {
                const mentor = session.mentorId?.userId;
                const mentorName = mentor?.profile?.displayName || `${mentor?.profile?.firstName || ""} ${mentor?.profile?.lastName || ""}`.trim() || "Mentor";
                const date = new Date(session.startAt);
                const isSelected = selectedBookingId === session._id;
                
                return (
                  <div
                    key={session._id}
                    onClick={() => setSelectedBookingId(session._id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected ? "bg-[#161b22] border-emerald-500/50" : "bg-[#161b22] border-[#30363d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {mentor?.profile?.avatar ? (
                        <img src={mentor.profile.avatar} alt="" className="w-10 h-10 rounded-full border border-[#30363d] object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#21262d] flex items-center justify-center text-slate-300 font-bold border border-[#30363d] shrink-0">
                          {mentorName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{mentorName}</p>
                        <p className="text-slate-500 text-[10px] truncate">{session.topic || "General Mentoring"}</p>
                        <p className="text-slate-600 text-[10px] mt-0.5">{date.toLocaleDateString()} • {session.duration}m</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[#30363d] bg-[#161b22]/50 text-center text-slate-500 text-sm">
                No unreviewed sessions found.
              </div>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {selectedBooking ? (
              <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl flex flex-col gap-6">
                
                {/* Overall Rating */}
                <div>
                  <label className="block text-white font-semibold text-lg mb-2">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span 
                          className={`material-symbols-outlined text-4xl ${star <= rating ? "text-yellow-400" : "text-slate-700"}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Ratings */}
                <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col gap-4">
                  <h3 className="text-white font-semibold text-sm">Detailed Ratings</h3>
                  {Object.entries(detailedRatings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm capitalize">{key}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setDetailedRatings(p => ({ ...p, [key]: star }))}
                            className="focus:outline-none"
                          >
                            <span 
                              className={`material-symbols-outlined text-xl ${star <= value ? "text-yellow-400" : "text-slate-700"}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-white font-semibold text-sm mb-2">Written Review <span className="text-red-400">*</span></label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What went well? What could be improved? Share your honest thoughts..."
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isAnonymous ? "bg-emerald-600" : "bg-slate-700"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAnonymous ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-slate-300 text-sm">Submit anonymously</span>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-[#30363d] flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={actionLoading || !comment.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-[#161b22] border border-dashed border-[#30363d] rounded-2xl text-center">
                <span className="material-symbols-outlined text-5xl text-slate-700 mb-3 block">rate_review</span>
                <p className="text-slate-400 font-semibold text-lg">Select a Session</p>
                <p className="text-slate-600 text-sm mt-1">Choose a completed session from the left to leave a review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
