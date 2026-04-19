import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/adminApi";

export const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ page: 1, limit: 20 });
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        getAuditLogs(filters).then(({ data }) => {
            setLogs(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        }).catch(console.error);
    }, [filters]);

    const ACTION_COLORS = {
        USER_SUSPENDED: "#ef4444", USER_BANNED: "#7f1d1d",
        MENTOR_APPROVED: "#22c55e", SOCIETY_APPROVED: "#22c55e",
        NOTIFICATION_BROADCAST: "#6366f1", SYSTEM_MAINTENANCE_TOGGLED: "#f59e0b",
    };

    const inputStyle = {
        flex: 1, padding: "8px 12px", background: "#1e293b", border: "1px solid #334155",
        borderRadius: 6, color: "#f8fafc", fontSize: 14,
    };
    
    const queueCardStyle = {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", background: "#1e293b", borderRadius: 8, marginBottom: 8,
    };

    const rejectBtn = {
        padding: "4px 12px", background: "#dc2626", color: "#fff",
        border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
    };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Audit Logs</h1>

            {/* ── Filters ─────────────────────────────────── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input placeholder="Filter by action..." onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))} style={inputStyle} />
                <input type="date" onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} style={{ ...inputStyle, flex: "none", width: 150 }} />
                <input type="date" onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} style={{ ...inputStyle, flex: "none", width: 150 }} />
            </div>

            <div>
                {logs.map((log) => (
                    <div key={log._id} onClick={() => setSelected(log)} style={{ ...queueCardStyle, cursor: "pointer", marginBottom: 6 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <span style={{
                                padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                                background: ACTION_COLORS[log.action] || "#334155",
                            }}>
                                {log.action}
                            </span>
                            <span style={{ color: "#94a3b8", fontSize: 13 }}>
                                by {log.adminId?.profile?.displayName || "Unknown"}
                            </span>
                            {log.targetModel && (
                                <span style={{ color: "#64748b", fontSize: 12 }}>→ {log.targetModel}</span>
                            )}
                        </div>
                        <span style={{ color: "#64748b", fontSize: 12 }}>
                            {new Date(log.createdAt).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Detail Drawer ─────────────────────────── */}
            {selected && (
                <div style={{
                    position: "fixed", right: 0, top: 0, bottom: 0, width: 420,
                    background: "#1e293b", borderLeft: "1px solid #334155", padding: 24,
                    overflowY: "auto", zIndex: 100,
                }}>
                    <button onClick={() => setSelected(null)} style={{ ...rejectBtn, marginBottom: 16 }}>✕ Close</button>
                    <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{selected.action}</h3>
                    <pre style={{
                        background: "#0f172a", padding: 16, borderRadius: 8,
                        fontSize: 11, color: "#94a3b8", overflowX: "auto",
                    }}>
                        {JSON.stringify(selected.payload, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;
