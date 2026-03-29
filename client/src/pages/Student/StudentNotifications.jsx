import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNotifications as selectAllNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from "../../redux/slices/notificationSlice";
import EmptyState from "../../components/common/EmptyState";

export default function StudentNotifications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all"); // all, unread, announcements, events, messages

  const notificationsList = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => {
  }, [dispatch]);

  const filteredNotifications = useMemo(
    () =>
      notificationsList.filter((notif) => {
        if (filter === "all") return true;
        if (filter === "unread") return !notif.read;
        if (filter === "announcements") return notif.type === "announcement";
        if (filter === "events") return notif.type === "event";
        if (filter === "messages") return notif.type === "message";
        return true;
      }),
    [notificationsList, filter]
  );

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (id) => {
    dispatch(removeNotification(id));
  };

  const handleNotificationClick = (notif) => {
    // Mark as read
    handleMarkAsRead(notif.id);

    // Navigate based on type
    if (notif.type === "event") {
      navigate("/student/events");
    } else if (notif.type === "message") {
      navigate("/student/messages");
    } else if (notif.type === "announcement") {
      navigate("/student/societies");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/student/dashboard")}
                className="flex items-center gap-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  arrow_back
                </span>
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔔</span>
                <div>
                  <h1 className="text-2xl font-bold text-[#c9d1d9]">
                    Notifications
                  </h1>
                  <p className="text-sm text-[#8b949e]">
                    Stay updated with your campus activities
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-medium hover:bg-[#2ea043] transition-colors"
                >
                  Mark All Read ({unreadCount})
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
                  ? "bg-[#238636] text-white"
                  : "bg-[#161b22] text-[#8b949e] hover:bg-[#1c2128] hover:text-[#c9d1d9]"
                }`}
            >
              All ({notificationsList.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "unread"
                  ? "bg-[#238636] text-white"
                  : "bg-[#161b22] text-[#8b949e] hover:bg-[#1c2128] hover:text-[#c9d1d9]"
                }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("announcements")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "announcements"
                  ? "bg-[#238636] text-white"
                  : "bg-[#161b22] text-[#8b949e] hover:bg-[#1c2128] hover:text-[#c9d1d9]"
                }`}
            >
              📢 Announcements
            </button>
            <button
              onClick={() => setFilter("events")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "events"
                  ? "bg-[#238636] text-white"
                  : "bg-[#161b22] text-[#8b949e] hover:bg-[#1c2128] hover:text-[#c9d1d9]"
                }`}
            >
              📅 Events
            </button>
            <button
              onClick={() => setFilter("messages")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "messages"
                  ? "bg-[#238636] text-white"
                  : "bg-[#161b22] text-[#8b949e] hover:bg-[#1c2128] hover:text-[#c9d1d9]"
                }`}
            >
              💬 Messages
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon="notifications"
            title="No notifications"
            description={
              filter === "unread"
                ? "You're all caught up! No unread notifications."
                : filter === "all"
                  ? "You don't have any notifications yet."
                  : `No ${filter} notifications at the moment.`
            }
            iconSize="6xl"
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-[#161b22] border rounded-lg p-5 transition-all hover:border-[#238636]/50 ${notif.read
                    ? "border-[#30363d] opacity-80"
                    : "border-[#238636]/30 bg-[#238636]/5"
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 rounded-full p-3 ${notif.read
                        ? "bg-[#30363d]/50 text-[#8b949e]"
                        : "bg-[#238636]/20 text-[#238636]"
                      }`}
                  >
                    <span className="text-2xl">{notif.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3
                          className={`text-base font-semibold mb-1 ${notif.read ? "text-[#8b949e]" : "text-[#c9d1d9]"
                            }`}
                        >
                          {notif.title}
                          {!notif.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-[#238636] rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-sm text-[#8b949e] mb-2">
                          {notif.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              schedule
                            </span>
                            {notif.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              source
                            </span>
                            {notif.source}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-2">
                        {!notif.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                            className="text-[#8b949e] hover:text-[#238636] transition-colors"
                            title="Mark as read"
                          >
                            <span className="material-symbols-outlined text-xl">
                              done
                            </span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.id);
                          }}
                          className="text-[#8b949e] hover:text-[#da3633] transition-colors"
                          title="Delete notification"
                        >
                          <span className="material-symbols-outlined text-xl">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleNotificationClick(notif)}
                      className="mt-3 px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-medium hover:bg-[#2ea043] transition-colors"
                    >
                      {notif.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#238636]">
                {notificationsList.length}
              </div>
              <div className="text-sm text-[#8b949e] mt-1">
                Total Notifications
              </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#238636]">
                {unreadCount}
              </div>
              <div className="text-sm text-[#8b949e] mt-1">Unread</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#238636]">
                {notificationsList.length - unreadCount}
              </div>
              <div className="text-sm text-[#8b949e] mt-1">Read</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
