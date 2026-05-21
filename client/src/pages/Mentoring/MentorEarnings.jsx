import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMyMentorProfile,
  selectMyMentorProfile,
  fetchMyBookings,
  selectMyBookings,
  selectMentoringLoading,
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import Button from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function MentorEarnings() {
  const dispatch = useDispatch();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const bookings = useSelector(selectMyBookings) || [];
  const loading = useSelector(selectMentoringLoading);
  const currentUser = useSelector(selectUser);
  const isDark = useHomeTheme();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
    dispatch(
      fetchMyBookings({
        sort: "-scheduledAt",
        status: "completed,cancelled",
        limit: 50,
      })
    );
  }, [dispatch]);

  const totalEarnings = mentorProfile?.totalEarnings || 0;
  const sessionCompleted = mentorProfile?.totalSessions || 0;
  const averageRating = mentorProfile?.averageRating || 0;
  const pendingWithdrawal = mentorProfile?.pendingPayout || 0;
  const currency = mentorProfile?.currency || "PKR";

  const sessionEarnings = bookings.filter(
    (booking) =>
      booking.status === "completed" &&
      booking.mentorId?.userId?._id === currentUser?._id
  );
  const withdrawalHistory = [];

  if (loading && !mentorProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const surfaceClassName = isDark
    ? "border-border-dark bg-surface-dark"
    : "border-border-light bg-surface-light shadow-[0_16px_36px_rgba(15,23,42,0.06)]";
  const pendingSurfaceClassName = isDark
    ? "border-success/30 bg-success/10"
    : "border-success/20 bg-success/10";
  const textStrongClassName = isDark
    ? "text-text-primary-dark"
    : "text-text-primary-light";
  const textMutedClassName = isDark
    ? "text-text-secondary-dark"
    : "text-text-secondary-light";
  const tabIdleClassName = isDark
    ? "border-b-transparent text-text-secondary-dark hover:text-text-primary-dark"
    : "border-b-transparent text-text-secondary-light hover:text-text-primary-light";
  const tabActiveClassName = "border-b-primary text-primary";

  return (
    <div
      className={`flex min-h-full w-full flex-col p-4 lg:p-10 ${
        isDark ? "bg-background-dark" : "bg-background-light"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className={`text-3xl font-bold tracking-tight ${textStrongClassName}`}>
            Earnings & Withdrawals
          </h1>
          <p className={textMutedClassName}>
            Track your earnings from mentoring sessions and manage payouts.
          </p>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${surfaceClassName}`}>
            <p className={`text-sm font-semibold uppercase tracking-wider ${textMutedClassName}`}>
              Total Earnings
            </p>
            <p className={`break-words text-3xl font-bold ${textStrongClassName}`}>
              {currency} {totalEarnings.toFixed(2)}
            </p>
          </div>
          <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${surfaceClassName}`}>
            <p className={`text-sm font-semibold uppercase tracking-wider ${textMutedClassName}`}>
              Sessions Completed
            </p>
            <p className={`text-3xl font-bold ${textStrongClassName}`}>
              {sessionCompleted}
            </p>
          </div>
          <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${surfaceClassName}`}>
            <p className={`text-sm font-semibold uppercase tracking-wider ${textMutedClassName}`}>
              Avg. Rating
            </p>
            <p className={`flex items-center gap-1 text-3xl font-bold ${textStrongClassName}`}>
              {averageRating.toFixed(1)}
              <span className="material-symbols-outlined text-[24px] text-warning">
                star
              </span>
            </p>
          </div>
          <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${pendingSurfaceClassName}`}>
            <p className="text-sm font-semibold uppercase tracking-wider text-success">
              Pending Payout
            </p>
            <p className="break-words text-3xl font-bold text-success">
              {currency} {pendingWithdrawal.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-2">
          <Button disabled={pendingWithdrawal <= 0} variant="primary" className="gap-2">
            <span className="material-symbols-outlined font-normal">
              account_balance_wallet
            </span>
            Request Withdrawal
          </Button>
        </div>

        <div
          className={`mt-6 flex gap-8 border-b ${
            isDark ? "border-border-dark" : "border-border-light"
          }`}
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center border-b-2 py-3 transition-colors ${
              activeTab === "overview" ? tabActiveClassName : tabIdleClassName
            }`}
          >
            <span className="text-sm font-semibold tracking-wide">
              Session Earnings
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center justify-center border-b-2 py-3 transition-colors ${
              activeTab === "history" ? tabActiveClassName : tabIdleClassName
            }`}
          >
            <span className="text-sm font-semibold tracking-wide">
              Payout History
            </span>
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-4">
          {activeTab === "overview" &&
            (sessionEarnings.length > 0 ? (
              sessionEarnings.map((session) => {
                const mentee = session.menteeId;
                const menteeName =
                  mentee?.profile?.displayName ||
                  `${mentee?.profile?.firstName || ""} ${mentee?.profile?.lastName || ""}`.trim() ||
                  "Mentee";
                const date = new Date(session.startAt);
                const amount = session.mentorPayout || mentorProfile?.hourlyRate || 0;

                return (
                  <div
                    key={session._id}
                    className={`flex flex-col items-center justify-between rounded-xl border p-5 transition-colors md:flex-row ${surfaceClassName} ${
                      isDark
                        ? "hover:border-slate-500"
                        : "hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-full text-center md:w-auto md:text-left">
                      <p className={`text-lg font-bold ${textStrongClassName}`}>
                        {menteeName}
                      </p>
                      <p className={`text-sm ${textMutedClassName}`}>
                        {date.toLocaleDateString()} • 1 Hour Session
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 md:mt-0">
                      <div className="text-center md:text-right">
                        <p className={`text-xl font-bold ${textStrongClassName}`}>
                          {currency} {amount.toFixed(2)}
                        </p>
                        <p className="text-sm font-bold uppercase tracking-wider text-success">
                          {session.status}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`rounded-2xl border py-10 text-center ${surfaceClassName}`}>
                <p className={`font-medium ${textMutedClassName}`}>
                  No completed sessions yet to show earnings.
                </p>
              </div>
            ))}

          {activeTab === "history" &&
            (withdrawalHistory.length > 0 ? (
              withdrawalHistory.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className={`flex items-center justify-between rounded-xl border p-5 ${surfaceClassName}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-success">
                      check_circle
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className={`font-bold ${textStrongClassName}`}>
                        {withdrawal.method}
                      </p>
                      <p className={`text-sm ${textMutedClassName}`}>
                        {withdrawal.date}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xl font-bold ${textStrongClassName}`}>
                    {currency} {withdrawal.amount.toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <div className={`rounded-2xl border py-10 text-center ${surfaceClassName}`}>
                <p className={`font-medium ${textMutedClassName}`}>
                  No past withdrawals.
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
