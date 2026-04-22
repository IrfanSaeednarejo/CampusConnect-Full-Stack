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

// ── Sub-components ─────────────────────────────────────────────────────────────

function StarRating({ value, size = "sm" }) {
  const sz = size === "sm" ? "text-[13px]" : "text-lg";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${sz} ${i <= Math.round(value) ? "text-yellow-400" : "text-slate-700"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >star</span>
      ))}
    </span>
  );
}

function RatingBar({ star, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-4 text-right">{star}</span>
      <span className="material-symbols-outlined text-yellow-400 text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-600 w-6 text-right">{count}</span>
    </div>
  );
}

function ReviewCard({ review, mentorId, onRespond }) {
  const [responding, setResponding] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reviewer = review.menteeId;
  const name = review.isAnonymous
    ? "Anonymous"
    : (reviewer?.profile?.displayName || `${reviewer?.profile?.firstName || ""} ${reviewer?.profile?.lastName || ""}`.trim() || "User");
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

  return (
    <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
      <div className="flex items-start gap-3">
        {!review.isAnonymous && reviewer?.profile?.avatar ? (
          <img src={reviewer.profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#30363d] shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#21262d] flex items-center justify-center text-sm font-bold text-[#8b949e] shrink-0 border border-[#30363d]">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm">{name}</p>
            <StarRating value={review.rating} />
            <span className="text-slate-600 text-xs ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>

          {review.comment && (
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">{review.comment}</p>
          )}

          {/* Detailed ratings */}
          {review.detailedRatings && (
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(review.detailedRatings).filter(([, v]) => v).map(([key, val]) => (
                <span key={key} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full capitalize">
                  {key}: {val}/5
                </span>
              ))}
            </div>
          )}

          {/* Existing response */}
          {review.mentorResponse?.content && (
            <div className="mt-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Your Response</p>
              <p className="text-xs text-slate-400 leading-relaxed">{review.mentorResponse.content}</p>
              {review.mentorResponse.respondedAt && (
                <p className="text-[10px] text-slate-600 mt-1">{new Date(review.mentorResponse.respondedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {/* Respond button */}
          {!review.mentorResponse?.content && !responding && (
            <button
              onClick={() => setResponding(true)}
              className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">reply</span>
              Respond to this review
            </button>
          )}

          {/* Response form */}
          {responding && (
            <div className="mt-3 flex flex-col gap-2">
              <textarea
                rows={3}
                maxLength={500}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write a thoughtful response to this review…"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => { setResponding(false); setResponseText(""); }}
                  className="px-3 py-1.5 text-slate-500 text-xs font-medium hover:text-slate-300 transition-colors"
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

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MentorReviewsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const respondedCount = reviews.filter(r => r.mentorResponse?.content).length;
  const pendingResponseCount = totalReviews - respondedCount;

  if (loading && !mentorProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0d1117] p-10">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0d1117]">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* Header */}
        <div>
          <button onClick={() => navigate("/mentor/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">My Reviews</h1>
          <p className="text-slate-500 text-sm mt-1">See what mentees are saying and respond to their feedback.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-white">{totalReviews}</p>
          </div>
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-white flex items-center gap-1">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              {avgRating > 0 && <span className="material-symbols-outlined text-yellow-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
            </p>
          </div>
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Responded</p>
            <p className="text-2xl font-bold text-emerald-400">{respondedCount}</p>
          </div>
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">Awaiting Reply</p>
            <p className="text-2xl font-bold text-amber-400">{pendingResponseCount}</p>
          </div>
        </div>

        {/* Rating Distribution */}
        {totalReviews > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Rating Distribution</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <p className="text-4xl font-bold text-white">{avgRating.toFixed(1)}</p>
                <StarRating value={avgRating} size="md" />
                <p className="text-slate-500 text-xs mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar key={star} star={star} count={distribution?.[star] || 0} max={maxDistCount} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">
            All Reviews
            {pendingResponseCount > 0 && (
              <span className="ml-2 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
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
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-700 mb-3 block">rate_review</span>
              <p className="text-slate-400 font-semibold text-lg">No reviews yet</p>
              <p className="text-slate-600 text-sm mt-1">Complete sessions with mentees to start receiving reviews.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
