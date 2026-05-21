import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Outlet, NavLink, useLocation, useOutlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventById,
  selectSelectedEvent,
  selectEventLoading,
  selectEventError,
  selectEventActionLoading,
  submitEventFeedbackThunk,
} from "../../../redux/slices/eventSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import EventStatusBadge from "../../../components/events/Shared/EventStatusBadge";
import { selectUser } from "../../../redux/slices/authSlice";
import EnrollmentCTA from "../../../components/events/Detail/EnrollmentCTA";
import useEventSocket from "../../../hooks/useEventSocket";
import useHomeTheme from "@/hooks/useHomeTheme";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import { toast } from "react-hot-toast";
import OverviewTab from "../../../components/events/Detail/OverviewTab";

export default function EventDetailLayout() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useHomeTheme();
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });

  const event = useSelector(selectSelectedEvent);
  const loading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const actionLoading = useSelector(selectEventActionLoading);
  const user = useSelector(selectUser);
  const outlet = useOutlet();

  useEventSocket(id);

  useEffect(() => {
    if (id) dispatch(fetchEventById(id));
  }, [dispatch, id]);

  if (loading && !event) {
    return <div className={`h-screen flex justify-center items-center ${isDark ? "bg-background-dark" : "bg-background-light"}`}><CircularProgress /></div>;
  }
  if (!event && !loading) {
    return <div className={`h-screen flex justify-center items-center ${isDark ? "bg-background-dark text-text-secondary-dark" : "bg-background-light text-text-secondary-light"}`}>{error || "Event Not Found"}</div>;
  }

  const isCreator = user?._id === event.createdBy?._id || user?.id === event.createdBy;
  const isAdmin = user?.roles?.includes("admin");
  const isJudge = event?.judgingConfig?.judges?.some((j) => (j._id || j) === user?._id);
  const userRegistration = event?.registrations?.find((r) => r.userId === user?._id || r.userId?._id === user?._id);
  const isRegistered = !!userRegistration;
  const isApproved = userRegistration?.status === "approved";
  const isAttended = userRegistration?.status === "attended";
  const isManagementRoute =
    location.pathname.endsWith("/manage") || location.pathname.endsWith("/edit") || location.pathname.endsWith("/judging");
  const myFeedback = useMemo(
    () => event?.feedback?.find((entry) => entry.userId === user?._id || entry.userId?._id === user?._id),
    [event?.feedback, user?._id]
  );
  const canSubmitFeedback = !!user && isAttended && !myFeedback;

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        submitEventFeedbackThunk({
          eventId: event._id,
          payload: {
            rating: Number(feedbackForm.rating),
            comment: feedbackForm.comment,
          },
        })
      ).unwrap();
      toast.success("Feedback submitted");
      setFeedbackForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err || "Failed to submit feedback");
    }
  };

  return (
    <div className={`min-h-screen selection:bg-primary/20 ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
      {!isManagementRoute && (
        <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden group">
          {event.coverImage ? (
            <div className="absolute inset-0">
              <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 ${isDark ? "bg-black/40 backdrop-blur-[2px]" : "bg-white/20 backdrop-blur-[2px]"}`}></div>
            </div>
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${isDark ? "bg-surface-dark" : "bg-surface-muted"}`}>
              <span className={`material-symbols-outlined text-[120px] animate-pulse ${isDark ? "text-border-dark" : "text-border-light"}`}>landscape</span>
            </div>
          )}

          <div className={`absolute inset-0 ${isDark ? "bg-background-dark/70" : "bg-background-light/45"}`}></div>

          <div className="absolute bottom-0 w-full px-4 sm:px-10 lg:px-20 pb-12">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <EventStatusBadge status={event.status} isDark={isDark} />
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isDark ? "bg-white/10 text-white border-white/10" : "bg-white/80 text-slate-700 border-slate-200"}`}>
                    {event.category}
                  </span>
                </div>
                <h1 className={`text-4xl md:text-6xl font-black tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {event.title}
                </h1>
                <div className={`flex flex-wrap items-center gap-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                  <p className="flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                    {event.venue?.type === "online" ? "Global Online Access" : event.venue?.address}
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-success text-xl">schedule</span>
                    {new Date(event.startAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 ${!isManagementRoute ? "-mt-10 pb-20" : "py-6"} relative z-20`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className={`${isManagementRoute ? "lg:col-span-12" : "lg:col-span-8"} space-y-6`}>
            <div className={`p-1.5 border rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar sticky top-2 z-30 ${
              isDark ? "bg-surface-dark/90 backdrop-blur-2xl border-border-dark shadow-lg" : "bg-surface-light/90 backdrop-blur-2xl border-border-light shadow-md"
            }`}>
              {[
                ["", "dashboard", "Overview"],
                ["teams", "groups", "Roster"],
                ["leaderboard", "trophy", "Leaderboard"],
              ].map(([to, icon, label]) => (
                <NavLink
                  key={label}
                  end={!to}
                  to={to}
                  className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : isDark
                        ? "text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5"
                        : "text-text-secondary-light hover:text-text-primary-light hover:bg-surface-muted"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                  {label}
                </NavLink>
              ))}

              {isApproved && (event.participationType === "team" || event.participationType === "both") && (
                <NavLink
                  to="my-team"
                  className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : isDark
                        ? "text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5"
                        : "text-text-secondary-light hover:text-text-primary-light hover:bg-surface-muted"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">rocket_launch</span>
                  My Team
                </NavLink>
              )}

              {isApproved && ["ongoing", "submission_open"].includes(event.status) && (
                <NavLink
                  to="submission"
                  className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : isDark
                        ? "text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5"
                        : "text-text-secondary-light hover:text-text-primary-light hover:bg-surface-muted"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                  Submission
                </NavLink>
              )}

              {(isCreator || isAdmin) && (
                <NavLink
                  to="manage"
                  className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-warning text-white"
                      : isDark
                        ? "text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5"
                        : "text-text-secondary-light hover:text-text-primary-light hover:bg-surface-muted"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Manage HQ
                </NavLink>
              )}

              {(isCreator || isAdmin || isJudge) && (
                <NavLink
                  to="judging"
                  className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-warning text-white"
                      : isDark
                        ? "text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5"
                        : "text-text-secondary-light hover:text-text-primary-light hover:bg-surface-muted"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">gavel</span>
                  Judging
                </NavLink>
              )}
            </div>

            <div className={`rounded-3xl overflow-hidden min-h-[600px] ${
              isManagementRoute
                ? "shadow-none border-none bg-transparent"
                : isDark
                  ? "bg-background-dark border border-border-dark shadow-lg"
                  : "bg-surface-light border border-border-light shadow-md"
            }`}>
              {outlet || <OverviewTab />}
            </div>
          </div>

          {!isManagementRoute && (
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-24 space-y-8">
                <EnrollmentCTA
                  eventId={event._id}
                  status={event.status}
                  isOnlineCompetition={event.isOnlineCompetition}
                  registrationOpen={event.registrationOpen}
                  spotsRemaining={event.spotsRemaining}
                  isFull={event.isFull}
                  isRegistered={isRegistered}
                  registrationStatus={userRegistration?.status}
                  onEnroll={() => navigate("register")}
                />

                <Card padding="p-6">
                  <h3 className={isDark ? "text-lg font-semibold text-text-primary-dark" : "text-lg font-semibold text-text-primary-light"}>
                    Reward Eligibility
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}>Approved registration</span>
                      <span className="font-semibold text-info">+8 pts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}>Verified attendance</span>
                      <span className="font-semibold text-info">+20 pts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}>Feedback submission</span>
                      <span className="font-semibold text-info">+6 pts</span>
                    </div>
                    <p className={isDark ? "pt-2 text-xs text-text-secondary-dark" : "pt-2 text-xs text-text-secondary-light"}>
                      Certificates unlock after verified attendance. Competition certificates depend on valid participation or published results.
                    </p>
                  </div>
                </Card>

                <Card padding="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={isDark ? "text-lg font-semibold text-text-primary-dark" : "text-lg font-semibold text-text-primary-light"}>
                        Event Feedback
                      </h3>
                      <p className={isDark ? "mt-1 text-sm text-text-secondary-dark" : "mt-1 text-sm text-text-secondary-light"}>
                        Share your experience after verified attendance.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-warning">rate_review</span>
                  </div>

                  {!user ? (
                    <p className={isDark ? "mt-4 text-sm text-text-secondary-dark" : "mt-4 text-sm text-text-secondary-light"}>
                      Sign in to review this event.
                    </p>
                  ) : myFeedback ? (
                    <div className={`mt-4 rounded-2xl border p-4 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-background-light"}`}>
                      <p className="text-sm font-semibold text-success">Feedback submitted</p>
                      <p className={isDark ? "mt-2 text-sm text-text-secondary-dark" : "mt-2 text-sm text-text-secondary-light"}>
                        Rating: {myFeedback.rating}/5
                      </p>
                      {myFeedback.comment ? (
                        <p className={isDark ? "mt-2 text-sm text-text-secondary-dark" : "mt-2 text-sm text-text-secondary-light"}>
                          {myFeedback.comment}
                        </p>
                      ) : null}
                    </div>
                  ) : canSubmitFeedback ? (
                    <form className="mt-4 space-y-4" onSubmit={handleSubmitFeedback}>
                      <label className="block">
                        <span className={isDark ? "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                          Rating
                        </span>
                        <select
                          value={feedbackForm.rating}
                          onChange={(e) => setFeedbackForm((prev) => ({ ...prev, rating: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${
                            isDark
                              ? "border-border-dark bg-background-dark text-text-primary-dark"
                              : "border-border-light bg-background-light text-text-primary-light"
                          }`}
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>
                              {value} Star{value > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className={isDark ? "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                          Comment
                        </span>
                        <textarea
                          rows="4"
                          maxLength={500}
                          value={feedbackForm.comment}
                          onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                          placeholder="What went well, and what could be improved?"
                          className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition-colors ${
                            isDark
                              ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
                              : "border-border-light bg-background-light text-text-primary-light placeholder:text-text-secondary-light"
                          }`}
                        />
                      </label>
                      <Button type="submit" variant="primary" className="w-full justify-center" disabled={actionLoading}>
                        {actionLoading ? "Submitting..." : "Submit Feedback"}
                      </Button>
                    </form>
                  ) : (
                    <p className={isDark ? "mt-4 text-sm text-text-secondary-dark" : "mt-4 text-sm text-text-secondary-light"}>
                      {isRegistered
                        ? "Feedback unlocks after your attendance is verified."
                        : "Register and attend the event to leave feedback."}
                    </p>
                  )}
                </Card>

                <div className={`p-8 rounded-3xl space-y-6 relative overflow-hidden group ${
                  isDark ? "bg-surface-dark border border-border-dark shadow-lg" : "bg-surface-light border border-border-light shadow-md"
                }`}>
                  <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100"></div>
                  <h3 className={`text-lg font-bold flex items-center gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <span className="h-6 w-1.5 rounded-full bg-primary"></span>
                    Event Logistics
                  </h3>

                  <div className="space-y-6">
                    {[
                      ["category", "text-primary", event.category, "Type"],
                      ["calendar_today", "text-success", `${new Date(event.startAt).toLocaleDateString()} — ${new Date(event.endAt).toLocaleDateString()}`, "Timeline"],
                      ["groups", "text-warning", `${event.registrationCount} / ${event.maxCapacity || "∞"} Seats`, "Capacity"],
                    ].map(([icon, color, value, label]) => (
                      <div key={label} className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isDark ? "border-border-dark bg-background-dark text-text-secondary-dark" : "border-border-light bg-surface-muted text-text-secondary-light"}`}>
                          <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{label}</p>
                          <p className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
