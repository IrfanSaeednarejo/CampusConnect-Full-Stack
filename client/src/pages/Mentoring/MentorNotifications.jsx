import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectNotifications as selectAllNotifications, selectUnreadCount, markAsRead, markAllAsRead, removeNotification } from "../../redux/slices/notificationSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function MentorNotifications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Notifications fetched globally
  }, [dispatch]);

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
    () =>
      activeTab === "all"
        ? notifications
        : notifications.filter((n) => !n.read),
    [activeTab, notifications]
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[#1dc964] text-sm font-semibold hover:text-white transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All notifications read"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[#30363d]">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "all"
                    ? "text-[#1dc964] border-b-2 border-[#1dc964]"
                    : "text-[#9eb7a9] hover:text-white"
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
                    : "text-[#9eb7a9] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined">
                  mark_email_unread
                </span>
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                      notification.read
                        ? "bg-[#161b22] border-[#30363d]"
                        : "bg-[#1dc964]/10 border-[#1dc964]/50 hover:border-[#1dc964]"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${notification.color}20` }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: notification.color }}
                      >
                        {notification.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${notification.read ? "text-[#9eb7a9]" : "text-white"}`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${notification.read ? "text-[#9eb7a9]" : "text-[#c9d1d9]"}`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-[#9eb7a9] text-xs mt-2">
                            {notification.timestamp}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#1dc964] mt-1"></div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-[#1dc964] hover:text-white transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">
                              done
                            </span>
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-xs text-[#9eb7a9] hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-[#9eb7a9]">
                  notifications_off
                </span>
                <div>
                  <p className="text-white text-lg font-bold">
                    No {activeTab === "unread" ? "unread " : ""}notifications
                  </p>
                  <p className="text-[#9eb7a9] text-sm">
                    You're all caught up!
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
