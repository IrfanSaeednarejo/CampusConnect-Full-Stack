import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { io as socketIO } from "socket.io-client";
import {
    pushLiveEvent,
    setPendingCounts,
    setSystemStatus,
    setSelectedCampus,
    selectSystemStatus,
    selectPendingCounts,
    selectSelectedCampus,
} from "../redux/slices/adminSlice";
import { getDashboardStats } from "../api/adminApi";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const NAV_GROUPS = [
    {
        title: "Main",
        items: [
            { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
            { to: "/admin/requests", label: "Requests", icon: "📨", badge: "pendingTotal" },
        ]
    },
    {
        title: "Governance",
        items: [
            { to: "/admin/users", label: "Users", icon: "👥" },
            { to: "/admin/mentors", label: "Mentors", icon: "🎓", badge: "mentors" },
            { to: "/admin/societies", label: "Societies", icon: "🏛️", badge: "societies" },
        ]
    },
    {
        title: "Operations",
        items: [
            { to: "/admin/events", label: "Events", icon: "📅" },
            { to: "/admin/study-groups", label: "Study Groups", icon: "📚" },
            { to: "/admin/notifications", label: "Broadcaster", icon: "🔔" },
        ]
    },
    {
        title: "Audit & System",
        items: [
            { to: "/admin/analytics", label: "Insights", icon: "📈" },
            { to: "/admin/audit-logs", label: "Audit Logs", icon: "🔍" },
            { to: "/admin/system", label: "System Control", icon: "⚙️", superOnly: true },
        ]
    }
];

const AdminApp = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const systemStatus = useSelector(selectSystemStatus);
    const pendingCounts = useSelector(selectPendingCounts);
    const selectedCampus = useSelector(selectSelectedCampus);
    const isSuperAdmin = user?.roles?.includes("super_admin");

    useEffect(() => {
        getDashboardStats()
            .then(({ data }) => {
                if (data?.data) {
                    dispatch(setPendingCounts({
                        mentors: data.data.pendingMentors || 0,
                        societies: data.data.pendingSocieties || 0,
                        events: data.data.pendingEvents || 0,
                        studyGroups: data.data.pendingStudyGroups || 0,
                    }));
                }
            })
            .catch(() => {});
    }, [dispatch]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken") || "";
        const socket = socketIO(`${SOCKET_URL}/admin`, {
            auth: { token },
            reconnection: true,
        });

        socket.on("connect", () => dispatch(setSystemStatus({ connected: true })));
        socket.on("disconnect", () => dispatch(setSystemStatus({ connected: false })));

        socket.on("admin:refresh_counts", () => {
             getDashboardStats().then(({ data }) => {
                if (data?.data) dispatch(setPendingCounts(data.data));
             });
        });

        return () => socket.disconnect();
    }, [dispatch]);

    const pendingTotal = (pendingCounts.mentors || 0) + (pendingCounts.societies || 0) + (pendingCounts.events || 0) + (pendingCounts.studyGroups || 0);

    return (
        <div style={{ 
            display: "flex", 
            minHeight: "100vh", 
            background: "#0a0f1e", 
            color: "#f8fafc",
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Sidebar */}
            <aside style={{
                width: 280,
                background: "#0f172a",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #1e293b",
                position: "fixed",
                height: "100vh",
                zIndex: 50,
                overflowY: "auto"
            }}>
                <div style={{ padding: "32px 24px", borderBottom: "1px solid #1e293b" }}>
                    <div style={{ 
                        fontSize: 22, 
                        fontWeight: 900, 
                        letterSpacing: "-0.04em",
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        CampusConnect
                    </div>
                    <div style={{ color: "#64748b", fontSize: 10, fontWeight: 800, marginTop: 4, letterSpacing: "0.1em" }}>
                        ADMINISTRATIVE PORTAL
                    </div>
                </div>

                {isSuperAdmin && (
                    <div style={{ padding: "16px 20px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, paddingLeft: 4 }}>
                            CAMPUS PERSPECTIVE
                        </div>
                        <select
                            value={selectedCampus || ""}
                            onChange={(e) => dispatch(setSelectedCampus(e.target.value || null))}
                            style={{
                                width: "100%", background: "#1e293b", color: "#f1f5f9",
                                border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", fontSize: 13,
                                outline: "none", cursor: "pointer", transition: "border-color 0.2s"
                            }}
                        >
                            <option value="">Global Overview</option>
                            {/* Campus mappings would go here */}
                        </select>
                    </div>
                )}

                <nav style={{ flex: 1, padding: "0 14px 24px" }}>
                    {NAV_GROUPS.map((group, gIdx) => (
                        <div key={gIdx} style={{ marginTop: 28 }}>
                            <div style={{ 
                                paddingLeft: 12, 
                                fontSize: 11, 
                                fontWeight: 800, 
                                color: "#475569", 
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 10
                            }}>
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
                                            color: isActive ? "#fff" : "#94a3b8",
                                            background: isActive ? "linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)" : "transparent",
                                            borderLeft: isActive ? "3px solid #6366f1" : "3px solid transparent",
                                            textDecoration: "none",
                                            fontSize: 14,
                                            fontWeight: isActive ? 600 : 500,
                                            borderRadius: "0 8px 8px 0",
                                            marginLeft: -14, // align with padding
                                            paddingLeft: isActive ? 11 : 14,
                                            marginBottom: 4,
                                            transition: "all 0.2s",
                                        })}
                                    >
                                        <span style={{ fontSize: 18, opacity: 0.9 }}>{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {badgeVal > 0 && (
                                            <span style={{
                                                background: item.badge === "pendingTotal" ? "#f43f5e" : "#6366f1",
                                                color: "#fff",
                                                fontSize: 10,
                                                fontWeight: 800,
                                                padding: "2px 8px",
                                                borderRadius: 20,
                                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                            }}>
                                                {badgeVal}
                                            </span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div style={{ padding: "20px", borderTop: "1px solid #1e293b", background: "#0f172a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 12, background: "#1e293b" }}>
                        <div style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: systemStatus.connected ? "#10b981" : "#f43f5e",
                            boxShadow: systemStatus.connected ? "0 0 12px rgba(16, 185, 129, 0.6)" : "none"
                        }} />
                        <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>
                            {systemStatus.connected ? "Operational" : "Offline"}
                        </span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                marginLeft: 280,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh"
            }}>
                {/* Topbar */}
                <header style={{
                    height: 72,
                    background: "rgba(10, 15, 30, 0.8)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid #1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 40px",
                    position: "sticky",
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                            {location.pathname.split("/").pop()?.replace(/-/g, " ").toUpperCase() || "DASHBOARD"}
                        </h1>
                        <span style={{ color: "#475569", fontSize: 14 }}>/</span>
                        <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>Control Room</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        {/* Server Status Indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>ID:</span>
                            <code style={{ fontSize: 12, color: "#94a3b8", background: "#1e293b", padding: "2px 6px", borderRadius: 4 }}>
                                {user?.id?.slice(-6).toUpperCase() || "ADMIN"}
                            </code>
                        </div>

                        {/* Logout - strictly functional, no profile */}
                        <NavLink to="/logout" style={{ 
                            padding: "8px 16px", 
                            background: "rgba(244, 63, 94, 0.1)", 
                            color: "#f43f5e",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: "none",
                            border: "1px solid rgba(244, 63, 94, 0.2)",
                            transition: "all 0.2s"
                        }}>
                            TERMINATE SESSION
                        </NavLink>
                    </div>
                </header>

                {/* Content Outlet */}
                <main style={{ 
                    flex: 1, 
                    padding: "40px",
                    background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent)"
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export { AdminApp };
export default AdminApp;
