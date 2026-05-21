import { useState, useMemo } from "react";
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
import IconButton from "../../components/common/IconButton";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

export default function StudentNotifications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

  const notificationsList = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  const filteredNotifications = useMemo(
    () =>
      notificationsList.filter((notification) => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        if (filter === "announcements") return notification.type === "announcement";
        if (filter === "events") return notification.type === "event";
        if (filter === "messages") return notification.type === "message";
        return true;
      }),
    [notificationsList, filter]
  );

  const handleMarkAsRead = (id) => dispatch(markAsRead(id));
  const handleMarkAllAsRead = () => dispatch(markAllAsRead());
  const handleDeleteNotification = (id) => dispatch(removeNotification(id));

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);

    if (notification.type === "event") {
      navigate("/student/events");
    } else if (notification.type === "message") {
      navigate("/student/messages");
    } else if (notification.type === "announcement") {
      navigate("/student/societies");
    }
  };

  const filters = [
    { id: "all", label: `All (${notificationsList.length})` },
    { id: "unread", label: `Unread (${unreadCount})` },
    { id: "announcements", label: "Announcements" },
    { id: "events", label: "Events" },
    { id: "messages", label: "Messages" },
  ];

  return (
    <div className={cn("min-h-screen", theme.page)}>
      <header className={cn("sticky top-0 z-10 border-b backdrop-blur-sm", theme.header)}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/student/dashboard")}
                className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                <span>Back</span>
              </button>
              <div>
                <h1 className={cn("text-3xl font-bold", theme.text)}>Notifications</h1>
                <p className={cn("text-sm", theme.muted)}>Stay updated with your campus activities</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className={getButtonClassName({ variant: "primary", size: "md", isDark })}
              >
                Mark All Read ({unreadCount})
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={getButtonClassName({
                  variant: filter === item.id ? "primary" : "secondary",
                  size: "sm",
                  isDark,
                })}
              >
                {item.label}
              </button>
            ))}
          </div>

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
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-[24px] border p-5 transition-all",
                    notification.read ? theme.card : theme.elevatedCard
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-full p-3",
                        notification.read ? theme.badgeMuted : theme.badge
                      )}
                    >
                      <span className="text-2xl">{notification.emoji}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className={cn("mb-1 text-base font-semibold", notification.read ? theme.muted : theme.text)}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                            )}
                          </h3>
                          <p className={cn("mb-2 text-sm", theme.muted)}>{notification.description}</p>
                          <div className={cn("flex items-center gap-3 text-xs", theme.muted)}>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              {notification.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">source</span>
                              {notification.source}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          {!notification.read && (
                            <IconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              title="Mark as read"
                              variant="ghost"
                              size="icon-sm"
                              className={cn(theme.muted)}
                              icon="done"
                            />
                          )}
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            title="Delete notification"
                            variant="danger"
                            size="icon-sm"
                            icon="delete"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "mt-3" })}
                      >
                        {notification.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredNotifications.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className={cn("rounded-3xl border p-4 text-center", theme.card)}>
                <div className={cn("text-3xl font-bold", theme.text)}>{notificationsList.length}</div>
                <div className={cn("mt-1 text-sm", theme.muted)}>Total Notifications</div>
              </div>
              <div className={cn("rounded-3xl border p-4 text-center", theme.card)}>
                <div className={cn("text-3xl font-bold", theme.text)}>{unreadCount}</div>
                <div className={cn("mt-1 text-sm", theme.muted)}>Unread</div>
              </div>
              <div className={cn("rounded-3xl border p-4 text-center", theme.card)}>
                <div className={cn("text-3xl font-bold", theme.text)}>
                  {notificationsList.length - unreadCount}
                </div>
                <div className={cn("mt-1 text-sm", theme.muted)}>Read</div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
