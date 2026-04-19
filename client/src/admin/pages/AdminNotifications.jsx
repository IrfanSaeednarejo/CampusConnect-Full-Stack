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

    const labelStyle = { display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };
    const inputStyle = { width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", fontSize: 14 };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Notifications</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
                {/* ── Compose Panel ────────────────────────── */}
                <div style={{ background: "#1e293b", borderRadius: 12, padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Compose Broadcast</h2>

                    {/* Audience selector */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Audience</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {AUDIENCE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setAudience(opt.value)}
                                    style={{
                                        padding: "6px 14px", border: "1px solid",
                                        borderColor: audience === opt.value ? "#6366f1" : "#334155",
                                        borderRadius: 6, background: audience === opt.value ? "#6366f130" : "transparent",
                                        color: audience === opt.value ? "#6366f1" : "#94a3b8",
                                        cursor: "pointer", fontSize: 13,
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Campus filter */}
                    {audience === "campus" && (
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Campus ID</label>
                            <input
                                value={form.campusId}
                                onChange={(e) => setForm((f) => ({ ...f, campusId: e.target.value }))}
                                placeholder="MongoDB ObjectId of campus..."
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Role filter */}
                    {audience === "role" && (
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Roles</label>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {ROLE_OPTIONS.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setForm((f) => ({
                                            ...f,
                                            roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r],
                                        }))}
                                        style={{
                                            padding: "4px 12px", border: "1px solid",
                                            borderColor: form.roles.includes(r) ? "#22c55e" : "#334155",
                                            borderRadius: 6, background: form.roles.includes(r) ? "#22c55e20" : "transparent",
                                            color: form.roles.includes(r) ? "#22c55e" : "#94a3b8",
                                            cursor: "pointer", fontSize: 12,
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom userIds */}
                    {audience === "custom" && (
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>User IDs (comma-separated, max 500)</label>
                            <textarea
                                value={form.userIds}
                                onChange={(e) => setForm((f) => ({ ...f, userIds: e.target.value }))}
                                placeholder="id1, id2, id3..."
                                rows={3}
                                style={{ ...inputStyle, resize: "vertical" }}
                            />
                        </div>
                    )}

                    {/* Title */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Title *</label>
                        <input
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Notification title..."
                            style={inputStyle}
                            maxLength={150}
                        />
                    </div>

                    {/* Body */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>Body *</label>
                        <textarea
                            value={form.body}
                            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                            placeholder="Notification body..."
                            rows={4}
                            style={{ ...inputStyle, resize: "vertical" }}
                            maxLength={500}
                        />
                    </div>

                    {/* Preview */}
                    {(form.title || form.body) && (
                        <div style={{ background: "#0f172a", borderRadius: 8, padding: 14, marginBottom: 16, border: "1px solid #334155" }}>
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>PREVIEW</div>
                            <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{form.title || "—"}</div>
                            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{form.body || "—"}</div>
                        </div>
                    )}

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={sending || !form.title.trim() || !form.body.trim()}
                        style={{
                            width: "100%", padding: "10px", border: "none", borderRadius: 8,
                            background: (!form.title.trim() || !form.body.trim()) ? "#334155" : "#6366f1",
                            color: "#fff", cursor: (!form.title.trim() || !form.body.trim()) ? "not-allowed" : "pointer",
                            fontWeight: 600, fontSize: 14,
                        }}
                    >
                        {sending ? "Sending..." : `Send to ${estimateCount() === "—" ? "All Matched Users" : `${estimateCount()} Users`}`}
                    </button>

                    {/* Result toast */}
                    {result && (
                        <div style={{
                            marginTop: 12, padding: "10px 14px", borderRadius: 6,
                            background: result.success ? "#16a34a20" : "#dc262620",
                            border: `1px solid ${result.success ? "#16a34a" : "#dc2626"}`,
                            color: result.success ? "#22c55e" : "#ef4444",
                            fontSize: 13,
                        }}>
                            {result.success
                                ? `✓ Sent to ${result.count} user${result.count !== 1 ? "s" : ""} successfully`
                                : "✗ Failed to send. Please try again."}
                        </div>
                    )}
                </div>

                {/* ── History Panel ─────────────────────────── */}
                <div style={{ background: "#1e293b", borderRadius: 12, padding: 20 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Broadcast History</h2>
                    {logsLoading
                        ? <div style={{ color: "#64748b", fontSize: 13 }}>Loading...</div>
                        : logs.length === 0
                            ? <div style={{ color: "#64748b", fontSize: 13 }}>No broadcasts yet</div>
                            : logs.map((log) => (
                                <div key={log._id} style={{ borderBottom: "1px solid #334155", paddingBottom: 12, marginBottom: 12 }}>
                                    <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 500 }}>
                                        {log.payload?.title || "—"}
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                                        {new Date(log.createdAt).toLocaleString()} ·{" "}
                                        {log.adminId?.profile?.displayName || "Unknown"} ·{" "}
                                        {log.payload?.recipientCount ?? "?"} recipients
                                    </div>
                                </div>
                            ))
                    }
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
