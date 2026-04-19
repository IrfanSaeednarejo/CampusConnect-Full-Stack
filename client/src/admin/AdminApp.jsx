import { Outlet, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
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

const NAV_ITEMS = [
    { to: "/admin/dashboard",     label: "Dashboard",      icon: "📊" },
    { to: "/admin/users",         label: "Users",           icon: "👥" },
    { to: "/admin/mentors",       label: "Mentors",         icon: "🎓" },
    { to: "/admin/societies",     label: "Societies",       icon: "🏛️" },
    { to: "/admin/events",        label: "Events",          icon: "📅" },
    { to: "/admin/study-groups",  label: "Study Groups",    icon: "📚" },
    { to: "/admin/notifications", label: "Notifications",   icon: "🔔" },
    { to: "/admin/analytics",     label: "Analytics",       icon: "📈" },
    { to: "/admin/audit-logs",    label: "Audit Logs",      icon: "🔍" },
];

const SUPER_ONLY = { to: "/admin/system", label: "System", icon: "⚙️" };

const AdminApp = () => {
    const dispatch = useDispatch();
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
            reconnectionDelay: 2000,
        });

        socket.on("connect", () => {
            dispatch(setSystemStatus({ connected: true }));
        });

        socket.on("disconnect", () => {
            dispatch(setSystemStatus({ connected: false }));
        });

        const LIVE_EVENTS = [
            "admin:user_registered",
            "admin:mentor_applied",
            "admin:society_created",
            "admin:event_created",
            "admin:booking_created",
        ];

        LIVE_EVENTS.forEach((evt) => {
            socket.on(evt, (data) => {
                dispatch(pushLiveEvent({ type: evt, ...data }));
                if (evt === "admin:mentor_applied") {
                    dispatch(setPendingCounts({ mentors: (pendingCounts.mentors || 0) + 1 }));
                }
                if (evt === "admin:society_created") {
                    dispatch(setPendingCounts({ societies: (pendingCounts.societies || 0) + 1 }));
                }
            });
        });

        socket.on("admin:maintenance_toggled", ({ enabled }) => {
            dispatch(setSystemStatus({ maintenanceMode: enabled }));
        });

        return () => socket.disconnect();
    }, [dispatch]);

    const badgeStyle = {
        marginLeft: "auto",
        background: "#dc2626",
        color: "#fff",
        borderRadius: 9999,
        fontSize: 10,
        padding: "1px 6px",
        fontWeight: 700,
        minWidth: 18,
        textAlign: "center",
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
            <aside style={{
                width: 240,
                background: "#1e293b",
                padding: "24px 0",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #334155",
            }}>
                <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #334155" }}>
                    <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 18 }}>
                        CampusConnect
                    </div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Admin Portal</div>
                    {systemStatus.maintenanceMode && (
                        <div style={{
                            marginTop: 8, padding: "4px 8px", background: "#92400e",
                            color: "#fbbf24", borderRadius: 4, fontSize: 11, fontWeight: 600,
                        }}>
                            ⚠ MAINTENANCE MODE
                        </div>
                    )}
                </div>

                {isSuperAdmin && (
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155" }}>
                        <select
                            value={selectedCampus || ""}
                            onChange={(e) => dispatch(setSelectedCampus(e.target.value || null))}
                            style={{
                                width: "100%", background: "#0f172a", color: "#f8fafc",
                                border: "1px solid #334155", borderRadius: 6, padding: "6px 8px", fontSize: 12,
                            }}
                        >
                            <option value="">All Campuses</option>
                        </select>
                    </div>
                )}

                <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 24px",
                                color: isActive ? "#f8fafc" : "#94a3b8",
                                background: isActive ? "#0f172a" : "transparent",
                                textDecoration: "none",
                                fontSize: 14,
                                borderLeft: isActive ? "3px solid #6366f1" : "3px solid transparent",
                                transition: "all 0.15s",
                            })}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.label === "Mentors" && pendingCounts.mentors > 0 && (
                                <span style={badgeStyle}>{pendingCounts.mentors}</span>
                            )}
                            {item.label === "Societies" && pendingCounts.societies > 0 && (
                                <span style={badgeStyle}>{pendingCounts.societies}</span>
                            )}
                        </NavLink>
                    ))}

                    {isSuperAdmin && (
                        <NavLink
                            to={SUPER_ONLY.to}
                            style={({ isActive }) => ({
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 24px", color: isActive ? "#f8fafc" : "#94a3b8",
                                background: isActive ? "#0f172a" : "transparent",
                                textDecoration: "none", fontSize: 14,
                                borderLeft: isActive ? "3px solid #f59e0b" : "3px solid transparent",
                            })}
                        >
                            <span>{SUPER_ONLY.icon}</span>
                            <span>{SUPER_ONLY.label}</span>
                        </NavLink>
                    )}
                </nav>

                <div style={{ padding: "16px 24px", borderTop: "1px solid #334155" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: systemStatus.connected ? "#22c55e" : "#ef4444",
                        }} />
                        <span style={{ color: "#64748b", fontSize: 12 }}>
                            {systemStatus.connected ? "Live" : "Disconnected"}
                        </span>
                    </div>
                </div>
            </aside>

            <main style={{ flex: 1, padding: 32, color: "#f8fafc", overflowY: "auto" }}>
                <Outlet />
            </main>
        </div>
    );
};

export { AdminApp };
export default AdminApp;
