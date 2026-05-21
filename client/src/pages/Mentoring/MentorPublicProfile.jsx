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
import useHomeTheme from "../../hooks/useHomeTheme";

const TIER_CONFIG = {
  gold: {
    label: "Gold",
    dark: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/25",
    light: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: "emoji_events",
  },
  silver: {
    label: "Silver",
    dark: "bg-slate-300/15 text-slate-300 border border-slate-400/25",
    light: "bg-slate-100 text-slate-700 border border-slate-200",
    icon: "workspace_premium",
  },
  bronze: {
    label: "Bronze",
    dark: "bg-orange-600/15 text-orange-300 border border-orange-500/25",
    light: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: "military_tech",
  },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StarRating({ value, size = "sm", isDark }) {
  const sz = size === "sm" ? "text-[14px]" : "text-lg";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${sz} ${
            i <= Math.round(value)
              ? "text-yellow-400"
              : isDark
                ? "text-slate-700"
                : "text-slate-300"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </span>
  );
}

function StatCard({ icon, label, value, accent = false, isDark }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border p-4 ${
        accent
          ? isDark
            ? "border-primary/20 bg-primary/10"
            : "border-primary/20 bg-primary/5"
          : isDark
            ? "border-border-dark bg-surface-dark"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className={`flex items-center gap-2 ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>
        <span
          className={`material-symbols-outlined text-base ${
            accent ? "text-primary" : ""
          }`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p
        className={`text-xl font-bold ${
          accent
            ? "text-primary"
            : isDark
              ? "text-white"
              : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function RatingDistributionBar({ star, count, max, isDark }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 text-right text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>{star}</span>
      <span
        className="material-symbols-outlined text-[12px] text-yellow-400"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        star
      </span>
      <div className={`h-2 flex-1 overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
        <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-6 text-right text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>{count}</span>
    </div>
  );
}

function ReviewCard({ review, isDark }) {
  const reviewer = review.menteeId;
  const name =
    review.isAnonymous
      ? "Anonymous"
      : reviewer?.profile?.displayName ||
        `${reviewer?.profile?.firstName || ""} ${reviewer?.profile?.lastName || ""}`.trim() ||
        "User";
  const initial = name[0]?.toUpperCase() || "?";

  return (
    <div className={`rounded-xl border p-5 ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        {!review.isAnonymous && reviewer?.profile?.avatar ? (
          <img
            src={reviewer.profile.avatar}
            alt=""
            className={`h-10 w-10 shrink-0 rounded-full border object-cover ${isDark ? "border-border-dark" : "border-slate-200"}`}
          />
        ) : (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
              isDark
                ? "border-border-dark bg-container-dark text-text-secondary-dark"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{name}</p>
            <StarRating value={review.rating} isDark={isDark} />
            <span className={`ml-auto text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {review.comment && (
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {review.comment}
            </p>
          )}
          {review.detailedRatings && (
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(review.detailedRatings)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-400"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {key}: {value}/5
                  </span>
                ))}
            </div>
          )}
          {review.mentorResponse?.content && (
            <div
              className={`mt-3 rounded-lg border p-3 ${
                isDark ? "border-border-dark bg-background-dark" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-info">
                Mentor Response
              </p>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {review.mentorResponse.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const isDark = useHomeTheme();

  useEffect(() => {
    if (mentorId) {
      dispatch(fetchMentorById(mentorId));
      dispatch(fetchMentorReviews({ mentorId, params: { limit: 20 } }));
      dispatch(fetchMentorAvailability({ id: mentorId, params: {} }));
    }
    return () => {
      dispatch(clearCurrentMentor());
    };
  }, [dispatch, mentorId]);

  if (loading && !mentor) {
    return (
      <div className={`flex h-full w-full items-center justify-center p-10 ${isDark ? "bg-background-dark" : "bg-slate-50"}`}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center p-10 ${
          isDark ? "bg-background-dark text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <span className={`material-symbols-outlined mb-4 text-6xl ${isDark ? "text-slate-600" : "text-slate-300"}`}>
          person_off
        </span>
        <h2 className="mb-2 text-2xl font-bold">Mentor Not Found</h2>
        <p className={`mb-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          This mentor profile does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/mentors")}
          className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
            isDark
              ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Back to Mentors
        </button>
      </div>
    );
  }

  const profile = mentor.userId?.profile || {};
  const academic = mentor.userId?.academic || {};
  const displayName =
    profile.displayName ||
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
    "Mentor";
  const avatar = profile.avatar;
  const initials = displayName.slice(0, 2).toUpperCase();
  const tierCfg = TIER_CONFIG[mentor.tier];
  const isFree = !mentor.hourlyRate || mentor.hourlyRate === 0;
  const isOwnProfile = currentUser?._id === mentor.userId?._id;

  const availabilitySlots = availabilityData?.availability || mentor.availability || [];
  const availabilityByDay = {};
  availabilitySlots.forEach((slot) => {
    if (!availabilityByDay[slot.day]) availabilityByDay[slot.day] = [];
    availabilityByDay[slot.day].push(slot);
  });

  const maxDistCount = Math.max(...Object.values(distribution || {}).map(Number), 1);
  const totalReviews = reviews?.length || 0;

  const TABS = [
    { id: "about", label: "About", icon: "person" },
    { id: "availability", label: "Availability", icon: "calendar_month" },
    { id: "reviews", label: `Reviews (${totalReviews})`, icon: "star" },
  ];

  return (
    <div className={`flex h-full flex-col overflow-y-auto ${isDark ? "bg-background-dark" : "bg-slate-50"}`}>
      <div className={`${isDark ? "border-b border-border-dark bg-background-dark" : "border-b border-slate-200 bg-white"}`}>
        <div className="mx-auto max-w-5xl px-4 pb-6 pt-8 sm:px-8">
          <button
            onClick={() => navigate("/mentors")}
            className={`mb-6 flex items-center gap-2 text-sm transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Mentors
          </button>

          <div className="flex flex-col items-start gap-6 md:flex-row">
            <div className="relative shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className={`h-32 w-32 rounded-2xl object-cover border-4 shadow-2xl ${
                    isDark ? "border-border-dark" : "border-white"
                  }`}
                />
              ) : (
                <div
                  className={`flex h-32 w-32 items-center justify-center rounded-2xl border-4 text-4xl font-bold text-white shadow-2xl ${
                    isDark
                      ? "border-border-dark bg-primary"
                      : "border-white bg-info"
                  }`}
                >
                  {initials}
                </div>
              )}
              {tierCfg && (
                <div
                  className={`absolute -bottom-2 -right-2 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${
                    isDark ? tierCfg.dark : tierCfg.light
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">{tierCfg.icon}</span>
                  {tierCfg.label}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                  {displayName}
                </h1>
                {mentor.verified && (
                  <span
                    className="material-symbols-outlined text-xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Mentor"
                  >
                    verified
                  </span>
                )}
              </div>
              <p className={`mt-1 font-medium capitalize ${isDark ? "text-primary" : "text-primary"}`}>
                {mentor.categories?.join(", ")} Mentor
              </p>
              {profile.headline && (
                <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {profile.headline}
                </p>
              )}
              <div className={`mt-1 flex flex-wrap items-center gap-2 text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {profile.location}
                  </span>
                )}
                {academic?.department && (
                  <span>
                    {academic.department}
                    {academic.degree && ` • ${academic.degree}`}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {mentor.averageRating > 0 ? (
                  <>
                    <StarRating value={mentor.averageRating} size="md" isDark={isDark} />
                    <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {mentor.averageRating.toFixed(1)}
                    </span>
                    <span className={`text-sm ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                      ({totalReviews} reviews)
                    </span>
                  </>
                ) : (
                  <span className={`text-sm ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                    New Mentor — No reviews yet
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3">
                {!isOwnProfile && (
                  <button
                    onClick={() => navigate(`/mentor/book/${mentor._id}`)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-primary-hover"
                  >
                    <span className="material-symbols-outlined text-base">calendar_add_on</span>
                    Book Session
                  </button>
                )}
                <div className="text-right">
                  <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {isFree ? "Free" : `${mentor.currency || "PKR"} ${mentor.hourlyRate}`}
                  </p>
                  {!isFree && (
                    <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                      per hour
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard icon="groups" label="Sessions" value={mentor.totalSessions || 0} isDark={isDark} />
            <StatCard
              icon="star"
              label="Avg Rating"
              value={mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"}
              isDark={isDark}
            />
            <StatCard
              icon="calendar_clock"
              label="Slots"
              value={availabilitySlots.length > 0 ? `${availabilitySlots.length} active` : "Flexible"}
              isDark={isDark}
            />
            <StatCard
              icon="payments"
              label="Rate"
              value={isFree ? "Free" : `${mentor.currency || "PKR"} ${mentor.hourlyRate}/hr`}
              accent
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">
        <div className={`mt-4 flex gap-6 border-b ${isDark ? "border-border-dark" : "border-slate-200"}`}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? isDark
                    ? "border-primary text-white"
                    : "border-primary text-slate-900"
                  : isDark
                    ? "border-transparent text-slate-500 hover:text-slate-300"
                    : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-8">
        {activeTab === "about" && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-6 md:col-span-2">
              <section className={`rounded-2xl border p-6 ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
                <h2 className={`mb-3 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  <span className={`material-symbols-outlined ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    person
                  </span>
                  About
                </h2>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {mentor.bio || "No professional biography provided yet."}
                </p>
              </section>
            </div>

            <div className="flex flex-col gap-6">
              <section className={`rounded-2xl border p-6 ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
                <h2 className={`mb-3 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  <span className={`material-symbols-outlined ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    code
                  </span>
                  Expertise
                </h2>
                {mentor.expertise?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          isDark
                            ? "border-slate-700 bg-slate-900/60 text-slate-400"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm italic ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                    No specific expertise listed.
                  </p>
                )}
              </section>

              {mentor.categories?.length > 0 && (
                <section className={`rounded-2xl border p-6 ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
                  <h2 className={`mb-3 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    <span className={`material-symbols-outlined ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      category
                    </span>
                    Categories
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                          isDark
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-primary/20 bg-primary/10 text-primary"
                        }`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {activeTab === "availability" && (
          <div className={`rounded-2xl border p-6 ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
            <h2 className={`mb-4 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              <span className={`material-symbols-outlined ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                calendar_month
              </span>
              Weekly Availability
            </h2>
            <p className={`mb-6 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              These are the time slots when {profile.firstName || "this mentor"} is generally available for sessions.
            </p>

            <div className="space-y-3">
              {WEEKDAYS.map((dayLabel, idx) => {
                const slots = availabilityByDay[idx] || [];
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 border-b py-3 last:border-0 ${
                      isDark ? "border-border-dark" : "border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-10 shrink-0 text-sm font-semibold ${
                        slots.length > 0
                          ? isDark
                            ? "text-white"
                            : "text-slate-900"
                          : isDark
                            ? "text-slate-600"
                            : "text-slate-400"
                      }`}
                    >
                      {dayLabel}
                    </span>
                    {slots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot, i) => (
                          <span
                            key={i}
                            className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                              isDark
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-primary/20 bg-primary/10 text-primary"
                            }`}
                          >
                            {slot.startTime} – {slot.endTime}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs italic ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                        Unavailable
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {!isOwnProfile && (
              <button
                onClick={() => navigate(`/mentor/book/${mentor._id}`)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover"
              >
                <span className="material-symbols-outlined text-base">calendar_add_on</span>
                Book a Session
              </button>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="flex flex-col gap-6">
            {totalReviews > 0 && (
              <div className={`rounded-2xl border p-6 ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
                <div className="flex flex-col items-start gap-6 md:flex-row">
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <p className={`text-4xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {mentor.averageRating?.toFixed(1)}
                    </p>
                    <StarRating value={mentor.averageRating} size="md" isDark={isDark} />
                    <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex min-w-[200px] flex-1 flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <RatingDistributionBar
                        key={star}
                        star={star}
                        count={distribution?.[star] || 0}
                        max={maxDistCount}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reviews?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} isDark={isDark} />
                ))}
              </div>
            ) : (
              <div className={`rounded-2xl border p-12 text-center ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
                <span className={`material-symbols-outlined mb-3 block text-5xl ${isDark ? "text-slate-700" : "text-slate-300"}`}>
                  rate_review
                </span>
                <p className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-700"}`}>No reviews yet</p>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                  Be the first to book a session and leave a review!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
