import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyMentorProfile,
  fetchMentorReviews,
  respondToReviewThunk,
  selectMyMentorProfile,
  selectMentorReviews,
  selectMentoringLoading,
  selectReviewDistribution,
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";

function StarRating({ value, size = "sm", isDark }) {
  const sz = size === "sm" ? "text-[13px]" : "text-lg";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${sz} ${
            i <= Math.round(value) ? "text-yellow-400" : isDark ? "text-slate-700" : "text-slate-300"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </span>
  );
}

function RatingBar({ star, count, max, isDark }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-4 text-right">{star}</span>
      <span className="material-symbols-outlined text-yellow-400 text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        star
      </span>
      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs w-6 text-right ${isDark ? "text-slate-600" : "text-slate-400"}`}>{count}</span>
    </div>
  );
}

function ReviewCard({ review, mentorId, onRespond, isDark }) {
  const [responding, setResponding] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reviewer = review.menteeId;
  const name = review.isAnonymous
    ? "Anonymous"
    : reviewer?.profile?.displayName ||
      `${reviewer?.profile?.firstName || ""} ${reviewer?.profile?.lastName || ""}`.trim() ||
      "User";
  const initial = name[0]?.toUpperCase() || "?";

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return toast.error("Please write a response.");
    setSubmitting(true);
    try {
      await onRespond(mentorId, review._id, responseText.trim());
      setResponding(false);
      setResponseText("");
      toast.success("Response submitted!");
    } catch (err) {
      toast.error(err || "Failed to respond");
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass = isDark
    ? "bg-[#161b22] border-[#30363d]"
    : "bg-white border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.08)]";
  const nestedClass = isDark ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-200";

  return (
    <div className={`p-5 border rounded-xl ${cardClass}`}>
      <div className="flex items-start gap-3">
        {!review.isAnonymous && reviewer?.profile?.avatar ? (
          <img
            src={reviewer.profile.avatar}
            alt=""
            className={`w-10 h-10 rounded-full object-cover border shrink-0 ${isDark ? "border-[#30363d]" : "border-slate-200"}`}
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border ${
              isDark ? "bg-[#21262d] text-[#8b949e] border-[#30363d]" : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{name}</p>
            <StarRating value={review.rating} isDark={isDark} />
            <span className={`text-xs ml-auto ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>

          {review.comment && (
            <p className={`text-sm mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {review.comment}
            </p>
          )}

          {review.detailedRatings && (
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(review.detailedRatings)
                .filter(([, v]) => v)
                .map(([key, val]) => (
                  <span
                    key={key}
                    className={`text-[10px] px-2 py-0.5 rounded-full capitalize border ${
                      isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {key}: {val}/5
                  </span>
                ))}
            </div>
          )}

          {review.mentorResponse?.content && (
            <div className={`mt-3 p-3 border rounded-lg ${nestedClass}`}>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Your Response</p>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {review.mentorResponse.content}
              </p>
              {review.mentorResponse.respondedAt && (
                <p className={`text-[10px] mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {new Date(review.mentorResponse.respondedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {!review.mentorResponse?.content && !responding && (
            <button
              onClick={() => setResponding(true)}
              className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">reply</span>
              Respond to this review
            </button>
          )}

          {responding && (
            <div className="mt-3 flex flex-col gap-2">
              <textarea
                rows={3}
                maxLength={500}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write a thoughtful response to this review..."
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none ${
                  isDark
                    ? "bg-[#0d1117] border-[#30363d] text-white placeholder-slate-600"
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setResponding(false);
                    setResponseText("");
                  }}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={submitting || !responseText.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[14px]">send</span>
                  )}
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MentorReviewsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const reviews = useSelector(selectMentorReviews) || [];
  const loading = useSelector(selectMentoringLoading);
  const distribution = useSelector(selectReviewDistribution);

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
  }, [dispatch]);

  useEffect(() => {
    if (mentorProfile?._id) {
      dispatch(fetchMentorReviews({ mentorId: mentorProfile._id, params: { limit: 50 } }));
    }
  }, [dispatch, mentorProfile?._id]);

  const handleRespond = async (mentorId, reviewId, content) => {
    await dispatch(respondToReviewThunk({ mentorId, reviewId, content })).unwrap();
  };

  const totalReviews = reviews.length;
  const maxDistCount = Math.max(...Object.values(distribution || {}).map(Number), 1);
  const avgRating = mentorProfile?.averageRating || 0;
  const respondedCount = reviews.filter((r) => r.mentorResponse?.content).length;
  const pendingResponseCount = totalReviews - respondedCount;

  if (loading && !mentorProfile) {
    return (
      <div className={`flex h-full w-full items-center justify-center p-10 ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-y-auto ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-8">
        <div>
          <button
            onClick={() => navigate("/mentor/dashboard")}
            className={`flex items-center gap-2 text-sm transition-colors mb-4 ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </button>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>My Reviews</h1>
          <p className="text-slate-500 text-sm mt-1">See what mentees are saying and respond to their feedback.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 border rounded-xl ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Reviews</p>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{totalReviews}</p>
          </div>
          <div className={`p-4 border rounded-xl ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Avg Rating</p>
            <p className={`text-2xl font-bold flex items-center gap-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              {avgRating > 0 && (
                <span className="material-symbols-outlined text-yellow-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              )}
            </p>
          </div>
          <div className={`p-4 border rounded-xl ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Responded</p>
            <p className="text-2xl font-bold text-emerald-400">{respondedCount}</p>
          </div>
          <div className={`p-4 border rounded-xl ${isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 mb-1">Awaiting Reply</p>
            <p className="text-2xl font-bold text-amber-500">{pendingResponseCount}</p>
          </div>
        </div>

        {totalReviews > 0 && (
          <div className={`border rounded-2xl p-6 ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"}`}>
            <h2 className={`font-bold text-sm uppercase tracking-wider mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Rating Distribution</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <p className={`text-4xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{avgRating.toFixed(1)}</p>
                <StarRating value={avgRating} size="md" isDark={isDark} />
                <p className="text-xs text-slate-500 mt-1">
                  {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar key={star} star={star} count={distribution?.[star] || 0} max={maxDistCount} isDark={isDark} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className={`font-bold text-lg mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            All Reviews
            {pendingResponseCount > 0 && (
              <span className="ml-2 text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                {pendingResponseCount} need response
              </span>
            )}
          </h2>

          {reviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  mentorId={mentorProfile?._id}
                  onRespond={handleRespond}
                  isDark={isDark}
                />
              ))}
            </div>
          ) : (
            <div className={`border border-dashed rounded-2xl p-12 text-center ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-300"}`}>
              <span className={`material-symbols-outlined text-5xl mb-3 block ${isDark ? "text-slate-700" : "text-slate-300"}`}>rate_review</span>
              <p className={`font-semibold text-lg ${isDark ? "text-slate-400" : "text-slate-700"}`}>No reviews yet</p>
              <p className={`text-sm mt-1 ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                Complete sessions with mentees to start receiving reviews.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
