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
import useHomeTheme from "../../hooks/useHomeTheme";

export default function ReviewSession() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");
  const isDark = useHomeTheme();

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

  const completedSessions = bookings.filter(
    (booking) => booking.status === "completed" && booking.mentorId && !booking.reviewId
  );

  const selectedBooking = completedSessions.find((booking) => booking._id === selectedBookingId);

  const handleSubmit = async () => {
    if (!selectedBooking) return toast.error("Please select a session to review.");
    if (!comment.trim()) return toast.error("Please provide a comment.");

    try {
      await dispatch(
        submitReviewThunk({
          mentorId: selectedBooking.mentorId._id,
          bookingId: selectedBooking._id,
          reviewData: {
            rating,
            comment: comment.trim(),
            isAnonymous,
            detailedRatings,
          },
        })
      ).unwrap();

      toast.success("Review submitted successfully!");
      navigate("/my-sessions");
    } catch (err) {
      toast.error(err || "Failed to submit review");
    }
  };

  const pageClass = isDark ? "bg-[#0d1117] text-[#c9d1d9]" : "bg-slate-50 text-slate-900";
  const cardClass = isDark
    ? "border-[#30363d] bg-[#161b22]"
    : "border-slate-200 bg-white shadow-sm";
  const insetCardClass = isDark
    ? "border-[#30363d] bg-[#0d1117]"
    : "border-slate-200 bg-slate-50";
  const titleClass = isDark ? "text-white" : "text-slate-900";
  const bodyClass = isDark ? "text-slate-300" : "text-slate-700";
  const mutedClass = isDark ? "text-slate-500" : "text-slate-500";
  const faintClass = isDark ? "text-slate-600" : "text-slate-400";

  return (
    <div className={`flex h-full flex-col overflow-y-auto p-4 lg:p-8 ${pageClass}`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div>
          <button
            onClick={() => navigate("/my-sessions")}
            className={`mb-4 flex items-center gap-2 text-sm transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Sessions
          </button>
          <h1 className={`text-2xl font-bold ${titleClass}`}>Review Mentoring Session</h1>
          <p className={`mt-1 text-sm ${mutedClass}`}>
            Share your experience to help mentors improve and guide other students.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <h2 className={`mb-2 text-sm font-bold uppercase tracking-wider ${titleClass}`}>
              Sessions to Review
            </h2>
            {completedSessions.length > 0 ? (
              completedSessions.map((session) => {
                const mentor = session.mentorId?.userId;
                const mentorName =
                  mentor?.profile?.displayName ||
                  `${mentor?.profile?.firstName || ""} ${mentor?.profile?.lastName || ""}`.trim() ||
                  "Mentor";
                const date = new Date(session.startAt);
                const isSelected = selectedBookingId === session._id;

                return (
                  <div
                    key={session._id}
                    onClick={() => setSelectedBookingId(session._id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? isDark
                          ? "border-emerald-500/50 bg-[#161b22]"
                          : "border-emerald-300 bg-emerald-50"
                        : isDark
                          ? "border-[#30363d] bg-[#161b22] hover:border-slate-500"
                          : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {mentor?.profile?.avatar ? (
                        <img
                          src={mentor.profile.avatar}
                          alt=""
                          className={`h-10 w-10 shrink-0 rounded-full border object-cover ${
                            isDark ? "border-[#30363d]" : "border-slate-200"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-bold ${
                            isDark
                              ? "border-[#30363d] bg-[#21262d] text-slate-300"
                              : "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {mentorName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${titleClass}`}>{mentorName}</p>
                        <p className={`truncate text-[10px] ${mutedClass}`}>
                          {session.topic || "General Mentoring"}
                        </p>
                        <p className={`mt-0.5 text-[10px] ${faintClass}`}>
                          {date.toLocaleDateString()} • {session.duration}m
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className={`rounded-xl border border-dashed p-4 text-center text-sm ${
                  isDark
                    ? "border-[#30363d] bg-[#161b22]/50 text-slate-500"
                    : "border-slate-200 bg-white text-slate-500 shadow-sm"
                }`}
              >
                No unreviewed sessions found.
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedBooking ? (
              <div className={`flex flex-col gap-6 rounded-2xl border p-6 ${cardClass}`}>
                <div>
                  <label className={`mb-2 block text-lg font-semibold ${titleClass}`}>
                    Overall Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span
                          className={`material-symbols-outlined text-4xl ${
                            star <= rating ? "text-yellow-400" : "text-slate-400"
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`flex flex-col gap-4 rounded-xl border p-4 ${insetCardClass}`}>
                  <h3 className={`text-sm font-semibold ${titleClass}`}>Detailed Ratings</h3>
                  {Object.entries(detailedRatings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className={`text-sm capitalize ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {key}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() =>
                              setDetailedRatings((prev) => ({
                                ...prev,
                                [key]: star,
                              }))
                            }
                            className="focus:outline-none"
                          >
                            <span
                              className={`material-symbols-outlined text-xl ${
                                star <= value ? "text-yellow-400" : "text-slate-400"
                              }`}
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

                <div>
                  <label className={`mb-2 block text-sm font-semibold ${titleClass}`}>
                    Written Review <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What went well? What could be improved? Share your honest thoughts..."
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none ${
                      isDark
                        ? "border-[#30363d] bg-[#0d1117] text-white placeholder:text-slate-600"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative h-5 w-10 rounded-full transition-colors ${
                      isAnonymous ? "bg-emerald-600" : isDark ? "bg-slate-700" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        isAnonymous ? "translate-x-5.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${bodyClass}`}>Submit anonymously</span>
                </div>

                <div className={`flex justify-end border-t pt-4 ${isDark ? "border-[#30363d]" : "border-slate-200"}`}>
                  <button
                    onClick={handleSubmit}
                    disabled={actionLoading || !comment.trim()}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
              <div
                className={`rounded-2xl border border-dashed p-12 text-center ${
                  isDark
                    ? "border-[#30363d] bg-[#161b22]"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <span
                  className={`material-symbols-outlined mb-3 block text-5xl ${
                    isDark ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  rate_review
                </span>
                <p className={`text-lg font-semibold ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                  Select a Session
                </p>
                <p className={`mt-1 text-sm ${faintClass}`}>
                  Choose a completed session from the left to leave a review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
