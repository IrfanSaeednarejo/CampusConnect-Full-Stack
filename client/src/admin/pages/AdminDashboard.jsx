import { useCallback, useEffect, useState } from "react";
import axios from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminRequests,
  getDashboardFeed,
  getDashboardStats,
} from "../../api/adminApi";
import {
  selectDashboardStats,
  selectLiveEvents,
  setDashboardStats,
  setLiveEvents,
} from "../../redux/slices/adminSlice";
import AdminStatCard from "../components/AdminStatCard";
import LiveEventFeed from "../components/LiveEventFeed";
import ReasonModal from "../components/ReasonModal";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

const statCards = [
  { icon: "👥", label: "Total Active Users", color: "#3b82f6" },
  { icon: "📨", label: "Action Items", color: "#6366f1" },
  { icon: "🎓", label: "Mentor Sessions", color: "#22c55e" },
  { icon: "🏛️", label: "Active Societies", color: "#f59e0b" },
];

const REQUEST_META = {
  mentor: {
    icon: "🎓",
    badge: "Mentor Request",
    tone: "rgba(99,102,241,0.12)",
  },
  society: {
    icon: "🏛️",
    badge: "Society Request",
    tone: "rgba(34,197,94,0.12)",
  },
  event: {
    icon: "📅",
    badge: "Event Review",
    tone: "rgba(6,182,212,0.12)",
  },
  study_group: {
    icon: "📚",
    badge: "Study Group Request",
    tone: "rgba(168,85,247,0.12)",
  },
};

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const liveEvents = useSelector(selectLiveEvents);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const isDark = useHomeTheme();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, requestsRes, feedRes] = await Promise.all([
        getDashboardStats(),
        getAdminRequests({ type: "all" }),
        getDashboardFeed(),
      ]);

      dispatch(setDashboardStats(statsRes.data?.data || null));
      setRequests(Array.isArray(requestsRes.data?.data) ? requestsRes.data.data : []);

      const feedItems = Array.isArray(feedRes.data?.data) ? feedRes.data.data : [];
      if (feedItems.length > 0) {
        dispatch(setLiveEvents(feedItems));
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadDashboardData();
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [loadDashboardData]);

  useEffect(() => {
    const handleRefresh = () => {
      loadDashboardData();
    };

    window.addEventListener("admin-dashboard-refresh", handleRefresh);
    return () => window.removeEventListener("admin-dashboard-refresh", handleRefresh);
  }, [loadDashboardData]);

  const handleAction = async (requestId, type, action, reason = "") => {
    try {
      let endpoint = "";
      let payload = {};
      let method = "patch";

      if (type === "mentor") {
        endpoint = `/admin/mentors/${requestId}/${action === "approve" ? "verify" : "reject"}`;
        payload = action === "reject" ? { reason } : {};
      } else if (type === "society") {
        endpoint = `/admin/societies/${requestId}/status`;
        payload = { status: action === "approve" ? "approved" : "rejected", reason };
      } else if (type === "event") {
        endpoint = `/admin/events/${requestId}/${action === "approve" ? "approve" : "reject"}`;
        payload = action === "reject" ? { reason } : {};
      } else if (type === "study_group") {
        if (action === "approve") {
          endpoint = `/admin/study-groups/${requestId}/status`;
          payload = { status: "active" };
        } else {
          endpoint = `/admin/study-groups/${requestId}`;
          method = "delete";
        }
      }

      await axios({ method, url: endpoint, data: payload });
      await loadDashboardData();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    }
  };

  const queuedItems = requests.slice(0, 6);

  const pageClassName = isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light";
  const surfaceClassName = isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light";
  const subtleSurfaceClassName = isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-surface-muted";
  const mutedTextClassName = isDark ? "text-text-secondary-dark" : "text-text-secondary-light";
  const titleClassName = isDark ? "text-text-primary-dark" : "text-text-primary-light";

  if (loading) {
    return (
      <div className={`flex min-h-[60vh] items-center justify-center ${pageClassName}`}>
        <div className="text-center">
          <div
            className={`mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 ${
              isDark ? "border-border-dark border-t-primary-dark" : "border-border-light border-t-primary-light"
            }`}
          />
          <p className={`text-sm font-medium ${mutedTextClassName}`}>Synchronizing system stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${pageClassName}`}>
      <section
        className={`rounded-[28px] border p-6 sm:p-8 ${surfaceClassName}`}
        style={{
          boxShadow: isDark
            ? "0 24px 60px rgba(0,0,0,0.24)"
            : "0 24px 60px rgba(15,23,42,0.08)",
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${
                  isDark
                    ? "border-primary-dark/20 bg-primary-dark/10 text-primary-dark"
                    : "border-primary-light/20 bg-primary-light/10 text-primary-light"
                }`}
              >
                ADMIN CONSOLE
              </span>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${subtleSurfaceClassName} ${mutedTextClassName}`}
              >
                Real-time monitoring
              </span>
            </div>

            <div className="space-y-2">
              <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>System Overview</h1>
              <p className={`max-w-2xl text-sm leading-6 sm:text-base ${mutedTextClassName}`}>
                Review platform activity, process approvals, and keep an eye on live operational events from one
                streamlined workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${subtleSurfaceClassName}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${mutedTextClassName}`}>Mentors</p>
              <p className={`mt-2 text-2xl font-bold ${titleClassName}`}>{stats?.pendingMentors ?? 0}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${subtleSurfaceClassName}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${mutedTextClassName}`}>Societies</p>
              <p className={`mt-2 text-2xl font-bold ${titleClassName}`}>{stats?.pendingSocieties ?? 0}</p>
            </div>
            <div className={`col-span-2 rounded-2xl border p-4 sm:col-span-1 ${subtleSurfaceClassName}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${mutedTextClassName}`}>Queue Status</p>
              <p className={`mt-2 text-lg font-medium ${titleClassName}`}>
                {queuedItems.length === 0 ? "All clear" : "Needs review"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          icon={statCards[0].icon}
          label={statCards[0].label}
          color={statCards[0].color}
          value={stats?.totalActiveUsers ?? 0}
        />
        <AdminStatCard
          icon={statCards[1].icon}
          label={statCards[1].label}
          color={statCards[1].color}
          value={stats?.pendingApprovals ?? requests.length}
        />
        <AdminStatCard
          icon={statCards[2].icon}
          label={statCards[2].label}
          color={statCards[2].color}
          value={stats?.activeSessions ?? 0}
        />
        <AdminStatCard
          icon={statCards[3].icon}
          label={statCards[3].label}
          color={statCards[3].color}
          value={stats?.activeSocieties ?? stats?.totalSocieties ?? 0}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div
          className={`rounded-[28px] border ${surfaceClassName}`}
          style={{
            boxShadow: isDark
              ? "0 24px 60px rgba(0,0,0,0.22)"
              : "0 24px 60px rgba(15,23,42,0.08)",
          }}
        >
          <div
            className={`flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-border-dark" : "border-border-light"}`}
          >
            <div>
              <h2 className={`text-xl font-semibold ${titleClassName}`}>Approval Queue</h2>
              <p className={`mt-1 text-sm ${mutedTextClassName}`}>
                Review mentor, society, event, and study-group requests that still need action.
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                isDark
                  ? "border-border-dark bg-background-dark text-text-secondary-dark"
                  : "border-border-light bg-surface-muted text-text-secondary-light"
              }`}
            >
              Priority actions
            </span>
          </div>

          <div className="p-5 sm:p-6">
            {queuedItems.length > 0 ? (
              <div className="space-y-3">
                {queuedItems.map((item) => {
                  const meta = REQUEST_META[item.requestType] || REQUEST_META.society;
                  const title =
                    item.name ||
                    item.title ||
                    item.userId?.profile?.displayName ||
                    item.createdBy?.profile?.displayName ||
                    item.coordinatorId?.profile?.displayName ||
                    "Pending request";

                  return (
                    <div
                      key={item._id}
                      className={`flex flex-col gap-4 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between ${subtleSurfaceClassName}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                          style={{ backgroundColor: meta.tone }}
                        >
                          {meta.icon}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${titleClassName}`}>{title}</div>
                          <div className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${mutedTextClassName}`}>
                            {meta.badge}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAction(item._id, item.requestType, "approve")}
                          className={getButtonClassName({ variant: "primary", size: "sm" })}
                        >
                          {item.requestType === "mentor" ? "Verify" : "Approve"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest({ _id: item._id, requestType: item.requestType });
                            setShowRejectModal(true);
                          }}
                          className={getButtonClassName({ variant: "secondary", size: "sm" })}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`rounded-[24px] border px-6 py-12 text-center ${subtleSurfaceClassName}`}
              >
                <div className="mb-3 text-3xl">✨</div>
                <div className={`text-lg font-medium ${titleClassName}`}>Approval Queue Empty</div>
                <div className={`mt-2 text-sm ${mutedTextClassName}`}>
                  All service requests have been processed.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <LiveEventFeed events={liveEvents} />
        </div>
      </section>

      {showRejectModal && (
        <ReasonModal
          title={`Decline ${selectedRequest?.requestType?.replace("_", " ")} Application`}
          onClose={({ confirmed, reason }) => {
            if (confirmed) {
              handleAction(selectedRequest._id, selectedRequest.requestType, "reject", reason);
            }
            setShowRejectModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
