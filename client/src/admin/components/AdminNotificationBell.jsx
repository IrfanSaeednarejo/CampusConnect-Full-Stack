import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import useHomeTheme from "@/hooks/useHomeTheme";
import { useSocketListener } from "../../hooks/useSocket";
import { getNotificationTarget } from "../../utils/notificationTargets";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const ADMIN_TYPES = new Set(["admin", "system"]);

function isAdminNotification(notification) {
  return ADMIN_TYPES.has(notification?.type);
}

export default function AdminNotificationBell({ onAdminSignal }) {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const requestConfig = useMemo(
    () => ({
      withCredentials: true,
      params: { scope: "admin" },
    }),
    []
  );

  const loadUnreadCount = useCallback(async () => {
    const { data } = await axios.get(`${API_URL}/notifications/unread-count`, requestConfig);
    setUnreadCount(data?.data?.unreadCount || 0);
  }, [requestConfig]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/notifications`, {
        ...requestConfig,
        params: { ...requestConfig.params, limit: 12 },
      });
      setNotifications(data?.data?.docs || []);
    } finally {
      setLoading(false);
    }
  }, [requestConfig]);

  useEffect(() => {
    loadUnreadCount().catch(() => {});
  }, [loadUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications().catch(() => {});
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useSocketListener("notification:new", (notification) => {
    if (!isAdminNotification(notification)) return;
    setNotifications((current) => {
      const next = [notification, ...current.filter((item) => item._id !== notification._id)];
      return next.slice(0, 12);
    });
    if (!notification.read) {
      setUnreadCount((current) => current + 1);
    }
    onAdminSignal?.(notification);
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await axios.patch(`${API_URL}/notifications/${notification._id}/read`, {}, { withCredentials: true });
      } catch {}
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, read: true } : item))
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    }

    navigate(getNotificationTarget(notification, { isAdmin: true }));
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, {}, requestConfig);
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const panelClass = isDark
    ? "border-border-dark bg-surface-dark shadow-2xl"
    : "border-border-light bg-surface-light shadow-[0_24px_60px_rgba(15,23,42,0.16)]";
  const subtleClass = isDark ? "text-text-secondary-dark" : "text-text-secondary-light";
  const titleClass = isDark ? "text-text-primary-dark" : "text-text-primary-light";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
          isDark
            ? "border-border-dark bg-surface-dark text-text-primary-dark hover:bg-container-dark"
            : "border-border-light bg-surface-light text-text-primary-light hover:bg-background-light"
        }`}
        aria-label="Admin notifications"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full z-50 mt-3 flex max-h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border ${panelClass}`}>
          <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? "border-border-dark" : "border-border-light"}`}>
            <div>
              <p className={`text-sm font-semibold ${titleClass}`}>Admin Alerts</p>
              <p className={`text-xs ${subtleClass}`}>Requests, reviews, and system notices</p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-info"
            >
              Mark all read
            </button>
          </div>

          <div className="scrollbar-thin flex-1 overflow-y-auto">
            {loading ? (
              <div className={`px-4 py-10 text-center text-sm ${subtleClass}`}>Loading admin alerts...</div>
            ) : notifications.length === 0 ? (
              <div className={`px-4 py-10 text-center text-sm ${subtleClass}`}>No admin alerts right now.</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full border-b px-4 py-3 text-left transition-colors ${
                    isDark
                      ? `border-border-dark hover:bg-container-dark ${!notification.read ? "bg-info/5" : ""}`
                      : `border-border-light hover:bg-background-light ${!notification.read ? "bg-info/5" : ""}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
                      <span className="material-symbols-outlined text-[18px]">
                        {notification.type === "system" ? "settings_alert" : "campaign"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${titleClass}`}>{notification.title}</p>
                      <p className={`mt-1 text-xs leading-5 ${subtleClass}`}>{notification.body}</p>
                      <p className={`mt-1 text-[11px] ${subtleClass}`}>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              navigate("/admin/notifications");
              setIsOpen(false);
            }}
            className={`border-t px-4 py-3 text-center text-xs font-semibold ${
              isDark
                ? "border-border-dark text-text-secondary-dark hover:bg-container-dark"
                : "border-border-light text-text-secondary-light hover:bg-background-light"
            }`}
          >
            Open Broadcaster
          </button>
        </div>
      )}
    </div>
  );
}
