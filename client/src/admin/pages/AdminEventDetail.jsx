import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  Users,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Spinner from "../../components/common/Spinner";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "@/hooks/useHomeTheme";

export default function AdminEventDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isDark = useHomeTheme();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/admin/events/${id}/analytics`);
      setData(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch event data");
    } finally {
      setLoading(false);
    }
  };

  const handleKillSwitch = async () => {
    const reason = window.prompt(
      "EMERGENCY KILL SWITCH: Enter cancellation reason. This will notify all users and refund any applicable fees."
    );
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/events/${id}/cancel`, { reason });
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Kill switch failed");
    } finally {
      setActionLoading(false);
    }
  };

  const pageClassName = isDark ? "text-slate-200" : "text-slate-900";
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

  if (!data) {
    return <div className={`p-8 ${mutedClassName}`}>Event not found.</div>;
  }

  const { event, analytics } = data;

  return (
    <div className={`mx-auto max-w-6xl p-8 font-sans ${pageClassName}`}>
      <Link
        to="/admin/events"
        className={getButtonClassName({
          variant: "ghost",
          size: "sm",
          isDark,
          className: "mb-6 w-fit min-w-0 px-2 no-underline",
        })}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className={`mb-8 flex flex-col items-start justify-between gap-8 rounded-2xl border p-8 shadow-xl lg:flex-row ${surfaceClassName}`}>
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                event.status === "published" ||
                event.status === "registration" ||
                event.status === "ongoing"
                  ? isDark
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : event.status === "cancelled"
                    ? isDark
                      ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                    : isDark
                      ? "border-slate-700 bg-slate-800 text-slate-300"
                      : "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              {event.status}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                isDark
                  ? "border-info/20 bg-info/10 text-info"
                  : "border-info/20 bg-info/10 text-info"
              }`}
            >
              {event.type}
            </span>
          </div>
          <h1 className={`mb-4 text-3xl font-bold ${titleClassName}`}>{event.title}</h1>
          <div className={`flex flex-col gap-2 text-sm ${mutedClassName}`}>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {format(new Date(event.startAt), "PPP")}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> {format(new Date(event.startAt), "p")} -{" "}
              {format(new Date(event.endAt), "p")}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {event.venue || "Online / TBD"}
            </p>
            <p
              className={`mt-2 flex items-center gap-2 ${
                isDark ? "text-info" : "text-info"
              }`}
            >
              Organized by: {event.societyId?.name || "Unknown"}
            </p>
          </div>
        </div>

        <div
          className={`min-w-[300px] rounded-xl border p-6 ${
            isDark
              ? "border-rose-900/30 bg-rose-950/20"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <h3
            className={`mb-2 flex items-center gap-2 font-bold ${
              isDark ? "text-rose-400" : "text-rose-700"
            }`}
          >
            <ShieldAlert className="h-5 w-5" /> Danger Zone
          </h3>
          <p className={`mb-4 text-xs ${isDark ? "text-rose-200/70" : "text-rose-700/80"}`}>
            Immediately terminate this event. This action cannot be undone and will dispatch
            emergency notifications.
          </p>
          <button
            onClick={handleKillSwitch}
            disabled={
              actionLoading || event.status === "cancelled" || event.status === "completed"
            }
            className={getButtonClassName({
              variant: "danger",
              size: "md",
              isDark,
              className: "w-full",
            })}
          >
            <AlertTriangle className="h-5 w-5" />
            {event.status === "cancelled" ? "Event Cancelled" : "ENGAGE KILL SWITCH"}
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className={`rounded-xl border p-6 shadow-lg ${surfaceClassName}`}>
          <p className={`mb-1 text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            Total Capacity
          </p>
          <p className={`text-3xl font-bold ${titleClassName}`}>{event.capacity || "∞"}</p>
        </div>
        <div className={`rounded-xl border p-6 shadow-lg ${surfaceClassName}`}>
          <p className="mb-1 text-sm font-medium text-slate-500">Total RSVP'd</p>
          <p className={`text-3xl font-bold ${isDark ? "text-info" : "text-info"}`}>
            {analytics.totalRegistrations}
          </p>
        </div>
        <div className={`rounded-xl border p-6 shadow-lg ${surfaceClassName}`}>
          <p className="mb-1 text-sm font-medium text-slate-500">Checked In (Attended)</p>
          <p className={`text-3xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            {analytics.attended}
          </p>
        </div>
        <div className={`rounded-xl border p-6 shadow-lg ${surfaceClassName}`}>
          <p className="mb-1 text-sm font-medium text-slate-500">Drop-off Rate</p>
          <p className={`text-3xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
            {analytics.dropOffRate}%
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-6 shadow-lg ${surfaceClassName}`}>
        <h2 className={`mb-6 flex items-center gap-2 text-lg font-semibold ${titleClassName}`}>
          <Users className="h-5 w-5" /> RSVP Breakdown
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Registered", value: analytics.registered },
            { label: "Waitlisted", value: analytics.waitlisted },
            { label: "Attended", value: analytics.attended },
            { label: "Cancelled", value: analytics.cancelled },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-4 text-center ${insetClassName}`}
            >
              <p className={`mb-1 text-2xl font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {item.value}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
