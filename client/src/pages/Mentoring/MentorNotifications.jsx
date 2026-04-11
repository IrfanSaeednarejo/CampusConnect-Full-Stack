import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification as deleteNotificationApi } from "../../api/notificationApi";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import SharedFooter from "../../components/common/SharedFooter";

export default function MentorNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserNotifications();
      const items = res.data?.docs || res.data || [];
      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err?.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const handleMarkAsRead = async (id) => {
    setActionLoading(id);
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading("all");
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNotifications = useMemo(
    () =>
      activeTab === "all"
        ? notifications
        : notifications.filter((n) => !n.read),
    [activeTab, notifications]
  );

  const getNotificationIcon = (type) => {
    const icons = {
      session_booked: "calendar_add_on",
      rating_received: "star",
      message: "mail",
      payment: "attach_money",
      feedback_pending: "rate_review",
      mentor_verified: "verified",
      booking_confirmed: "event_available",
      booking_cancelled: "event_busy",
    };
    return icons[type] || "notifications";
  };

  const getNotificationColor = (type) => {
    const colors = {
      session_booked: "#4F46E5",
      rating_received: "#fbbf24",
      message: "#3b82f6",
      payment: "#10b981",
      feedback_pending: "#f87171",
      mentor_verified: "#4F46E5",
      booking_confirmed: "#4F46E5",
      booking_cancelled: "#f87171",
    };
    return colors[type] || "#9eb7a9";
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary group/design-root overflow-x-hidden bg-background">
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-text-primary text-4xl font-black leading-tight tracking-[-0.033em]">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={actionLoading === "all"}
                    className="text-primary text-sm font-semibold hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "all" ? "Marking..." : "Mark all as read"}
                  </button>
                )}
              </div>
              <p className="text-text-secondary text-base font-normal leading-normal">
                {loading
                  ? "Loading notifications..."
                  : unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "All notifications read"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${activeTab === "all"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <span className="material-symbols-outlined">list</span>
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${activeTab === "unread"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <span className="material-symbols-outlined">mark_email_unread</span>
                Unread ({unreadCount})
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-secondary">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const nId = notification._id || notification.id;
                  const nType = notification.type || "message";
                  const icon = getNotificationIcon(nType);
                  const color = getNotificationColor(nType);

                  return (
                    <div
                      key={nId}
                      className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${notification.read
                          ? "bg-surface border-border"
                          : "bg-primary/10 border-primary/50 hover:border-primary"
                        }`}
                    >
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color }}
                        >
                          {icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${notification.read ? "text-text-secondary" : "text-text-primary"}`}
                            >
                              {notification.title || nType.replace(/_/g, " ")}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${notification.read ? "text-text-secondary" : "text-text-primary"}`}
                            >
                              {notification.message || notification.body || ""}
                            </p>
                            <p className="text-text-secondary text-xs mt-2">
                              {formatTimestamp(notification.createdAt || notification.timestamp)}
                            </p>
                          </div>

                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1"></div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(nId)}
                              disabled={actionLoading === nId}
                              className="text-xs text-primary hover:text-text-primary transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">done</span>
                              {actionLoading === nId ? "..." : "Mark as read"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(nId)}
                            disabled={actionLoading === nId}
                            className="text-xs text-text-secondary hover:text-red-400 transition-colors flex items-center gap-1 ml-auto disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-text-secondary">
                  notifications_off
                </span>
                <div>
                  <p className="text-text-primary text-lg font-bold">
                    No {activeTab === "unread" ? "unread " : ""}notifications
                  </p>
                  <p className="text-text-secondary text-sm">
                    You're all caught up!
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        <SharedFooter />
      </div>
    </div>
  );
}
