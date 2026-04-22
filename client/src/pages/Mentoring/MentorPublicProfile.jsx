import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentorById,
  fetchMentorReviews,
  fetchMentorAvailability,
  selectCurrentMentor,
  selectMentoringLoading,
  selectMentorReviews,
  selectMentorAvailability,
  selectReviewDistribution,
  clearCurrentMentor,
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  gold:   { label: "Gold",   cls: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/25", icon: "emoji_events" },
  silver: { label: "Silver", cls: "bg-slate-300/15 text-slate-300 border border-slate-400/25", icon: "workspace_premium" },
  bronze: { label: "Bronze", cls: "bg-orange-600/15 text-orange-300 border border-orange-500/25", icon: "military_tech" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StarRating({ value, size = "sm" }) {
  const sz = size === "sm" ? "text-[14px]" : "text-lg";
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

function StatCard({ icon, label, value, accent = false }) {
  return (
    <div className={`flex flex-col gap-1 p-4 rounded-xl border ${accent ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[#161b22] border-[#30363d]"}`}>
      <div className="flex items-center gap-2 text-[#8b949e]">
        <span className={`material-symbols-outlined text-base ${accent ? "text-emerald-400" : ""}`}>{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function RatingDistributionBar({ star, count, max }) {
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

function ReviewCard({ review }) {
  const reviewer = review.menteeId;
  const name = review.isAnonymous ? "Anonymous" : (reviewer?.profile?.displayName || `${reviewer?.profile?.firstName || ""} ${reviewer?.profile?.lastName || ""}`.trim() || "User");
  const initial = name[0]?.toUpperCase() || "?";

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
              {Object.entries(review.detailedRatings).filter(([,v]) => v).map(([key, val]) => (
                <span key={key} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full capitalize">
                  {key}: {val}/5
                </span>
              ))}
            </div>
          )}
          {/* Mentor response */}
          {review.mentorResponse?.content && (
            <div className="mt-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Mentor Response</p>
              <p className="text-xs text-slate-400 leading-relaxed">{review.mentorResponse.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MentorPublicProfile() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mentor = useSelector(selectCurrentMentor);
  const loading = useSelector(selectMentoringLoading);
  const reviews = useSelector(selectMentorReviews);
  const availabilityData = useSelector(selectMentorAvailability);
  const distribution = useSelector(selectReviewDistribution);
  const currentUser = useSelector(selectUser);

  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (mentorId) {
      dispatch(fetchMentorById(mentorId));
      dispatch(fetchMentorReviews({ mentorId, params: { limit: 20 } }));
      dispatch(fetchMentorAvailability({ id: mentorId, params: {} }));
    }
    return () => { dispatch(clearCurrentMentor()); };
  }, [dispatch, mentorId]);

  if (loading && !mentor) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0d1117] p-10">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#0d1117] text-white p-10">
        <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">person_off</span>
        <h2 className="text-2xl font-bold mb-2">Mentor Not Found</h2>
        <p className="text-slate-500 mb-6">This mentor profile does not exist or has been removed.</p>
        <button onClick={() => navigate("/mentors")} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors">
          Back to Mentors
        </button>
      </div>
    );
  }

  const profile = mentor.userId?.profile || {};
  const academic = mentor.userId?.academic || {};
  const displayName = profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Mentor";
  const avatar = profile.avatar;
  const initials = displayName.slice(0, 2).toUpperCase();
  const tierCfg = TIER_CONFIG[mentor.tier];
  const isFree = !mentor.hourlyRate || mentor.hourlyRate === 0;
  const isOwnProfile = currentUser?._id === mentor.userId?._id;

  // Availability grouping by day
  const availabilitySlots = availabilityData?.availability || mentor.availability || [];
  const availabilityByDay = {};
  availabilitySlots.forEach(slot => {
    if (!availabilityByDay[slot.day]) availabilityByDay[slot.day] = [];
    availabilityByDay[slot.day].push(slot);
  });

  // Reviews distribution
  const maxDistCount = Math.max(...Object.values(distribution || {}).map(Number), 1);
  const totalReviews = reviews?.length || 0;

  const TABS = [
    { id: "about", label: "About", icon: "person" },
    { id: "availability", label: "Availability", icon: "calendar_month" },
    { id: "reviews", label: `Reviews (${totalReviews})`, icon: "star" },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0d1117]">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0d1117 100%)" }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/mentors")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Mentors
          </button>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="shrink-0 relative">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-32 h-32 rounded-2xl object-cover border-4 border-[#161b22] shadow-2xl" />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-600 to-slate-700 flex items-center justify-center text-4xl font-bold text-white border-4 border-[#161b22] shadow-2xl">
                  {initials}
                </div>
              )}
              {tierCfg && (
                <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${tierCfg.cls} flex items-center gap-1`}>
                  <span className="material-symbols-outlined text-[12px]">{tierCfg.icon}</span>
                  {tierCfg.label}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{displayName}</h1>
                {mentor.verified && (
                  <span className="material-symbols-outlined text-emerald-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }} title="Verified Mentor">verified</span>
                )}
              </div>
              <p className="text-emerald-400 font-medium capitalize mt-1">{mentor.categories?.join(", ")} Mentor</p>
              {academic?.department && <p className="text-slate-500 text-sm mt-1">{academic.department} {academic.degree && `· ${academic.degree}`}</p>}

              {/* Rating row */}
              <div className="flex items-center gap-3 mt-3">
                {mentor.averageRating > 0 ? (
                  <>
                    <StarRating value={mentor.averageRating} size="md" />
                    <span className="text-slate-300 font-semibold">{mentor.averageRating.toFixed(1)}</span>
                    <span className="text-slate-600 text-sm">({totalReviews} reviews)</span>
                  </>
                ) : (
                  <span className="text-slate-600 text-sm">New Mentor — No reviews yet</span>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 mt-5">
                {!isOwnProfile && (
                  <button
                    onClick={() => navigate(`/mentor/book/${mentor._id}`)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <span className="material-symbols-outlined text-base">calendar_add_on</span>
                    Book Session
                  </button>
                )}
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{isFree ? "Free" : `${mentor.currency || "PKR"} ${mentor.hourlyRate}`}</p>
                  {!isFree && <p className="text-slate-600 text-[10px]">per hour</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <StatCard icon="groups" label="Sessions" value={mentor.totalSessions || 0} />
            <StatCard icon="star" label="Avg Rating" value={mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"} />
            <StatCard icon="calendar_clock" label="Slots" value={availabilitySlots.length > 0 ? `${availabilitySlots.length} active` : "Flexible"} />
            <StatCard icon="payments" label="Rate" value={isFree ? "Free" : `${mentor.currency || "PKR"} ${mentor.hourlyRate}/hr`} accent />
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8">
        <div className="flex border-b border-[#30363d] gap-6 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 pb-16">

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col gap-6">
              <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">person</span>
                  About
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {mentor.bio || "No professional biography provided yet."}
                </p>
              </section>
            </div>

            <div className="flex flex-col gap-6">
              <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500">code</span>
                  Expertise
                </h2>
                {mentor.expertise?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span key={skill} className="text-xs bg-slate-900/60 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm italic">No specific expertise listed.</p>
                )}
              </section>

              {mentor.categories?.length > 0 && (
                <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500">category</span>
                    Categories
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.categories.map((cat) => (
                      <span key={cat} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full capitalize font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">calendar_month</span>
              Weekly Availability
            </h2>
            <p className="text-slate-500 text-xs mb-6">These are the time slots when {profile.firstName || "this mentor"} is generally available for sessions.</p>

            <div className="space-y-3">
              {WEEKDAYS.map((dayLabel, idx) => {
                const slots = availabilityByDay[idx] || [];
                return (
                  <div key={idx} className="flex items-start gap-4 py-3 border-b border-[#21262d] last:border-0">
                    <span className={`text-sm font-semibold w-10 shrink-0 ${slots.length > 0 ? "text-white" : "text-slate-600"}`}>
                      {dayLabel}
                    </span>
                    {slots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot, i) => (
                          <span key={i} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg font-medium">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            {!isOwnProfile && (
              <button
                onClick={() => navigate(`/mentor/book/${mentor._id}`)}
                className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">calendar_add_on</span>
                Book a Session
              </button>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-6">
            {/* Distribution */}
            {totalReviews > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <p className="text-4xl font-bold text-white">{mentor.averageRating?.toFixed(1)}</p>
                    <StarRating value={mentor.averageRating} size="md" />
                    <p className="text-slate-500 text-xs mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <RatingDistributionBar key={star} star={star} count={distribution?.[star] || 0} max={maxDistCount} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews list */}
            {reviews?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-700 mb-3 block">rate_review</span>
                <p className="text-slate-400 font-semibold">No reviews yet</p>
                <p className="text-slate-600 text-sm mt-1">Be the first to book a session and leave a review!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
