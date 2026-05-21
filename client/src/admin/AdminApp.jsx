import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";
import { io as socketIO } from "socket.io-client";
import useHomeTheme from "@/hooks/useHomeTheme";
import { useTheme } from "@/hooks/useTheme";
import { useSocketListener } from "../hooks/useSocket";
import {
  pushLiveEvent,
  setDashboardStats,
  setPendingCounts,
  setSystemStatus,
  setSelectedCampus,
  selectSystemStatus,
  selectPendingCounts,
  selectSelectedCampus,
} from "../redux/slices/adminSlice";
import { getDashboardStats } from "../api/adminApi";
import AdminNotificationBell from "./components/AdminNotificationBell";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const NAV_GROUPS = [
  {
    title: "Main",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/admin/requests", label: "Requests", icon: "inbox", badge: "pendingTotal" },
    ],
  },
  {
    title: "Governance",
    items: [
      { to: "/admin/users", label: "Users", icon: "groups" },
      { to: "/admin/mentors", label: "Mentors", icon: "school", badge: "mentors" },
      { to: "/admin/societies", label: "Societies", icon: "account_balance", badge: "societies" },
      { to: "/admin/moderation", label: "Moderation", icon: "shield" },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/admin/events", label: "Events", icon: "calendar_month", badge: "events" },
      { to: "/admin/study-groups", label: "Study Groups", icon: "library_books" },
      { to: "/admin/notifications", label: "Broadcaster", icon: "notifications" },
    ],
  },
  {
    title: "Audit & System",
    items: [
      { to: "/admin/analytics", label: "Insights", icon: "query_stats" },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: "manage_search" },
      { to: "/admin/system", label: "System Control", icon: "settings", superOnly: true },
    ],
  },
];

