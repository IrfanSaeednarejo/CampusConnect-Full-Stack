import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { toast } from "react-hot-toast";

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 p-5 rounded-2xl border transition-all ${onClick ? "cursor-pointer hover:border-slate-500" : ""} ${
        accent ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[#161b22] border-[#30363d]"
      }`}
    >
      <div className="flex items-center gap-2 text-[#8b949e]">
        <span className={`material-symbols-outlined text-lg ${accent ? "text-emerald-400" : ""}`}>{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function QuickAction({ icon, label, desc, to, navigate }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-4 p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-slate-500 hover:bg-[#161b22]/80 transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-[#21262d] flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors shrink-0">
        <span className="material-symbols-outlined text-[#8b949e] group-hover:text-emerald-400 transition-colors">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm">{label}</p>
        <p className="text-slate-600 text-xs truncate">{desc}</p>
      </div>
      <span className="material-symbols-outlined text-slate-700 ml-auto shrink-0 group-hover:text-slate-400 transition-colors">chevron_right</span>
    </button>
  );
}

function StarRating({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[13px] ${i <= Math.round(value) ? "text-yellow-400" : "text-slate-700"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >star</span>
      ))}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MentorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const bookings = useSelector(selectMyBookings) || [];
  const reviews = useSelector(selectMentorReviews) || [];
  const loading = useSelector(selectMentoringLoading);
  const currentUser = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
    dispatch(fetchMyBookings({ sort: "-startAt", limit: 100 }));
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
    } catch (err) { toast.error(err || "Failed to confirm"); }
  };

  const handleReject = async (bookingId) => {
    try {
      await dispatch(cancelBookingThunk({ id: bookingId, data: { reason: "Declined by mentor" } })).unwrap();
      toast.success("Request declined.");
      dispatch(fetchMyBookings({ sort: "-startAt", limit: 100 }));
    } catch (err) { toast.error(err || "Failed to decline"); }
  };

  // ── Loading state ──
  if (loading && !mentorProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0d1117] p-10">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Unverified / No Profile state ──
  if (!mentorProfile || !mentorProfile.verified) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8 text-center bg-[#0d1117]">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-amber-400 text-5xl">hourglass_top</span>
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">
          {mentorProfile ? "Application Under Review" : "Not a Mentor Yet"}
        </h2>
        <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">
          {mentorProfile
            ? "Your mentor application is currently being reviewed by campus administrators. You'll receive a notification once approved."
            : "You haven't registered as a mentor yet. Apply to start sharing your knowledge!"}
        </p>
        <button
          onClick={() => navigate(mentorProfile ? "/mentors" : "/mentor/register")}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {mentorProfile ? "Browse Mentors" : "Apply to Become a Mentor"}
        </button>
      </div>
    );
  }

  // ── Derived data ──
  const myBookingsAsMentor = bookings.filter(b => b.mentorId?.userId?._id === currentUser?._id);
  const pendingRequests = myBookingsAsMentor.filter(b => b.status === "pending");
  const upcomingSessions = myBookingsAsMentor.filter(b => b.status === "confirmed").slice(0, 3);
  const completedCount = myBookingsAsMentor.filter(b => b.status === "completed").length;
  const recentReviews = reviews.slice(0, 3);

  const profile = mentorProfile.userId?.profile || currentUser?.profile || {};
  const displayName = profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0d1117]">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Mentor Portal</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {profile.firstName || displayName}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage your mentoring sessions, profile, and earnings.</p>
          </div>
          <button
            onClick={() => navigate(`/mentors/${mentorProfile._id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] border border-[#30363d] text-slate-300 text-sm font-medium rounded-xl hover:border-slate-500 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            View Public Profile
          </button>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="groups" label="Total Sessions" value={mentorProfile.totalSessions || 0} />
          <StatCard icon="star" label="Avg Rating" value={mentorProfile.averageRating ? mentorProfile.averageRating.toFixed(1) : "New"} />
          <StatCard icon="pending_actions" label="Pending Requests" value={pendingRequests.length} onClick={() => document.getElementById("pending-section")?.scrollIntoView({ behavior: "smooth" })} />
          <StatCard icon="payments" label="Earnings" value={`${mentorProfile.currency || "PKR"} ${(mentorProfile.totalEarnings || 0).toFixed(0)}`} accent onClick={() => navigate("/mentor/earnings")} />
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-white font-bold text-lg mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickAction icon="edit" label="Edit Profile" desc="Update bio, skills & rate" to="/mentor/profile/edit" navigate={navigate} />
            <QuickAction icon="schedule" label="Manage Availability" desc="Set your weekly schedule" to="/mentor/availability" navigate={navigate} />
            <QuickAction icon="payments" label="View Earnings" desc="Track sessions & payouts" to="/mentor/earnings" navigate={navigate} />
            <QuickAction icon="calendar_month" label="All Sessions" desc="View session history" to="/my-sessions" navigate={navigate} />
            <QuickAction icon="star" label="My Reviews" desc="See what mentees say" to="/mentor/reviews" navigate={navigate} />
            <QuickAction icon="school" label="Browse Mentors" desc="See the public listing" to="/mentors" navigate={navigate} />
          </div>
        </div>

        {/* ── Pending Requests ── */}
        <div id="pending-section">
          <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {pendingRequests.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pendingRequests.map((booking) => {
                const mentee = booking.menteeId;
                const menteeName = mentee?.profile?.displayName || `${mentee?.profile?.firstName || "Unknown"} ${mentee?.profile?.lastName || ""}`.trim();
                const date = new Date(booking.startAt);
                return (
                  <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#161b22] border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      {mentee?.profile?.avatar ? (
                        <img src={mentee.profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#30363d] shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">{menteeName[0]}</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{menteeName}</p>
                        <p className="text-slate-500 text-xs">{booking.topic || "General Session"}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">calendar_today</span>{date.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">timer</span>{booking.duration}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const link = prompt("Provide a meeting link (Google Meet, Zoom, etc.):");
                          if (link) handleConfirm(booking._id, link);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>Accept
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="px-4 py-2 bg-transparent border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-[#161b22] border border-dashed border-[#30363d] rounded-xl text-center">
              <span className="material-symbols-outlined text-3xl text-slate-700 mb-2 block">inbox</span>
              <p className="text-slate-500 text-sm">No pending requests right now.</p>
            </div>
          )}
        </div>

        {/* ── Upcoming Sessions ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Upcoming Sessions</h2>
            <button onClick={() => navigate("/my-sessions")} className="text-emerald-400 text-xs font-semibold hover:underline">View All →</button>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcomingSessions.map((session) => {
                const mentee = session.menteeId;
                const menteeName = mentee?.profile?.displayName || `${mentee?.profile?.firstName || "Unknown"} ${mentee?.profile?.lastName || ""}`.trim();
                const date = new Date(session.startAt);
                return (
                  <div key={session._id} className="flex items-center justify-between gap-4 p-4 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-slate-500 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {mentee?.profile?.avatar ? (
                        <img src={mentee.profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#30363d] shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">{menteeName[0]}</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{menteeName}</p>
                        <p className="text-slate-500 text-xs">{session.topic || "General Session"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-white text-xs font-medium">{date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                        <p className="text-slate-500 text-[10px]">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/workspace/session/${session._id}`)}
                        className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-600/30 transition-colors"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-[#161b22] border border-dashed border-[#30363d] rounded-xl text-center">
              <span className="material-symbols-outlined text-3xl text-slate-700 mb-2 block">event_busy</span>
              <p className="text-slate-500 text-sm">No upcoming sessions scheduled.</p>
            </div>
          )}
        </div>

        {/* ── Recent Reviews ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Recent Reviews</h2>
            <button onClick={() => navigate("/mentor/reviews")} className="text-emerald-400 text-xs font-semibold hover:underline">View All →</button>
          </div>

          {recentReviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentReviews.map((review) => {
                const reviewer = review.menteeId;
                const name = review.isAnonymous ? "Anonymous" : (reviewer?.profile?.displayName || `${reviewer?.profile?.firstName || ""} ${reviewer?.profile?.lastName || ""}`.trim() || "User");
                return (
                  <div key={review._id} className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold text-sm">{name}</p>
                      <StarRating value={review.rating} />
                    </div>
                    {review.comment && <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{review.comment}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-[#161b22] border border-dashed border-[#30363d] rounded-xl text-center">
              <span className="material-symbols-outlined text-3xl text-slate-700 mb-2 block">rate_review</span>
              <p className="text-slate-500 text-sm">No reviews received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
