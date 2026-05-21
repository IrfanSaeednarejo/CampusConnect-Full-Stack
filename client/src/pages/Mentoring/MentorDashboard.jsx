import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  fetchMyMentorProfile,
  fetchMyBookings,
  fetchMentorReviews,
  selectMyMentorProfile,
  selectMyBookings,
  selectMentorReviews,
  selectMentoringLoading,
  confirmBookingThunk,
  cancelBookingThunk,
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import useHomeTheme from "../../hooks/useHomeTheme";
import {
  fetchGamificationBadges,
  fetchGamificationProgress,
  fetchGamificationSummary,
  selectGamificationBadges,
  selectGamificationProgress,
  selectGamificationSummary,
} from "../../redux/slices/gamificationSlice";
import BadgeGrid from "../../components/gamification/BadgeGrid";
import LevelProgressBar from "../../components/gamification/LevelProgressBar";
import PointsCard from "../../components/gamification/PointsCard";

function StatCard({ icon, label, value, accent, onClick, isDark }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-2xl border p-5 transition-all ${
        onClick ? "cursor-pointer hover:border-slate-400/50" : ""
      } ${
        accent
          ? isDark
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-emerald-200 bg-emerald-50"
          : isDark
            ? "border-[#30363d] bg-[#161b22]"
            : "border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className={`flex items-center gap-2 ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
        <span
          className={`material-symbols-outlined text-lg ${
            accent ? (isDark ? "text-emerald-400" : "text-emerald-600") : ""
          }`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p
        className={`text-2xl font-bold ${
          accent
            ? isDark
              ? "text-emerald-400"
              : "text-emerald-600"
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

function QuickAction({ icon, label, desc, to, navigate, isDark }) {
  return (
    <button
      onClick={() => navigate(to)}
      className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
        isDark
          ? "border-[#30363d] bg-[#161b22] hover:border-slate-500 hover:bg-[#161b22]/80"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          isDark
            ? "bg-[#21262d] group-hover:bg-emerald-500/10"
            : "bg-slate-100 group-hover:bg-emerald-50"
        }`}
      >
        <span
          className={`material-symbols-outlined transition-colors ${
            isDark
              ? "text-[#8b949e] group-hover:text-emerald-400"
              : "text-slate-500 group-hover:text-emerald-600"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{label}</p>
        <p className={`truncate text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>{desc}</p>
      </div>
      <span
        className={`material-symbols-outlined ml-auto shrink-0 transition-colors ${
          isDark
            ? "text-slate-700 group-hover:text-slate-400"
            : "text-slate-300 group-hover:text-slate-500"
        }`}
      >
        chevron_right
      </span>
    </button>
  );
}

function StarRating({ value, isDark }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[13px] ${
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

export default function MentorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const bookings = useSelector(selectMyBookings) || [];
  const reviews = useSelector(selectMentorReviews) || [];
  const loading = useSelector(selectMentoringLoading);
  const currentUser = useSelector(selectUser);
  const isDark = useHomeTheme();
  const gamificationSummary = useSelector(selectGamificationSummary);
  const gamificationProgress = useSelector(selectGamificationProgress);
  const gamificationBadges = useSelector(selectGamificationBadges);

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
    dispatch(fetchMyBookings({ sort: "-startAt", limit: 100 }));
    dispatch(fetchGamificationSummary());
    dispatch(fetchGamificationProgress());
    dispatch(fetchGamificationBadges());
  }, [dispatch]);

  useEffect(() => {
    if (mentorProfile?._id) {
      dispatch(fetchMentorReviews({ mentorId: mentorProfile._id, params: { limit: 5 } }));
    }
  }, [dispatch, mentorProfile?._id]);

  const handleConfirm = async (bookingId, meetingLink) => {
    try {
      await dispatch(confirmBookingThunk({ id: bookingId, data: { meetingLink } })).unwrap();
      toast.success("Session confirmed!");
      dispatch(fetchMyBookings({ sort: "-startAt", limit: 100 }));
    } catch (err) {
      toast.error(err || "Failed to confirm");
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await dispatch(
        cancelBookingThunk({ id: bookingId, data: { reason: "Declined by mentor" } })
      ).unwrap();
      toast.success("Request declined.");
      dispatch(fetchMyBookings({ sort: "-startAt", limit: 100 }));
    } catch (err) {
      toast.error(err || "Failed to decline");
    }
  };

  if (loading && !mentorProfile) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center p-10 ${
          isDark ? "bg-[#0d1117]" : "bg-slate-50"
        }`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!mentorProfile || !mentorProfile.verified) {
    return (
      <div
        className={`flex h-full min-h-[500px] flex-col items-center justify-center p-8 text-center ${
          isDark ? "bg-[#0d1117]" : "bg-slate-50"
        }`}
      >
        <div
          className={`mb-5 flex h-20 w-20 items-center justify-center rounded-2xl ${
            isDark ? "bg-amber-500/10" : "bg-amber-50"
          }`}
        >
          <span className="material-symbols-outlined text-5xl text-amber-400">hourglass_top</span>
        </div>
        <h2 className={`mb-2 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          {mentorProfile ? "Application Under Review" : "Not a Mentor Yet"}
        </h2>
        <p className={`mb-6 max-w-md text-sm leading-relaxed ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          {mentorProfile
            ? "Your mentor application is currently being reviewed by campus administrators. You'll receive a notification once approved."
            : "You haven't registered as a mentor yet. Apply to start sharing your knowledge!"}
        </p>
        <button
          onClick={() => navigate(mentorProfile ? "/mentors" : "/mentor/register")}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
        >
          {mentorProfile ? "Browse Mentors" : "Apply to Become a Mentor"}
        </button>
      </div>
    );
  }

  const myBookingsAsMentor = bookings.filter(
    (booking) => booking.mentorId?.userId?._id === currentUser?._id
  );
  const pendingRequests = myBookingsAsMentor.filter((booking) => booking.status === "pending");
  const upcomingSessions = myBookingsAsMentor.filter((booking) => booking.status === "confirmed").slice(0, 3);
  const recentReviews = reviews.slice(0, 3);

  const profile = mentorProfile.userId?.profile || currentUser?.profile || {};
  const displayName =
    profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  return (
    <div className={`flex h-full flex-col overflow-y-auto ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
              Mentor Portal
            </p>
            <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
              Welcome back, {profile.firstName || displayName}
            </h1>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Manage your mentoring sessions, profile, and earnings.
            </p>
          </div>
          <button
            onClick={() => navigate(`/mentors/${mentorProfile._id}`)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              isDark
                ? "border-[#30363d] bg-[#21262d] text-slate-300 hover:border-slate-500"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            View Public Profile
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="groups"
            label="Total Sessions"
            value={mentorProfile.totalSessions || 0}
            isDark={isDark}
          />
          <StatCard
            icon="star"
            label="Avg Rating"
            value={mentorProfile.averageRating ? mentorProfile.averageRating.toFixed(1) : "New"}
            isDark={isDark}
          />
          <StatCard
            icon="pending_actions"
            label="Pending Requests"
            value={pendingRequests.length}
            onClick={() =>
              document.getElementById("pending-section")?.scrollIntoView({ behavior: "smooth" })
            }
            isDark={isDark}
          />
          <StatCard
            icon="payments"
            label="Earnings"
            value={`${mentorProfile.currency || "PKR"} ${(mentorProfile.totalEarnings || 0).toFixed(0)}`}
            accent
            onClick={() => navigate("/mentor/earnings")}
            isDark={isDark}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <PointsCard summary={gamificationSummary} />
          <LevelProgressBar summary={gamificationSummary} progress={gamificationProgress} />
          <BadgeGrid badges={gamificationBadges} compact title="Mentor Badges" />
        </div>

        <div>
          <h2 className={`mb-3 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction icon="edit" label="Edit Profile" desc="Update bio, skills & rate" to="/mentor/profile/edit" navigate={navigate} isDark={isDark} />
            <QuickAction icon="schedule" label="Manage Availability" desc="Set your weekly schedule" to="/mentor/availability" navigate={navigate} isDark={isDark} />
            <QuickAction icon="payments" label="View Earnings" desc="Track sessions & payouts" to="/mentor/earnings" navigate={navigate} isDark={isDark} />
            <QuickAction icon="calendar_month" label="All Sessions" desc="View session history" to="/my-sessions" navigate={navigate} isDark={isDark} />
            <QuickAction icon="star" label="My Reviews" desc="See what mentees say" to="/mentor/reviews" navigate={navigate} isDark={isDark} />
            <QuickAction icon="school" label="Browse Mentors" desc="See the public listing" to="/mentors" navigate={navigate} isDark={isDark} />
          </div>
        </div>

        <div id="pending-section">
          <h2 className={`mb-3 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Pending Requests
            {pendingRequests.length > 0 && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  isDark
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {pendingRequests.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pendingRequests.map((booking) => {
                const mentee = booking.menteeId;
                const menteeName =
                  mentee?.profile?.displayName ||
                  `${mentee?.profile?.firstName || "Unknown"} ${mentee?.profile?.lastName || ""}`.trim();
                const date = new Date(booking.startAt);
                return (
                  <div
                    key={booking._id}
                    className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                      isDark
                        ? "border-amber-500/20 bg-[#161b22]"
                        : "border-amber-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {mentee?.profile?.avatar ? (
                        <img
                          src={mentee.profile.avatar}
                          alt=""
                          className={`h-10 w-10 shrink-0 rounded-full object-cover border ${
                            isDark ? "border-[#30363d]" : "border-slate-200"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {menteeName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {menteeName}
                        </p>
                        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                          {booking.topic || "General Session"}
                        </p>
                        <div className={`mt-1 flex flex-wrap items-center gap-2 text-[10px] ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {date.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">timer</span>
                            {booking.duration}m
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const link = prompt("Provide a meeting link (Google Meet, Zoom, etc.):");
                          if (link) handleConfirm(booking._id, link);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold transition-colors ${
                          isDark
                            ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                            : "border-rose-200 text-rose-700 hover:bg-rose-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`rounded-xl border border-dashed p-6 text-center ${
                isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white"
              }`}
            >
              <span className={`material-symbols-outlined mb-2 block text-3xl ${isDark ? "text-slate-700" : "text-slate-300"}`}>
                inbox
              </span>
              <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                No pending requests right now.
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Upcoming Sessions</h2>
            <button
              onClick={() => navigate("/my-sessions")}
              className={`text-xs font-semibold hover:underline ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              View All →
            </button>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcomingSessions.map((session) => {
                const mentee = session.menteeId;
                const menteeName =
                  mentee?.profile?.displayName ||
                  `${mentee?.profile?.firstName || "Unknown"} ${mentee?.profile?.lastName || ""}`.trim();
                const date = new Date(session.startAt);
                return (
                  <div
                    key={session._id}
                    className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                      isDark
                        ? "border-[#30363d] bg-[#161b22] hover:border-slate-500"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {mentee?.profile?.avatar ? (
                        <img
                          src={mentee.profile.avatar}
                          alt=""
                          className={`h-10 w-10 shrink-0 rounded-full object-cover border ${
                            isDark ? "border-[#30363d]" : "border-slate-200"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {menteeName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {menteeName}
                        </p>
                        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                          {session.topic || "General Session"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="hidden text-right sm:block">
                        <p className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          {date.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/workspace/session/${session._id}`)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                          isDark
                            ? "border-emerald-500/20 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`rounded-xl border border-dashed p-6 text-center ${
                isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white"
              }`}
            >
              <span className={`material-symbols-outlined mb-2 block text-3xl ${isDark ? "text-slate-700" : "text-slate-300"}`}>
                event_busy
              </span>
              <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                No upcoming sessions scheduled.
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Reviews</h2>
            <button
              onClick={() => navigate("/mentor/reviews")}
              className={`text-xs font-semibold hover:underline ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              View All →
            </button>
          </div>

          {recentReviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentReviews.map((review) => {
                const reviewer = review.menteeId;
                const name =
                  review.isAnonymous
                    ? "Anonymous"
                    : reviewer?.profile?.displayName ||
                      `${reviewer?.profile?.firstName || ""} ${reviewer?.profile?.lastName || ""}`.trim() ||
                      "User";
                return (
                  <div
                    key={review._id}
                    className={`rounded-xl border p-4 ${
                      isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {name}
                      </p>
                      <StarRating value={review.rating} isDark={isDark} />
                    </div>
                    {review.comment && (
                      <p className={`text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`rounded-xl border border-dashed p-6 text-center ${
                isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white"
              }`}
            >
              <span className={`material-symbols-outlined mb-2 block text-3xl ${isDark ? "text-slate-700" : "text-slate-300"}`}>
                rate_review
              </span>
              <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                No reviews received yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