const AdminApp = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const systemStatus = useSelector(selectSystemStatus);
  const pendingCounts = useSelector(selectPendingCounts);
  const selectedCampus = useSelector(selectSelectedCampus);
  const isSuperAdmin = user?.roles?.includes("super_admin");
  const isDark = useHomeTheme();
  const { toggleTheme } = useTheme();
  const notifyDashboardRefresh = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-dashboard-refresh"));
    }
  }, []);

  const refreshDashboardCounts = useCallback(() => {
    getDashboardStats()
      .then(({ data }) => {
        if (data?.data) {
          dispatch(setDashboardStats(data.data));
          dispatch(
            setPendingCounts({
              mentors: data.data.pendingMentors || 0,
              societies: data.data.pendingSocieties || 0,
              events: data.data.pendingEvents || 0,
              studyGroups: data.data.pendingStudyGroups || 0,
            })
          );
          notifyDashboardRefresh();
        }
      })
      .catch(() => {});
  }, [dispatch, notifyDashboardRefresh]);

  useEffect(() => {
    refreshDashboardCounts();
  }, [refreshDashboardCounts]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshDashboardCounts();
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [refreshDashboardCounts]);

  useSocketListener("notification:new", (notification) => {
    if (!["admin", "system"].includes(notification?.type)) return;
    refreshDashboardCounts();
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || "";

    const socket = socketIO(`${SOCKET_URL}/admin`, {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.info("[AdminSocket] Connected to /admin namespace");
      dispatch(setSystemStatus({ connected: true }));
    });

    socket.on("disconnect", () => {
      dispatch(setSystemStatus({ connected: false }));
    });

    socket.on("connect_error", (err) => {
      console.error("[AdminSocket] Connection error:", err.message);
    });

    socket.on("admin:refresh_counts", () => {
      refreshDashboardCounts();
    });

    const handleAdminActivity = (eventType) => (payload) => {
      dispatch(
        pushLiveEvent({
          ...payload,
          type: eventType,
        })
      );
      refreshDashboardCounts();
    };

    socket.on("admin:user_registered", handleAdminActivity("admin:user_registered"));
    socket.on("admin:mentor_applied", handleAdminActivity("admin:mentor_applied"));
    socket.on("admin:society_created", handleAdminActivity("admin:society_created"));
    socket.on("admin:event_created", handleAdminActivity("admin:event_created"));
    socket.on("admin:booking_created", handleAdminActivity("admin:booking_created"));

    return () => {
      socket.disconnect();
    };
  }, [dispatch, refreshDashboardCounts]);

  const pendingTotal =
    (pendingCounts.mentors || 0) +
    (pendingCounts.societies || 0) +
    (pendingCounts.events || 0) +
    (pendingCounts.studyGroups || 0);

  const pageStyle = {
    display: "flex",
    minHeight: "100vh",
    background: "rgb(var(--color-background))",
    color: "rgb(var(--color-text-primary))",
    fontFamily: "'Inter', sans-serif",
  };

  const sidebarStyle = {
    width: 280,
    background: isDark ? "rgb(var(--color-surface-dark))" : "rgb(var(--color-surface-light))",
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
    position: "fixed",
    height: "100vh",
    zIndex: 50,
    overflowY: "auto",
    boxShadow: isDark ? "none" : "0 22px 48px rgba(15,23,42,0.08)",
  };

  const topbarStyle = {
    height: 72,
    background: isDark ? "rgba(10,16,28,0.82)" : "rgba(245,247,250,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    position: "sticky",
    top: 0,
    zIndex: 40,
  };

  const topbarIconButtonStyle = {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
    background: isDark ? "rgb(var(--color-surface-dark))" : "rgb(var(--color-surface-light))",
    color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
    boxShadow: isDark ? "none" : "0 8px 18px rgba(15,23,42,0.06)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const mainStyle = {
    flex: 1,
    marginLeft: 280,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  };

  return (
    <div style={pageStyle}>
      <aside className="scrollbar-thin" style={sidebarStyle}>
        <div style={{ padding: "32px 24px", borderBottom: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}` }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "rgb(var(--color-info))",
            }}
          >
            CampusNexus
          </div>
          <div
            style={{
              color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
              fontSize: 10,
              fontWeight: 800,
              marginTop: 4,
              letterSpacing: "0.1em",
            }}
          >
            ADMINISTRATIVE PORTAL
          </div>
        </div>

        {isSuperAdmin && (
          <div style={{ padding: "16px 20px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              CAMPUS PERSPECTIVE
            </div>
            <select
              value={selectedCampus || ""}
              onChange={(e) => dispatch(setSelectedCampus(e.target.value || null))}
              style={{
                width: "100%",
                background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))",
                color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
                border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                outline: "none",
                cursor: "pointer",
                transition: "border-color 0.2s",
                boxShadow: isDark ? "none" : "0 8px 18px rgba(15,23,42,0.04)",
              }}
            >
              <option value="">Global Overview</option>
            </select>
          </div>
        )}

        <nav style={{ flex: 1, padding: "0 14px 24px" }}>
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} style={{ marginTop: 28 }}>
              <div
                style={{
                  paddingLeft: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                {group.title}
              </div>
              {group.items.map((item) => {
                if (item.superOnly && !isSuperAdmin) return null;
                const badgeVal = item.badge === "pendingTotal" ? pendingTotal : pendingCounts[item.badge];

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      color: isActive
                        ? isDark
                          ? "rgb(var(--color-text-primary-dark))"
                          : "rgb(var(--color-text-primary-light))"
                        : isDark
                          ? "rgb(var(--color-text-secondary-dark))"
                          : "rgb(var(--color-text-secondary-light))",
                      background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
                      borderLeft: isActive ? `3px solid rgb(var(--color-info))` : "3px solid transparent",
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      borderRadius: "0 8px 8px 0",
                      marginLeft: -14,
                      paddingLeft: isActive ? 11 : 14,
                      marginBottom: 4,
                      transition: "all 0.2s",
                    })}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, opacity: 0.9 }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {badgeVal > 0 && (
                      <span
                        style={{
                          background: item.badge === "pendingTotal" ? "rgb(var(--color-danger))" : "rgb(var(--color-info))",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: 20,
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                      >
                        {badgeVal}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div
          style={{
            padding: "20px",
            borderTop: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
            background: isDark ? "rgb(var(--color-surface-dark))" : "rgb(var(--color-surface-light))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 12px",
              borderRadius: 12,
              background: isDark ? "rgb(var(--color-surface-muted-dark))" : "rgb(var(--color-surface-muted-light))",
              border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: systemStatus.connected ? "rgb(var(--color-success))" : "rgb(var(--color-danger))",
                boxShadow: systemStatus.connected ? "0 0 12px rgba(16, 185, 129, 0.6)" : "none",
              }}
            />
            <span
              style={{
                color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {systemStatus.connected ? "Operational" : "Offline"}
            </span>
          </div>
        </div>
      </aside>

      <div style={mainStyle}>
        <header style={topbarStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
                margin: 0,
              }}
            >
              {location.pathname.split("/").pop()?.replace(/-/g, " ").toUpperCase() || "DASHBOARD"}
            </h1>
            <span style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", fontSize: 14 }}>/</span>
            <span
              style={{
                color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Control Room
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={topbarIconButtonStyle}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>

            <AdminNotificationBell onAdminSignal={refreshDashboardCounts} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                  fontWeight: 600,
                }}
              >
                ID:
              </span>
              <code
                style={{
                  fontSize: 12,
                  color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                  background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-surface-light))",
                  border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {user?.id?.slice(-6).toUpperCase() || "ADMIN"}
              </code>
            </div>

            <NavLink
              to="/logout"
              style={{
                padding: "8px 16px",
                background: isDark ? "rgba(220, 38, 38, 0.12)" : "rgba(220, 38, 38, 0.08)",
                color: "rgb(var(--color-danger))",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                border: `1px solid ${isDark ? "rgba(220, 38, 38, 0.2)" : "rgba(220, 38, 38, 0.18)"}`,
                transition: "all 0.2s",
              }}
            >
              TERMINATE SESSION
            </NavLink>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: "40px",
            background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export { AdminApp };
export default AdminApp;
