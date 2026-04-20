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
                width: 260,
                background: "#111827",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #1f2937",
                position: "fixed",
                height: "100vh",
                overflowY: "auto"
            }}>
                <div style={{ padding: "32px 24px", borderBottom: "1px solid #1f2937" }}>
                    <div style={{ 
                        fontSize: 20, 
                        fontWeight: 800, 
                        letterSpacing: "-0.025em",
                        background: "linear-gradient(to right, #6366f1, #a855f7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        CampusConnect
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500, marginTop: 4 }}>
                        CONTROL CENTER
                    </div>
                </div>

                {isSuperAdmin && (
                    <div style={{ padding: "16px 20px" }}>
                        <select
                            value={selectedCampus || ""}
                            onChange={(e) => dispatch(setSelectedCampus(e.target.value || null))}
                            style={{
                                width: "100%", background: "#1f2937", color: "#f3f4f6",
                                border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", fontSize: 13,
                                outline: "none", cursor: "pointer"
                            }}
                        >
                            <option value="">Global Perspective</option>
                            {/* Campus mappings would go here */}
                        </select>
                    </div>
                )}

                <nav style={{ flex: 1, padding: "0 12px 24px" }}>
                    {NAV_GROUPS.map((group, gIdx) => (
                        <div key={gIdx} style={{ marginTop: 24 }}>
                            <div style={{ 
                                paddingLeft: 12, 
                                fontSize: 11, 
                                fontWeight: 700, 
                                color: "#4b5563", 
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: 8
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
                                            padding: "10px 12px",
                                            color: isActive ? "#fff" : "#9ca3af",
                                            background: isActive ? "rgba(99, 102, 241, 0.1)" : "transparent",
                                            textDecoration: "none",
                                            fontSize: 14,
                                            fontWeight: isActive ? 600 : 500,
                                            borderRadius: 8,
                                            marginBottom: 2,
                                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                        })}
                                    >
                                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {badgeVal > 0 && (
                                            <span style={{
                                                background: item.badge === "pendingTotal" ? "#ef4444" : "#4f46e5",
                                                color: "#fff",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: "2px 8px",
                                                borderRadius: 99,
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
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

                <div style={{ padding: "20px", borderTop: "1px solid #1f2937", background: "#111827" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: systemStatus.connected ? "#10b981" : "#f43f5e",
                            boxShadow: systemStatus.connected ? "0 0 8px rgba(16, 185, 129, 0.4)" : "none"
                        }} />
                        <span style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500 }}>
                            {systemStatus.connected ? "System Online" : "System Offline"}
                        </span>
                    </div>
                    {systemStatus.maintenanceMode && (
                        <div style={{
                            marginTop: 12, padding: "8px", background: "rgba(245, 158, 11, 0.1)",
                            color: "#f59e0b", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            textAlign: "center", border: "1px solid rgba(245, 158, 11, 0.2)"
                        }}>
                            ⚠ MAINTENANCE MODE ACTIVE
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ 
                flex: 1, 
                marginLeft: 260,
                minHeight: "100vh",
                overflowX: "hidden"
            }}>
                <div style={{ padding: "40px" }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export { AdminApp };
export default AdminApp;
