import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNotifications as selectAllNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from "../../redux/slices/notificationSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import useHomeTheme from "@/hooks/useHomeTheme";

export default function MentorNotifications() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const isDark = useHomeTheme();

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {}, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (id) => {
    dispatch(removeNotification(id));
  };

  const filteredNotifications = useMemo(
    () => (activeTab === "all" ? notifications : notifications.filter((n) => !n.read)),
    [activeTab, notifications]
  );

  const pageClass = isDark ? "bg-[#112118] text-[#c9d1d9]" : "bg-slate-50 text-slate-900";
  const cardClass = isDark
    ? "bg-[#161b22] border-[#30363d]"
    : "bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]";
  const mutedText = isDark ? "text-[#9eb7a9]" : "text-slate-500";

  return (
    <div className={`relative flex h-auto min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden ${pageClass}`}>
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className={`text-4xl font-black leading-tight tracking-[-0.033em] ${isDark ? "text-white" : "text-slate-900"}`}>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className={`text-sm font-semibold transition-colors ${isDark ? "text-[#1dc964] hover:text-white" : "text-emerald-600 hover:text-emerald-700"}`}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <p className={`text-base font-normal leading-normal ${mutedText}`}>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All notifications read"}
              </p>
            </div>

            <div className={`flex gap-4 mb-6 border-b ${isDark ? "border-[#30363d]" : "border-slate-200"}`}>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "all"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : isDark
                      ? "text-[#9eb7a9] hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="material-symbols-outlined">list</span>
                All Notifications
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "unread"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : isDark
                      ? "text-[#9eb7a9] hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="material-symbols-outlined">mark_email_unread</span>
                Unread ({unreadCount})
              </button>
            </div>

            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                      notification.read
                        ? cardClass
                        : isDark
                          ? "bg-[#1dc964]/10 border-[#1dc964]/50 hover:border-[#1dc964]"
                          : "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                    }`}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${notification.color}20` }}
                    >
                      <span className="material-symbols-outlined" style={{ color: notification.color }}>
                        {notification.icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              notification.read ? mutedText : isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              notification.read ? mutedText : isDark ? "text-[#c9d1d9]" : "text-slate-700"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-2 ${mutedText}`}>{notification.timestamp}</p>
                        </div>

                        {!notification.read && <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#1dc964] mt-1" />}
                      </div>

                      <div className="flex gap-2 mt-4">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className={`text-xs transition-colors flex items-center gap-1 ${isDark ? "text-[#1dc964] hover:text-white" : "text-emerald-600 hover:text-emerald-700"}`}
                          >
                            <span className="material-symbols-outlined text-sm">done</span>
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className={`text-xs transition-colors flex items-center gap-1 ml-auto ${isDark ? "text-[#9eb7a9] hover:text-red-400" : "text-slate-500 hover:text-red-500"}`}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                <span className={`material-symbols-outlined text-6xl ${mutedText}`}>notifications_off</span>
                <div>
                  <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    No {activeTab === "unread" ? "unread " : ""}notifications
                  </p>
                  <p className={`text-sm ${mutedText}`}>You're all caught up!</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
