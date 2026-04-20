import { useState, useEffect } from "react";
import { broadcastNotification, targetedNotification, getNotificationLogs } from "../../api/adminApi";

const AUDIENCE_OPTIONS = [
    { value: "all",    label: "All Users" },
    { value: "campus", label: "By Campus" },
    { value: "role",   label: "By Role" },
    { value: "custom", label: "Custom User IDs" },
];

const ROLE_OPTIONS = ["student", "mentor", "society_head", "admin"];

const AdminNotifications = () => {
    const [audience, setAudience] = useState("all");
    const [form, setForm] = useState({ title: "", body: "", campusId: "", roles: [], userIds: "" });
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);

    useEffect(() => {
        getNotificationLogs({ limit: 20 })
            .then(({ data }) => setLogs(data.data?.docs || []))
            .finally(() => setLogsLoading(false));
    }, []);

    const estimateCount = () => {
        if (audience === "custom") return form.userIds.split(",").filter(Boolean).length;
        return "—";
    };

    const handleSend = async () => {
        if (!form.title.trim() || !form.body.trim()) return;

        setSending(true);
        setResult(null);
        try {
            let res;
            if (audience === "custom") {
                const userIds = form.userIds.split(",").map((s) => s.trim()).filter(Boolean);
                res = await targetedNotification({ userIds, title: form.title, body: form.body });
            } else {
                const filter = {};
                if (audience === "campus" && form.campusId) filter.campusId = form.campusId;
                if (audience === "role" && form.roles.length > 0) filter.roles = form.roles;
                res = await broadcastNotification({ title: form.title, body: form.body, filter });
            }
            setResult({ success: true, count: res.data?.data?.recipientCount });
            setForm({ title: "", body: "", campusId: "", roles: [], userIds: "" });
            // Reload logs
            getNotificationLogs({ limit: 20 }).then(({ data }) => setLogs(data.data?.docs || []));
        } catch {
            setResult({ success: false });
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>System Broadcaster</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Dispatch global pulses, targeted alerts, and system-wide notifications with telemetry tracking.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
                {/* ── Compose Hub ─────────────────────────── */}
                <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #1e293b", padding: 32 }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", margin: 0 }}>New Broadcast Pulse</h2>
                        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Define audience and payload parameters for the system pulse.</p>
                    </div>

                    {/* Audience Configuration */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Target Audience</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 6, background: "rgba(30, 41, 59, 0.5)", borderRadius: 12 }}>
                            {AUDIENCE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setAudience(opt.value)}
                                    style={{
                                        flex: 1, padding: "8px 16px", border: "none",
                                        borderRadius: 8, background: audience === opt.value ? "#6366f1" : "transparent",
                                        color: audience === opt.value ? "#fff" : "#94a3b8",
                                        cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s"
                                    }}
                                >
                                    {opt.label.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Filters */}
                    <div style={{ marginBottom: 24 }}>
                        {audience === "campus" && (
                            <div>
                                <label style={labelStyle}>Campus Node Identifier</label>
                                <input
                                    value={form.campusId}
                                    onChange={(e) => setForm((f) => ({ ...f, campusId: e.target.value }))}
                                    placeholder="Enter Campus ObjectId..."
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        {audience === "role" && (
                            <div>
                                <label style={labelStyle}>Targeted Roles</label>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {ROLE_OPTIONS.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setForm((f) => ({
                                                ...f,
                                                roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r],
                                            }))}
                                            style={{
                                                padding: "6px 14px", border: "1px solid",
                                                borderColor: form.roles.includes(r) ? "#6366f1" : "#1e293b",
                                                borderRadius: 10, background: form.roles.includes(r) ? "rgba(99, 102, 241, 0.1)" : "#1e293b",
                                                color: form.roles.includes(r) ? "#818cf8" : "#64748b",
                                                cursor: "pointer", fontSize: 13, fontWeight: 600
                                            }}
                                        >
                                            {r.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {audience === "custom" && (
                            <div>
                                <label style={labelStyle}>Manual Target IDs</label>
                                <textarea
                                    value={form.userIds}
                                    onChange={(e) => setForm((f) => ({ ...f, userIds: e.target.value }))}
                                    placeholder="Paste comma-separated user identifiers..."
                                    rows={3}
                                    style={{ ...inputStyle, resize: "none" }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Message Payload */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Pulse Title</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="Enter clear, actionable title..."
                                style={inputStyle}
                                maxLength={150}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Message Content</label>
                            <textarea
                                value={form.body}
                                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                                placeholder="Write the core broadcast message..."
                                rows={4}
                                style={{ ...inputStyle, resize: "none" }}
                                maxLength={500}
                            />
                        </div>
                    </div>

                    {/* Dispatch Action */}
                    <div style={{ marginTop: 32 }}>
                        <button
                            onClick={handleSend}
                            disabled={sending || !form.title.trim() || !form.body.trim()}
                            style={{
                                width: "100%", padding: "16px", border: "none", borderRadius: 14,
                                background: (!form.title.trim() || !form.body.trim()) ? "#1e293b" : "#6366f1",
                                color: "#fff", cursor: (!form.title.trim() || !form.body.trim()) ? "not-allowed" : "pointer",
                                fontWeight: 800, fontSize: 14, letterSpacing: "0.05em", transition: "all 0.2s",
                                boxShadow: (!form.title.trim() || !form.body.trim()) ? "none" : "0 8px 24px rgba(99, 102, 241, 0.3)"
                            }}
                        >
                            {sending ? "DISPATCHING PULSE..." : `DISPATCH PULSE TO ${estimateCount() === "—" ? "MATCHED AUDIENCE" : `${estimateCount()} IDENTITIES`}`}
                        </button>
                    </div>

                    {result && (
                        <div style={{
                            marginTop: 20, padding: "16px", borderRadius: 12,
                            background: result.success ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                            border: `1px solid ${result.success ? "#10b98133" : "#f43f5e33"}`,
                            color: result.success ? "#10b981" : "#f43f5e",
                            fontSize: 13, fontWeight: 600, textAlign: "center"
                        }}>
                            {result.success
                                ? `✓ Successfully dispatched to ${result.count} identities.`
                                : "✗ Pulse dispatch encounter an internal error. Retry requested."}
                        </div>
                    )}
                </div>

                {/* ── Pulse Telemetry ───────────────────────── */}
                <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #1e293b", padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Broadcast Trail</h2>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {logsLoading ? (
                            <div style={{ padding: "40px 0", textAlign: "center", color: "#475569" }}>Synchronizing history...</div>
                        ) : logs.length === 0 ? (
                            <div style={{ padding: "40px 0", textAlign: "center", color: "#475569", fontSize: 13 }}>No recorded pulses in this node.</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log._id} style={{ 
                                    padding: "16px", background: "rgba(30, 41, 59, 0.3)", borderRadius: 16, 
                                    border: "1px solid #1e293b", position: "relative", overflow: "hidden" 
                                }}>
                                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#6366f1" }} />
                                    <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{log.payload?.title || "SYSTEM PULSE"}</div>
                                    <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                                        {log.payload?.body?.substring(0, 80)}...
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{new Date(log.createdAt).toLocaleString()}</div>
                                        <div style={{ padding: "4px 8px", background: "#1e293b", borderRadius: 6, fontSize: 10, color: "#818cf8", fontWeight: 700 }}>
                                            {log.payload?.recipientCount ?? "?"} TARGETS
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const labelStyle = { 
    display: "block", color: "#475569", fontSize: 11, fontWeight: 900, 
    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" 
};

const inputStyle = { 
    width: "100%", padding: "12px 16px", background: "#1e293b", 
    border: "1px solid #334155", borderRadius: 12, color: "#f8fafc", 
    fontSize: 14, outline: "none", transition: "border-color 0.2s" 
};

export default AdminNotifications;
