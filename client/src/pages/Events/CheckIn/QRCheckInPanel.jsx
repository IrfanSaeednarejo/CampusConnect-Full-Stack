import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventById,
  fetchRegistrationsThunk,
  markAttendanceThunk,
  selectEventActionLoading,
  selectRegistrations,
  selectSelectedEvent,
} from "../../../redux/slices/eventSlice";
import { selectUser } from "../../../redux/slices/authSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import Button, { getButtonClassName } from "../../../components/common/Button";
import { toast } from "react-hot-toast";
import useHomeTheme from "../../../hooks/useHomeTheme";

export default function QRCheckInPanel() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useHomeTheme();

  const event = useSelector(selectSelectedEvent);
  const registrations = useSelector(selectRegistrations);
  const actionLoading = useSelector(selectEventActionLoading);
  const user = useSelector(selectUser);

  const [search, setSearch] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchRegistrationsThunk(eventId));
    }
  }, [dispatch, eventId]);

  const eligibleRegistrations = useMemo(
    () =>
      (registrations || []).filter((reg) => ["approved", "registered", "attended"].includes(reg.status)),
    [registrations]
  );

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return eligibleRegistrations;
    return eligibleRegistrations.filter((reg) => {
      const displayName = reg.userId?.profile?.displayName || "";
      const email = reg.userId?.email || "";
      return displayName.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    });
  }, [eligibleRegistrations, search]);

  const canManageAttendance =
    !!user && (user.roles?.includes("admin") || user._id === event?.createdBy?._id || user._id === event?.createdBy);

  const handleVerifyAttendance = async (userId) => {
    try {
      setActiveUserId(userId);
      await dispatch(markAttendanceThunk({ eventId, userId })).unwrap();
      toast.success("Attendance verified");
    } catch (err) {
      toast.error(err || "Failed to verify attendance");
    } finally {
      setActiveUserId(null);
    }
  };

  if (!event) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
        <CircularProgress />
      </div>
    );
  }

  if (!canManageAttendance) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
        <div className={`max-w-lg rounded-[1.5rem] border p-8 text-center ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
          <span className="material-symbols-outlined text-5xl text-warning">admin_panel_settings</span>
          <h1 className="mt-4 text-2xl font-bold">Attendance Access Restricted</h1>
          <p className={isDark ? "mt-3 text-sm text-text-secondary-dark" : "mt-3 text-sm text-text-secondary-light"}>
            Only the event organizer or an administrator can verify attendance for this event.
          </p>
          <Button variant="primary" className="mt-6" onClick={() => navigate(`/events/${eventId}`)}>
            Return to event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
      <div className={`border-b px-4 py-4 ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/events/${eventId}/manage`)}
            className={getButtonClassName({
              variant: "ghost",
              size: "sm",
              className: "min-w-0 gap-2 px-0",
            })}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Manage HQ
          </button>
          <div className="text-right">
            <h1 className="text-lg font-semibold">Attendance Verification</h1>
            <p className={isDark ? "text-xs text-text-secondary-dark" : "text-xs text-text-secondary-light"}>{event.title}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className={`rounded-[1.5rem] border p-5 ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                Check-In Queue
              </p>
              <h2 className="mt-2 text-2xl font-bold">{eligibleRegistrations.length} eligible participant(s)</h2>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none md:max-w-sm ${
                isDark
                  ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
                  : "border-border-light bg-background-light text-text-primary-light placeholder:text-text-secondary-light"
              }`}
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className={isDark ? "bg-background-dark text-text-secondary-dark" : "bg-background-light text-text-secondary-light"}>
                  <tr className="text-[11px] uppercase tracking-[0.18em]">
                    <th className="px-4 py-4">Participant</th>
                    <th className="px-4 py-4">Registration</th>
                    <th className="px-4 py-4">Attendance</th>
                    <th className="px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className={isDark ? "px-4 py-16 text-center text-sm text-text-secondary-dark" : "px-4 py-16 text-center text-sm text-text-secondary-light"}>
                        No participants matched your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const userId = reg.userId?._id || reg.userId;
                      const isAttended = reg.status === "attended";
                      return (
                        <tr key={reg._id} className={isDark ? "border-t border-border-dark" : "border-t border-border-light"}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={reg.userId?.profile?.avatar || "/default-avatar.png"}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-semibold">{reg.userId?.profile?.displayName || "Participant"}</p>
                                <p className={isDark ? "text-xs text-text-secondary-dark" : "text-xs text-text-secondary-light"}>{reg.userId?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${
                              reg.status === "attended"
                                ? "border-success/20 bg-success/10 text-success"
                                : "border-info/20 bg-info/10 text-info"
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {isAttended ? (
                              <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                                <span className="material-symbols-outlined text-base">verified</span>
                                Verified
                              </span>
                            ) : (
                              <span className={isDark ? "text-sm text-text-secondary-dark" : "text-sm text-text-secondary-light"}>
                                Awaiting verification
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {!isAttended ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleVerifyAttendance(userId)}
                                disabled={actionLoading && activeUserId === userId}
                              >
                                {actionLoading && activeUserId === userId ? "Verifying..." : "Mark Attended"}
                              </Button>
                            ) : (
                              <span className={isDark ? "text-xs text-text-secondary-dark" : "text-xs text-text-secondary-light"}>
                                Reward + certificate handled automatically
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
