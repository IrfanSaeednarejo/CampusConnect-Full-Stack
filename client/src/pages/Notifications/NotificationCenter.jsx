import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectNotifications,
  fetchNotifications,
  markReadThunk,
  markAllReadThunk,
  selectNotificationLoading,
} from "../../redux/slices/notificationSlice";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import { selectUser } from "../../redux/slices/authSlice";
import { getNotificationTarget } from "../../utils/notificationTargets";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "../../hooks/useLanguage";

export default function NotificationCenter() {
  const isDark = useHomeTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications) || [];
  const loading = useSelector(selectNotificationLoading);
  const user = useSelector(selectUser);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const isAdmin = Array.isArray(user?.roles)
    ? user.roles.some((role) => ["admin", "super_admin", "campus_admin"].includes(role))
    : false;

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

  const tabs = [
    { id: "all", label: t("notifications.tab.all"), icon: "notifications" },
    { id: "activity", label: t("notifications.tab.activity"), icon: "interests" },
    { id: "mentions", label: t("notifications.tab.messages"), icon: "chat" },
    { id: "system", label: t("notifications.tab.system"), icon: "developer_board" },
  ];

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true;

    if (activeTab === "mentions") {
      return ["chat_message", "message"].includes(notif.type);
    }

    if (activeTab === "system") {
      return ["system", "admin", "nexus_action"].includes(notif.type);
    }

    if (activeTab === "activity") {
      return [
        "event_reminder",
        "event_update",
        "event_registration",
        "society_invite",
        "society_update",
        "mentor_booking",
        "mentor_reminder",
        "mentor_review",
        "studygroup_invite",
        "studygroup_update",
        "task_reminder",
        "task_created",
        "task_completed",
        "connection_request",
        "connection_accepted",
        "profile_view",
      ].includes(notif.type);
    }

    return true;
  });

  const getIconForType = (type) => {
    if (type?.includes("event")) return "event";
    if (type?.includes("society")) return "groups";
    if (type?.includes("mentor")) return "school";
    if (type?.includes("chat")) return "chat_bubble";
    if (type?.includes("studygroup")) return "local_library";
    if (type?.includes("task")) return "task_alt";
    if (type?.includes("connection")) return "person_add";
    if (type === "nexus_action") return "psychology";
    if (type === "admin") return "shield";
    return "notifications";
  };

  const getIconColorForType = (type) => {
    if (type?.includes("event")) return "bg-info/10 text-info";
    if (type?.includes("society")) return "bg-success/10 text-success";
    if (type?.includes("mentor")) return "bg-warning/10 text-warning";
    if (type?.includes("chat")) return "bg-primary/10 text-primary";
    if (type?.includes("connection")) return "bg-cyan-500/10 text-cyan-500";
    if (type?.includes("system") || type?.includes("admin")) {
      return isDark ? "bg-danger/10 text-danger" : "bg-danger/10 text-danger";
    }
    if (type === "nexus_action") return "bg-info/10 text-info";
    return isDark
      ? "border border-border-dark bg-background-dark text-text-secondary-dark"
      : "border border-border-light bg-surface-light text-text-secondary-light";
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      dispatch(markReadThunk(notif._id));
    }
    navigate(getNotificationTarget(notif, { isAdmin }));
  };

  return (
    <div
      className={`min-h-full p-6 lg:p-10 ${
        isDark
          ? "bg-background-dark text-text-primary-dark"
          : "bg-background-light text-text-primary-light"
      }`}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <PageHeader
          title={t("notifications.title")}
          subtitle={t("notifications.subtitle")}
          icon="notifications_active"
          isDark={isDark}
        />

        <div
          className={`min-h-[500px] overflow-hidden rounded-2xl border ${
            isDark
              ? "border-border-dark bg-surface-dark shadow-xl"
              : "border-border-light bg-surface-light shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
          }`}
        >
          <div
            className={`flex flex-col items-start justify-between gap-4 border-b px-6 sm:flex-row sm:items-center ${
              isDark
                ? "border-border-dark bg-background-dark"
                : "border-border-light bg-surface-light"
            }`}
          >
            <div className="hide-scrollbar flex-1 overflow-x-auto">
              <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
            </div>
            <button
              onClick={() => dispatch(markAllReadThunk())}
              className={getButtonClassName({
                variant: "ghost",
                size: "sm",
                className:
                  "min-w-0 shrink-0 rounded-lg px-3 py-4 text-[10px] font-semibold uppercase tracking-[0.08em]",
              })}
            >
              {t("notifications.archiveAll")}
            </button>
          </div>

          <div className="p-0">
            {loading && notifications.length === 0 ? (
              <div
                className={`p-10 text-center ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                }`}
              >
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <p className="text-sm">{t("notifications.loading")}</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative flex cursor-pointer items-start gap-4 border-b p-6 transition-all ${
                    isDark
                      ? `border-border-dark/50 hover:bg-[rgb(var(--color-surface-muted-dark)/1)] ${!notif.read ? "bg-primary/5" : ""}`
                      : `border-border-light hover:bg-[rgb(var(--color-surface-muted-light)/1)] ${!notif.read ? "bg-primary/5" : ""}`
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getIconColorForType(
                      notif.type
                    )}`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {getIconForType(notif.type)}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h4
                        className={`text-sm font-bold transition-colors ${
                          !notif.read
                            ? isDark
                              ? "text-text-primary-dark group-hover:text-primary"
                              : "text-text-primary-light group-hover:text-primary"
                            : isDark
                              ? "text-text-secondary-dark group-hover:text-text-primary-dark"
                              : "text-text-secondary-light group-hover:text-text-primary-light"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span
                        className={`mt-1 shrink-0 whitespace-nowrap font-mono text-[10px] ${
                          isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                        }`}
                      >
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p
                      className={`max-w-xl text-xs leading-relaxed ${
                        !notif.read
                          ? isDark
                            ? "text-text-primary-dark"
                            : "text-text-primary-light"
                          : isDark
                            ? "text-text-secondary-dark"
                            : "text-text-secondary-light"
                      }`}
                    >
                      {notif.body}
                    </p>
                  </div>

                  {!notif.read && (
                    <div className="absolute right-6 top-6 h-2 w-2 animate-pulse rounded-full bg-primary" />
                  )}
                </div>
              ))
            ) : (
              <div
                className={`p-10 text-center text-sm italic ${
                  isDark ? "text-text-secondary-dark/60" : "text-text-secondary-light/70"
                }`}
              >
                {t("notifications.emptyCategory")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
