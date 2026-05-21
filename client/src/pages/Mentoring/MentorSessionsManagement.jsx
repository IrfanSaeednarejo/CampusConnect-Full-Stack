import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  fetchMyBookings,
  selectMyBookings,
  selectMentoringLoading,
  confirmBookingThunk,
  cancelBookingThunk,
  completeBookingThunk,
  markNoShowThunk,
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import useHomeTheme from "../../hooks/useHomeTheme";

function ActionModal({
  isOpen,
  onClose,
  title,
  message,
  inputLabel,
  inputPlaceholder,
  confirmText,
  confirmColor,
  onConfirm,
  isDark,
}) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 ${
          isDark
            ? "border-[#30363d] bg-[#161b22]"
            : "border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
        }`}
      >
        <h3 className={`mb-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
        <p className={`mb-4 text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{message}</p>

        <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-[#c9d1d9]" : "text-slate-700"}`}>
          {inputLabel}
        </label>
        <input
          type="text"
          className={`mb-6 w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none ${
            isDark
              ? "border-border-dark bg-background-dark text-white focus:border-info"
              : "border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          }`}
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-3 font-medium">
          <button
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              isDark ? "text-[#8b949e] hover:bg-[#21262d]" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(inputValue)}
            disabled={!inputValue.trim()}
            className={`rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50 ${
              confirmColor === "green"
                ? "bg-primary hover:bg-primary-hover"
                : confirmColor === "red"
                  ? "bg-danger hover:bg-red-700"
                  : "bg-info hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionActions({ session, isMentor, actionLoading, onAction, navigate, isDark }) {
  const loading = actionLoading === session._id;

  return (
    <>
      {isMentor && session.status === "pending" && (
        <button
          onClick={() => onAction(session._id, "confirm")}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
          )}
          Accept & Add Link
        </button>
      )}
      {session.status === "confirmed" && (
        <>
          <button
            onClick={() => navigate(`/workspace/session/${session._id}`)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-info px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Join Workspace
          </button>
          {isMentor && (
            <button
              onClick={() => onAction(session._id, "complete")}
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                isDark
                  ? "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-success">done_all</span>
              Mark Completed
            </button>
          )}
        </>
      )}
      {isMentor && session.status === "confirmed" && new Date() > new Date(session.startAt) && (
        <button
          onClick={() => onAction(session._id, "no-show")}
          disabled={loading}
          className={`mt-1 flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
            isDark
              ? "border-warning/40 text-warning hover:bg-warning/10"
              : "border-amber-200 text-amber-700 hover:bg-amber-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">person_off</span>
          Mark No-Show
        </button>
      )}
      <button
        onClick={() => onAction(session._id, "cancel")}
        disabled={loading}
        className={`mt-1 flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
          isDark
            ? "border-danger/40 text-red-300 hover:bg-danger/10"
            : "border-rose-200 text-rose-700 hover:bg-rose-50"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">cancel</span>
        Cancel Session
      </button>
    </>
  );
}

export default function MentorSessionsManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookings = useSelector(selectMyBookings) || [];
  const loading = useSelector(selectMentoringLoading);
  const currentUser = useSelector(selectUser);
  const isDark = useHomeTheme();

  const [activeTab, setActiveTab] = useState("scheduled");
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, bookingId: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });

  useEffect(() => {
    dispatch(fetchMyBookings({ sort: "-startAt", limit: 100 }));
  }, [dispatch]);

  const pendingSessions = bookings.filter((booking) => booking.status === "pending");
  const scheduledSessions = bookings.filter((booking) => booking.status === "confirmed");
  const completedSessions = bookings.filter((booking) =>
    ["completed", "cancelled", "no-show"].includes(booking.status)
  );

  const handleActionClick = (bookingId, action) => {
    if (action === "confirm") {
      setConfirmModal({ isOpen: true, bookingId });
    } else if (action === "cancel") {
      setCancelModal({ isOpen: true, bookingId });
    } else if (action === "complete" || action === "no-show") {
      executeAction(bookingId, action);
    }
  };

  const executeAction = async (bookingId, action, payload = null) => {
    setActionLoading(bookingId);
    setConfirmModal({ isOpen: false, bookingId: null });
    setCancelModal({ isOpen: false, bookingId: null });

    try {
      if (action === "confirm") {
        await dispatch(confirmBookingThunk({ id: bookingId, data: { meetingLink: payload } })).unwrap();
        toast.success("Session confirmed! Note sent to mentee.");
      } else if (action === "cancel") {
        await dispatch(cancelBookingThunk({ id: bookingId, data: { reason: payload } })).unwrap();
        toast.success("Session cancelled.");
      } else if (action === "complete") {
        await dispatch(completeBookingThunk(bookingId)).unwrap();
        toast.success("Session marked as completed!");
      } else if (action === "no-show") {
        await dispatch(markNoShowThunk(bookingId)).unwrap();
        toast.success("Session marked as No Show.");
      }
      dispatch(fetchMyBookings({ sort: "-startAt", limit: 100 }));
    } catch (err) {
      toast.error(err || `Failed to ${action} session`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPartnerInfo = (session) => {
    const isMentor = session.mentorId?.userId?._id === currentUser?._id;
    return isMentor ? session.menteeId : session.mentorId?.userId;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center p-10 ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-success border-t-transparent" />
      </div>
    );
  }

  const tabBase = isDark
    ? "border-b-transparent text-[#8b949e] hover:text-[#c9d1d9]"
    : "border-b-transparent text-slate-500 hover:text-slate-800";

  return (
    <div className={`flex h-full w-full flex-col overflow-y-auto p-4 lg:p-10 ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-[#c9d1d9]" : "text-slate-900"}`}>
            My Sessions
          </h1>
          <p className={isDark ? "text-[#8b949e]" : "text-slate-500"}>
            Track, manage, and join your mentoring sessions seamlessly.
          </p>
        </div>

        <div className={`mt-2 flex gap-8 overflow-x-auto border-b ${isDark ? "border-[#30363d]" : "border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex shrink-0 flex-col items-center justify-center border-b-[3px] py-3 transition-colors ${
              activeTab === "pending"
                ? "border-b-warning text-[#c9d1d9]"
                : tabBase
            }`}
          >
            <span className="text-sm font-bold tracking-wide">
              Pending{" "}
              <span
                className={`ml-1 rounded-full border px-2 py-0.5 text-xs ${
                  isDark ? "border-[#30363d] bg-[#21262d]" : "border-slate-200 bg-slate-100"
                }`}
              >
                {pendingSessions.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`flex shrink-0 flex-col items-center justify-center border-b-[3px] py-3 transition-colors ${
              activeTab === "scheduled"
                ? "border-b-success text-[#c9d1d9]"
                : tabBase
            }`}
          >
            <span className="text-sm font-bold tracking-wide">
              Scheduled{" "}
              <span
                className={`ml-1 rounded-full border px-2 py-0.5 text-xs ${
                  isDark ? "border-[#30363d] bg-[#21262d]" : "border-slate-200 bg-slate-100"
                }`}
              >
                {scheduledSessions.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex shrink-0 flex-col items-center justify-center border-b-[3px] py-3 transition-colors ${
              activeTab === "completed"
                ? "border-b-success text-[#c9d1d9]"
                : tabBase
            }`}
          >
            <span className="text-sm font-bold tracking-wide">
              History{" "}
              <span
                className={`ml-1 rounded-full border px-2 py-0.5 text-xs ${
                  isDark ? "border-[#30363d] bg-[#21262d]" : "border-slate-200 bg-slate-100"
                }`}
              >
                {completedSessions.length}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-5">
          {activeTab === "pending" &&
            pendingSessions.map((session) => {
              const partner = getPartnerInfo(session);
              const partnerName =
                partner?.profile?.displayName ||
                `${partner?.profile?.firstName || "Unknown"} ${partner?.profile?.lastName || ""}`;
              const date = new Date(session.startAt);
              const isMentor = session.mentorId?.userId?._id === currentUser?._id;

              return (
                <div
                  key={session._id}
                  className={`flex flex-col gap-5 rounded-xl border p-5 transition-colors ${
                    isDark
                      ? "border-warning/30 bg-[#161b22]/50 hover:border-warning/60"
                      : "border-amber-200 bg-white hover:border-amber-300 shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative shrink-0">
                        {partner?.profile?.avatar ? (
                          <img
                            src={partner.profile.avatar}
                            alt="Avatar"
                            className={`h-16 w-16 rounded-full object-cover border-2 ${
                              isDark ? "border-[#21262d]" : "border-white"
                            }`}
                          />
                        ) : (
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ${
                              isDark
                                ? "border-2 border-[#21262d] bg-warning"
                                : "bg-warning"
                            }`}
                          >
                            {partnerName[0]}
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                            isDark ? "border-[#161b22]" : "border-white"
                          } ${isMentor ? "bg-info" : "bg-warning"}`}
                        >
                          <span className="material-symbols-outlined text-[12px] font-bold text-white">
                            {isMentor ? "school" : "person"}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-3">
                          <p className={`truncate text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {partnerName}
                          </p>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              isDark
                                ? "border-warning/20 bg-warning/10 text-warning"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <p className={`mt-1 line-clamp-1 text-sm font-medium ${isDark ? "text-[#c9d1d9]" : "text-slate-700"}`}>
                          {session.topic || "General Mentoring & Discussion"}
                        </p>

                        <div className={`mt-2 flex flex-wrap items-center gap-3 text-xs font-medium ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                          <span
                            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
                              isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span
                            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
                              isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                            {session.duration} mins
                          </span>
                          <span
                            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
                              isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {session.fee === 0 ? "money_off" : "payments"}
                            </span>
                            {session.fee === 0 ? "Free" : `${session.currency} ${session.fee}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-[200px] shrink-0 flex-col gap-2 md:flex md:items-end">
                      <SessionActions
                        session={session}
                        isMentor={isMentor}
                        actionLoading={actionLoading}
                        onAction={handleActionClick}
                        navigate={navigate}
                        isDark={isDark}
                      />
                    </div>
                  </div>

                  {(session.notes || session.meetingLink) && (
                    <div
                      className={`mt-2 rounded-xl border p-4 space-y-3 ${
                        isDark ? "border-[#30363d] bg-[#0d1117]/50" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {session.meetingLink && session.status === "confirmed" && (
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined mt-0.5 text-[18px] text-info">link</span>
                          <div>
                            <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                              Meeting Link
                            </p>
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-sm font-medium text-info hover:underline"
                            >
                              {session.meetingLink}
                            </a>
                          </div>
                        </div>
                      )}
                      {session.notes && (
                        <div className="flex items-start gap-3">
                          <span className={`material-symbols-outlined mt-0.5 text-[18px] ${isDark ? "text-[#8b949e]" : "text-slate-400"}`}>
                            edit_note
                          </span>
                          <div>
                            <p className={`mb-0.5 text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                              Notes from Mentee
                            </p>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-[#c9d1d9]" : "text-slate-700"}`}>
                              {session.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`mt-2 flex flex-col gap-2 pt-4 md:hidden ${isDark ? "border-t border-[#30363d]" : "border-t border-slate-200"}`}>
                    <SessionActions
                      session={session}
                      isMentor={isMentor}
                      actionLoading={actionLoading}
                      onAction={handleActionClick}
                      navigate={navigate}
                      isDark={isDark}
                    />
                  </div>
                </div>
              );
            })}

          {activeTab === "scheduled" &&
            scheduledSessions.map((session) => {
              const partner = getPartnerInfo(session);
              const partnerName =
                partner?.profile?.displayName ||
                `${partner?.profile?.firstName || "Unknown"} ${partner?.profile?.lastName || ""}`;
              const date = new Date(session.startAt);
              const isMentor = session.mentorId?.userId?._id === currentUser?._id;

              return (
                <div
                  key={session._id}
                  className={`flex flex-col gap-5 rounded-xl border p-5 transition-colors ${
                    isDark
                      ? "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative shrink-0">
                        {partner?.profile?.avatar ? (
                          <img
                            src={partner.profile.avatar}
                            alt="Avatar"
                            className={`h-16 w-16 rounded-full object-cover border-2 ${
                              isDark ? "border-[#21262d]" : "border-white"
                            }`}
                          />
                        ) : (
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ${
                              isDark
                                ? "border-2 border-[#21262d] bg-success"
                                : "bg-success"
                            }`}
                          >
                            {partnerName[0]}
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                            isDark ? "border-[#161b22]" : "border-white"
                          } ${isMentor ? "bg-info" : "bg-warning"}`}
                        >
                          <span className="material-symbols-outlined text-[12px] font-bold text-white">
                            {isMentor ? "school" : "person"}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-3">
                          <p className={`truncate text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {partnerName}
                          </p>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              isDark
                                ? "border-success/20 bg-success/10 text-success"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <p className={`mt-1 line-clamp-1 text-sm font-medium ${isDark ? "text-[#c9d1d9]" : "text-slate-700"}`}>
                          {session.topic || "General Mentoring & Discussion"}
                        </p>

                        <div className={`mt-2 flex flex-wrap items-center gap-3 text-xs font-medium ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                          <span
                            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
                              isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span
                            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
                              isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                            {session.duration} mins
                          </span>
                          <span
                            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
                              isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {session.fee === 0 ? "money_off" : "payments"}
                            </span>
                            {session.fee === 0 ? "Free" : `${session.currency} ${session.fee}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-[200px] shrink-0 flex-col gap-2 md:flex md:items-end">
                      <SessionActions
                        session={session}
                        isMentor={isMentor}
                        actionLoading={actionLoading}
                        onAction={handleActionClick}
                        navigate={navigate}
                        isDark={isDark}
                      />
                    </div>
                  </div>

                  {(session.notes || session.meetingLink) && (
                    <div
                      className={`mt-2 rounded-xl border p-4 space-y-3 ${
                        isDark ? "border-[#30363d] bg-[#0d1117]/50" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {session.meetingLink && session.status === "confirmed" && (
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined mt-0.5 text-[18px] text-info">link</span>
                          <div>
                            <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                              Meeting Link
                            </p>
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-sm font-medium text-info hover:underline"
                            >
                              {session.meetingLink}
                            </a>
                          </div>
                        </div>
                      )}
                      {session.notes && (
                        <div className="flex items-start gap-3">
                          <span className={`material-symbols-outlined mt-0.5 text-[18px] ${isDark ? "text-[#8b949e]" : "text-slate-400"}`}>
                            edit_note
                          </span>
                          <div>
                            <p className={`mb-0.5 text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                              Notes from Mentee
                            </p>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-[#c9d1d9]" : "text-slate-700"}`}>
                              {session.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`mt-2 flex flex-col gap-2 pt-4 md:hidden ${isDark ? "border-t border-[#30363d]" : "border-t border-slate-200"}`}>
                    <SessionActions
                      session={session}
                      isMentor={isMentor}
                      actionLoading={actionLoading}
                      onAction={handleActionClick}
                      navigate={navigate}
                      isDark={isDark}
                    />
                  </div>
                </div>
              );
            })}

          {activeTab === "completed" &&
            completedSessions.map((session) => {
              const partner = getPartnerInfo(session);
              const partnerName =
                partner?.profile?.displayName ||
                `${partner?.profile?.firstName || "Unknown"} ${partner?.profile?.lastName || ""}`;
              const date = new Date(session.startAt);

              return (
                <div
                  key={session._id}
                  className={`flex flex-col gap-5 rounded-xl border p-5 transition-all md:flex-row md:items-center ${
                    isDark
                      ? "border-[#30363d] bg-[#0d1117] hover:bg-[#161b22]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="shrink-0 grayscale opacity-80">
                      {partner?.profile?.avatar ? (
                        <img
                          src={partner.profile.avatar}
                          alt="Avatar"
                          className={`h-12 w-12 rounded-full object-cover border ${
                            isDark ? "border-[#21262d]" : "border-slate-200"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold ${
                            isDark
                              ? "border-[#30363d] bg-[#21262d] text-[#8b949e]"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {partnerName[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-3">
                        <p className={`truncate text-base font-bold ${isDark ? "text-[#8b949e]" : "text-slate-700"}`}>
                          {partnerName}
                        </p>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            session.status === "completed"
                              ? isDark
                                ? "border-success/20 bg-success/10 text-success"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : session.status === "cancelled"
                                ? isDark
                                  ? "border-danger/20 bg-danger/10 text-red-300"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                                : isDark
                                  ? "border-border-dark/30 bg-border-dark/10 text-text-secondary-dark"
                                  : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className={`mt-1.5 flex flex-wrap items-center gap-3 ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {session.cancellationReason && session.status === "cancelled" && (
                          <span
                            className={`flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium ${
                              isDark
                                ? "border-danger/20 bg-danger/5 text-red-300"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            Reason: {session.cancellationReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {activeTab === "pending" && pendingSessions.length === 0 && (
            <div
              className={`mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-16 text-center ${
                isDark ? "border-[#30363d] bg-[#161b22]/50" : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                  isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                }`}
              >
                <span className={`material-symbols-outlined text-4xl ${isDark ? "text-[#8b949e]" : "text-slate-400"}`}>
                  inbox
                </span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>No pending requests</p>
              <p className={`mt-2 max-w-md ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                You don't have any sessions awaiting confirmation.
              </p>
              <button
                onClick={() => navigate("/mentors")}
                className={`mt-6 flex items-center gap-2 rounded-xl border px-6 py-2.5 font-semibold transition-all ${
                  isDark
                    ? "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:border-[#8b949e] hover:bg-[#30363d]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Browse Mentors
              </button>
            </div>
          )}

          {activeTab === "scheduled" && scheduledSessions.length === 0 && (
            <div
              className={`mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-16 text-center ${
                isDark ? "border-[#30363d] bg-[#161b22]/50" : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                  isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                }`}
              >
                <span className={`material-symbols-outlined text-4xl ${isDark ? "text-[#8b949e]" : "text-slate-400"}`}>
                  event_busy
                </span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>No scheduled sessions</p>
              <p className={`mt-2 max-w-md ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                You don't have any upcoming confirmed mentoring sessions.
              </p>
              <button
                onClick={() => navigate("/mentors")}
                className={`mt-6 flex items-center gap-2 rounded-xl border px-6 py-2.5 font-semibold transition-all ${
                  isDark
                    ? "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:border-[#8b949e] hover:bg-[#30363d]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Browse Mentors
              </button>
            </div>
          )}

          {activeTab === "completed" && completedSessions.length === 0 && (
            <div
              className={`mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-16 text-center ${
                isDark ? "border-[#30363d] bg-[#161b22]/50" : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                  isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                }`}
              >
                <span className={`material-symbols-outlined text-4xl ${isDark ? "text-[#8b949e]" : "text-slate-400"}`}>
                  history_toggle_off
                </span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>No history found</p>
              <p className={`mt-2 max-w-md ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                You haven't completed or cancelled any sessions yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <ActionModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, bookingId: null })}
        title="Confirm Session"
        message="Please provide a Google Meet or Zoom link for the mentee to join."
        inputLabel="Meeting Link URL"
        inputPlaceholder="https://meet.google.com/xyz-abcd-efg"
        confirmText="Confirm Session"
        confirmColor="green"
        onConfirm={(value) => executeAction(confirmModal.bookingId, "confirm", value)}
        isDark={isDark}
      />

      <ActionModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: null })}
        title="Cancel Session"
        message="Are you sure you want to cancel this session? Please provide a reason to notify the other party."
        inputLabel="Cancellation Reason"
        inputPlaceholder="e.g. Scheduling conflict, emergency, etc."
        confirmText="Cancel Session"
        confirmColor="red"
        onConfirm={(value) => executeAction(cancelModal.bookingId, "cancel", value)}
        isDark={isDark}
      />
    </div>
  );
}
