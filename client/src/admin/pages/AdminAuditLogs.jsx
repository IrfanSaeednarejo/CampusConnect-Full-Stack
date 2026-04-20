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

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Governance Audit Trail</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Irreversible record of all administrative interactions, system changes, and policy enforcements.</p>
            </div>

            {/* ── Filters ─────────────────────────────────── */}
            <div style={{ 
                background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, 
                padding: "20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" 
            }}>
                <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>🔍</span>
                    <input 
                        placeholder="Filter by action signature..." 
                        onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))} 
                        style={inputStyle} 
                    />
                </div>
                
                <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: -8, background: "#0f172a", padding: "0 4px", color: "#475569", fontSize: 10, fontWeight: 800 }}>FROM</span>
                        <input type="date" onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} style={dateStyle} />
                    </div>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: -8, background: "#0f172a", padding: "0 4px", color: "#475569", fontSize: 10, fontWeight: 800 }}>TO</span>
                        <input type="date" onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} style={dateStyle} />
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {logs.length === 0 ? (
                    <div style={{ padding: "80px 0", textAlign: "center", background: "#0f172a", borderRadius: 16, border: "1px solid #1e293b" }}>
                        <div style={{ color: "#475569", fontSize: 14 }}>No governance records match the current filter parameters.</div>
                    </div>
                ) : logs.map((log) => (
                    <div 
                        key={log._id} 
                        onClick={() => setSelected(log)} 
                        style={{ ...logRowStyle, borderLeft: `4px solid ${ACTION_COLORS[log.action] || "#334155"}` }}
                    >
                        <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1 }}>
                            <div style={{ 
                                padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, 
                                background: "rgba(30, 41, 59, 0.5)", color: ACTION_COLORS[log.action] || "#94a3b8",
                                border: `1px solid ${ACTION_COLORS[log.action]}33`, width: 180, textAlign: "center"
                            }}>
                                {log.action.replace(/_/g, " ")}
                            </div>
                            <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600 }}>
                                {log.adminId?.profile?.displayName || "SYSTEM_DAEMON"}
                            </div>
                            {log.targetModel && (
                                <div style={{ color: "#475569", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>→</span>
                                    <span style={{ background: "#1e293b", padding: "2px 8px", borderRadius: 6, color: "#64748b" }}>{log.targetModel}</span>
                                </div>
                            )}
                        </div>
                        <div style={{ color: "#475569", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>
                            {new Date(log.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Governance Detail Inspector ────────────────── */}
            {selected && (
                <div style={drawerOverlay}>
                    <div style={drawerStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                            <h3 style={{ fontWeight: 800, fontSize: 20, color: "#f8fafc", margin: 0 }}>Log Inspector</h3>
                            <button 
                                onClick={() => setSelected(null)} 
                                style={{ background: "rgba(244, 63, 94, 0.1)", border: "none", color: "#f43f5e", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontWeight: 900 }}
                            >✕</button>
                        </div>
                        
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ color: "#475569", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>ACTION SIGNATURE</div>
                            <div style={{ padding: "12px", background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", color: ACTION_COLORS[selected.action] || "#f8fafc", fontWeight: 800, fontSize: 14 }}>
                                {selected.action}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ color: "#475569", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>PAYLOAD SCHEMATIC</div>
                            <pre style={{
                                background: "#0f172a", padding: 20, borderRadius: 16,
                                fontSize: 12, color: "#94a3b8", overflowX: "auto", border: "1px solid #1e293b",
                                lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace"
                            }}>
                                {JSON.stringify(selected.payload, null, 2)}
                            </pre>
                        </div>

                        <div style={{ padding: 20, background: "rgba(99, 102, 241, 0.05)", borderRadius: 16, border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                            <div style={{ color: "#818cf8", fontSize: 11, fontWeight: 800, marginBottom: 4 }}>METADATA</div>
                            <div style={{ color: "#94a3b8", fontSize: 12 }}>
                                ID: {selected._id}<br/>
                                Origin: {selected.ipAddress || "INTERNAL"}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    width: "100%", padding: "12px 14px 12px 42px", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, color: "#f8fafc", fontSize: 13, outline: "none"
};

const dateStyle = {
    padding: "10px 12px", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 10, color: "#f8fafc", fontSize: 12, fontWeight: 700, cursor: "pointer"
};

const logRowStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px", background: "#0f172a", borderRadius: 12, cursor: "pointer",
    transition: "all 0.2s", margin: "4px 0", border: "1px solid transparent"
};

const drawerOverlay = {
    position: "fixed", inset: 0, background: "rgba(10, 15, 30, 0.8)", backdropFilter: "blur(8px)", zIndex: 200
};

const ACTION_COLORS = {
    USER_SUSPENDED: "#ef4444", 
    USER_BANNED: "#7f1d1d",
    MENTOR_APPROVED: "#22c55e", 
    SOCIETY_APPROVED: "#22c55e",
    NOTIFICATION_BROADCAST: "#6366f1", 
    SYSTEM_MAINTENANCE_TOGGLED: "#f59e0b",
};

const drawerStyle = {
    position: "absolute", right: 0, top: 0, bottom: 0, width: 500,
    background: "#0f172a", borderLeft: "1px solid #1e293b", padding: 40,
    overflowY: "auto", boxShadow: "-20px 0 50px rgba(0, 0, 0, 0.5)"
};

export default AdminAuditLogs;
