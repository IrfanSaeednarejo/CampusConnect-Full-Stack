import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  AlertTriangle,
  CheckCircle,
  CalendarX,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Spinner from "../../components/common/Spinner";
import useHomeTheme from "@/hooks/useHomeTheme";
import Button from "../../components/common/Button";
import { reactivateMentor } from "../../api/adminApi";

export default function AdminMentorDetail() {
  const { id } = useParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isDark = useHomeTheme();

  useEffect(() => {
    fetchOverview();
  }, [id]);

  const formatPkr = (value) => `PKR ${(Number(value) || 0).toFixed(2)}`;

  const fetchOverview = async () => {
    try {
      const { data } = await api.get(`/admin/mentors/${id}/overview`);
      setOverview(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch mentor overview");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, reasonPrompt) => {
    const reason = window.prompt(reasonPrompt);
    if (!reason) return;

    setActionLoading(true);
    try {
      const { data } = await api.post(`/admin/mentors/${id}/action`, {
        action,
        reason,
      });
      toast.success(data.message);
      fetchOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      const { data } = await reactivateMentor(id);
      toast.success(data.message || "Mentor reactivated successfully");
      fetchOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reactivate mentor");
    } finally {
      setActionLoading(false);
    }
  };

  const surfaceClassName = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";
  const insetClassName = isDark
    ? "border-slate-800 bg-slate-950"
    : "border-slate-200 bg-slate-50";
  const titleClassName = isDark ? "text-white" : "text-slate-900";
  const mutedClassName = isDark ? "text-slate-400" : "text-slate-500";

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }
  if (!overview) return <div className={`p-8 ${mutedClassName}`}>Mentor not found.</div>;

  const { mentor, sessionStats } = overview;
  const user = mentor.userId || {};

  return (
    <div className="mx-auto max-w-5xl p-8 font-sans">
      <Link
        to="/admin/mentors"
        className={`mb-6 flex w-fit items-center gap-2 transition-colors ${
          isDark ? "text-info hover:text-info" : "text-info hover:text-info"
        }`}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Mentors
      </Link>

      <div className={`mb-8 flex flex-col items-center gap-6 rounded-2xl border p-8 shadow-xl md:flex-row md:items-start ${surfaceClassName}`}>
        <img
          src={
            user?.profile?.avatar?.url ||
            `https://ui-avatars.com/api/?name=${user?.profile?.firstName}+${user?.profile?.lastName}&background=2563eb&color=fff`
          }
          alt={user?.profile?.displayName}
          className={`h-24 w-24 rounded-full border-4 object-cover shadow-lg ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        />
        <div className="flex-1 text-center md:text-left">
          <div className="mb-2 flex items-center justify-center gap-3 md:justify-start">
            <h1 className={`text-3xl font-bold ${titleClassName}`}>{user?.profile?.displayName}</h1>
            {mentor.verified && <CheckCircle className="h-6 w-6 text-emerald-500" />}
          </div>
          <p className={mutedClassName}>
            {user?.email} • Campus: {user?.campusId?.name || "N/A"}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                isDark
                  ? "border-info/20 bg-info/10 text-info"
                  : "border-info/20 bg-info/10 text-info"
              }`}
            >
              Tier: {mentor.tier.toUpperCase()}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                mentor.isActive
                  ? isDark
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : isDark
                    ? "border-danger/25 bg-danger/10 text-danger"
                    : "border-danger/20 bg-danger/5 text-danger"
              }`}
            >
              {mentor.isActive ? "Active" : "Suspended"}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto">
          {mentor.isActive ? (
            <Button
              onClick={() => handleAction("issue_warning", "Enter reason for official warning:")}
              disabled={actionLoading}
              variant="warning"
              size="md"
              className="justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <AlertTriangle className="h-4 w-4" /> Issue Warning
            </Button>
          ) : (
            <Button
              onClick={handleReactivate}
              disabled={actionLoading}
              variant="success"
              size="md"
              className="justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <CheckCircle className="h-4 w-4" /> Reactivate Mentor
            </Button>
          )}
          <Button
            onClick={() =>
              handleAction(
                "force_cancel_sessions",
                "Enter reason for force cancelling all upcoming sessions:"
              )
            }
            disabled={actionLoading}
            variant="danger"
            size="md"
            className="justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <CalendarX className="h-4 w-4" /> Cancel Upcoming Sessions
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className={`rounded-xl border p-6 shadow-lg md:col-span-2 ${surfaceClassName}`}>
          <h2 className={`mb-4 text-lg font-semibold ${titleClassName}`}>Financial Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-lg border p-4 ${insetClassName}`}>
              <p className="mb-1 text-sm font-medium text-slate-500">Total Earnings</p>
              <p className={`text-2xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                {formatPkr(mentor.totalEarnings)}
              </p>
            </div>
            <div className={`rounded-lg border p-4 ${insetClassName}`}>
              <p className="mb-1 text-sm font-medium text-slate-500">Pending Payout</p>
              <p className={`text-2xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                {formatPkr(mentor.pendingPayout)}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-6 shadow-lg ${surfaceClassName}`}>
          <h2 className={`mb-4 text-lg font-semibold ${titleClassName}`}>Performance</h2>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500">Average Rating</p>
              <p className={`text-2xl font-bold ${titleClassName}`}>
                {mentor.averageRating?.toFixed(1) || "0.0"}{" "}
                <span className="text-sm font-normal text-slate-500">/ 5.0</span>
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500">Total Reviews</p>
              <p className={`text-xl font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {mentor.totalReviews || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`mb-8 rounded-xl border p-6 shadow-lg ${surfaceClassName}`}>
        <h2 className={`mb-4 text-lg font-semibold ${titleClassName}`}>Session Analytics</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Object.entries(sessionStats).map(([status, count]) => (
            <div key={status} className={`rounded-lg border p-4 text-center ${insetClassName}`}>
              <p className={`mb-1 text-3xl font-bold ${titleClassName}`}>{count}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {mentor.suspendReason && (
        <div
          className={`rounded-xl border p-6 shadow-lg ${
            isDark ? "border-danger/25 bg-danger/10" : "border-danger/20 bg-danger/5"
          }`}
        >
          <h2
            className={`mb-2 flex items-center gap-2 text-lg font-semibold ${
              "text-danger"
            }`}
          >
            <Ban className="h-5 w-5" /> Current Suspension
          </h2>
          <p className={isDark ? "text-red-100" : "text-red-900"}>
            <span className="font-semibold">Reason:</span> {mentor.suspendReason}
          </p>
          {mentor.suspendedAt && (
            <p className={`mt-2 text-sm ${isDark ? "text-red-200/70" : "text-red-800/80"}`}>
              Suspended on {format(new Date(mentor.suspendedAt), "PPP")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
