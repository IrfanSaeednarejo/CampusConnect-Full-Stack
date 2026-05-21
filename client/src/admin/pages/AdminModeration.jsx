import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Spinner from "../../components/common/Spinner";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export default function AdminModeration() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);
  const isDark = useHomeTheme();

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/reports?status=${filterStatus}`);
      setReports(data.data.docs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, status, promptMsg) => {
    const notes = window.prompt(promptMsg);
    if (notes === null) return;

    setActionLoading(id);
    try {
      await api.patch(`/admin/reports/${id}`, { status, adminNotes: notes });
      toast.success("Report updated successfully");
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update report");
    } finally {
      setActionLoading(null);
    }
  };

  const surfaceClassName = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";
  const insetClassName = isDark
    ? "border-slate-800 bg-slate-950"
    : "border-slate-200 bg-slate-50";

  return (
    <div className="mx-auto max-w-7xl p-8 font-sans">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className={`flex items-center gap-3 text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            <Shield className={`h-8 w-8 ${isDark ? "text-primary" : "text-primary"}`} /> Moderation Queue
          </h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Manage user reports and enforce platform safety.
          </p>
        </div>

        <div className={`flex items-center gap-3 rounded-lg border p-1 ${surfaceClassName}`}>
          {["pending", "reviewed", "resolved", "dismissed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={getButtonClassName({
                variant: filterStatus === status ? "primary" : "ghost",
                size: "sm",
                isDark,
                className: "rounded-lg px-4 capitalize",
              })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="xl" />
        </div>
      ) : reports.length === 0 ? (
        <div className={`rounded-2xl border p-16 text-center shadow-lg ${surfaceClassName}`}>
          <Shield className={`mx-auto mb-4 h-16 w-16 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
          <h3 className={`mb-2 text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Queue is Empty
          </h3>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>
            No {filterStatus} reports found. Great job keeping the platform clean!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className={`flex flex-col gap-6 rounded-xl border p-6 shadow-md transition-colors hover:border-slate-400/40 md:flex-row ${surfaceClassName}`}
            >
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded border px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                      isDark
                        ? "border-danger/25 bg-danger/10 text-danger"
                        : "border-danger/20 bg-danger/5 text-danger"
                    }`}
                  >
                    {report.reason.replace("_", " ")}
                  </span>
                  <span className={`font-mono text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Target: {report.targetModel}
                  </span>
                  <span className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    • {format(new Date(report.createdAt), "PP p")}
                  </span>
                </div>
                <p
                  className={`mb-4 border-l-2 pl-4 py-1 font-medium italic ${
                    isDark
                      ? "border-slate-700 text-slate-300"
                      : "border-slate-300 text-slate-700"
                  }`}
                >
                  "{report.description}"
                </p>
                <div className={`flex flex-wrap gap-4 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  <span>
                    Reporter:{" "}
                    <span className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                      {report.reporterId?.profile?.displayName ||
                        report.reporterId?.email ||
                        "Unknown"}
                    </span>
                  </span>
                  <span>
                    Target ID:{" "}
                    <Link
                      to={`/admin/${report.targetModel.toLowerCase()}s/${report.targetId}`}
                      className={isDark ? "font-mono text-primary hover:underline" : "font-mono text-primary hover:underline"}
                    >
                      {report.targetId}
                    </Link>
                  </span>
                </div>
                {report.adminNotes && (
                  <div className={`mt-4 rounded border p-3 text-sm ${insetClassName}`}>
                    <span className="font-semibold text-slate-500">Admin Notes: </span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>{report.adminNotes}</span>
                  </div>
                )}
              </div>

              {report.status === "pending" && (
                <div
                  className={`flex min-w-[160px] flex-row justify-center gap-2 border-t pt-4 md:flex-col md:border-l md:border-t-0 md:pl-6 md:pt-0 ${
                    isDark ? "border-slate-800" : "border-slate-200"
                  }`}
                >
                  <button
                    onClick={() =>
                      handleResolve(
                        report._id,
                        "resolved",
                        "Enter action taken (e.g. User suspended for 7 days):"
                      )
                    }
                    disabled={actionLoading === report._id}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      isDark
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" /> Resolve
                  </button>
                  <button
                    onClick={() =>
                      handleResolve(report._id, "dismissed", "Enter reason for dismissal:")
                    }
                    disabled={actionLoading === report._id}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
