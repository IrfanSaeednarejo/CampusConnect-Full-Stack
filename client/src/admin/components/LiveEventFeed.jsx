const EVENT_LABELS = {
    "admin:user_registered":  { label: "New User",     color: "#22c55e" },
    "admin:mentor_applied":   { label: "Mentor Apply", color: "#6366f1" },
    "admin:society_created":  { label: "New Society",  color: "#f59e0b" },
    "admin:event_created":    { label: "New Event",    color: "#06b6d4" },
    "admin:booking_created":  { label: "Booking",      color: "#8b5cf6" },
};

export const LiveEventFeed = ({ events = [] }) => (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#f8fafc" }}>Live Feed</h3>
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {events.length === 0 && (
                <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", paddingTop: 32 }}>
                    Waiting for events...
                </div>
            )}
            {events.map((evt, i) => {
                const meta = EVENT_LABELS[evt.type] || { label: evt.type, color: "#64748b" };
                return (
                    <div key={evt._id || i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: meta.color + "30", color: meta.color, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {meta.label}
                        </span>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "#f8fafc", fontSize: 12 }}>{evt.displayName || evt.name || evt.title || "—"}</div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>
                                {evt._ts ? new Date(evt._ts).toLocaleTimeString() : ""}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);
export default LiveEventFeed;
