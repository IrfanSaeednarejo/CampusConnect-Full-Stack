import { useState, useEffect, useCallback } from "react";
import { broadcastNotification, targetedNotification, getNotificationLogs } from "../../api/adminApi";
import useHomeTheme from "../../hooks/useHomeTheme";
import Button, { getButtonClassName } from "../../components/common/Button";
import { getAdminThemeStyles } from "../utils/themeStyles";
import { useSocketListener } from "../../hooks/useSocket";

const audienceOptions = [
  { value: "all", label: "All Users" },
  { value: "campus", label: "By Campus" },
  { value: "role", label: "By Role" },
  { value: "custom", label: "Custom User IDs" },
];

const roleOptions = ["student", "mentor", "society_head", "admin"];

const AdminNotifications = () => {
  const isDark = useHomeTheme();
  const theme = getAdminThemeStyles(isDark);
  const [audience, setAudience] = useState("all");
  const [form, setForm] = useState({ title: "", body: "", campusId: "", roles: [], userIds: "" });
  const [channels, setChannels] = useState(["in_app", "email"]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const loadLogs = useCallback(() => {
    setLogsLoading(true);
    getNotificationLogs({ limit: 20 })
      .then(({ data }) => setLogs(data.data?.docs || []))
      .finally(() => setLogsLoading(false));
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useSocketListener("notification:new", (notification) => {
    if (!["admin", "system"].includes(notification?.type)) return;
    loadLogs();
  });

  const estimateCount = () => {
    if (audience === "custom") return form.userIds.split(",").filter(Boolean).length;
    return "—";
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim() || channels.length === 0) return;

    setSending(true);
    setResult(null);
    try {
      let response;
      if (audience === "custom") {
        const userIds = form.userIds
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        response = await targetedNotification({ userIds, title: form.title, body: form.body });
      } else {
        const filter = {};
        if (audience === "campus" && form.campusId) filter.campusId = form.campusId;
        if (audience === "role" && form.roles.length > 0) filter.roles = form.roles;
        response = await broadcastNotification({ title: form.title, body: form.body, filter, channels });
      }
      setResult({ success: true, count: response.data?.data?.recipientCount });
      setForm({ title: "", body: "", campusId: "", roles: [], userIds: "" });
      loadLogs();
    } catch {
      setResult({ success: false });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ ...theme.title, fontSize: 24, fontWeight: 800, margin: 0 }}>System Broadcaster</h1>
        <p style={{ ...theme.subtitle, marginTop: 4 }}>
          Dispatch global pulses, targeted alerts, and system-wide notifications with telemetry tracking.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
        <div style={{ ...theme.panel, borderRadius: 20, padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ ...theme.title, fontSize: 18, fontWeight: 800, margin: 0 }}>New Broadcast Pulse</h2>
            <p style={{ ...theme.subtitle, fontSize: 13, marginTop: 4 }}>
              Define audience and payload parameters for the system pulse.
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ ...theme.label, display: "block", fontSize: 11, fontWeight: 900, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Target Audience
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                padding: 6,
                borderRadius: 12,
                background: isDark ? "rgb(var(--color-surface-muted-dark))" : "rgb(var(--color-surface-muted-light))",
              }}
            >
              {audienceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAudience(option.value)}
                  className={getButtonClassName({
                    variant: audience === option.value ? "primary" : "ghost",
                    size: "sm",
                    isDark,
                    className: "min-w-0 flex-1 px-4",
                  })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            {audience === "campus" && (
              <div>
                <label style={{ ...theme.label, display: "block", fontSize: 11, fontWeight: 900, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Campus Node Identifier
                </label>
                <input
                  value={form.campusId}
                  onChange={(event) => setForm((current) => ({ ...current, campusId: event.target.value }))}
                  placeholder="Enter campus ObjectId..."
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, outline: "none", ...theme.input }}
                />
              </div>
            )}

            {audience === "role" && (
              <div>
                <label style={{ ...theme.label, display: "block", fontSize: 11, fontWeight: 900, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Targeted Roles
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {roleOptions.map((role) => (
                    <button
                      key={role}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          roles: current.roles.includes(role)
                            ? current.roles.filter((value) => value !== role)
                            : [...current.roles, role],
                        }))
                      }
                      className={getButtonClassName({
                        variant: form.roles.includes(role) ? "outline" : "ghost",
                        size: "sm",
                        isDark,
                        className: "min-w-0 px-3",
                      })}
                    >
                      {role.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {audience === "custom" && (
              <div>
                <label style={{ ...theme.label, display: "block", fontSize: 11, fontWeight: 900, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Manual Target IDs
                </label>
                <textarea
                  value={form.userIds}
                  onChange={(event) => setForm((current) => ({ ...current, userIds: event.target.value }))}
                  placeholder="Paste comma-separated user identifiers..."
                  rows={3}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, outline: "none", resize: "none", ...theme.input }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ ...theme.label, display: "block", fontSize: 11, fontWeight: 900, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Delivery Channels
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {["in_app", "email"].map((channel) => (
                <label
                  key={channel}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", ...theme.strong, fontSize: 14 }}
                >
                  <input
                    type="checkbox"
                    checked={channels.includes(channel)}
                    onChange={() => {
                      if (channels.includes(channel)) {
                        setChannels(channels.filter((value) => value !== channel));
                      } else {
                        setChannels([...channels, channel]);
                      }
                    }}
                    style={{ accentColor: "#2563eb", width: 16, height: 16 }}
                  />
                  {channel === "in_app" ? "In-App / Socket" : "Email"}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ ...theme.label, display: "block", fontSize: 11, fontWeight: 900, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Pulse Title
              </label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Enter clear, actionable title..."
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, outline: "none", ...theme.input }}
                maxLength={150}
              />
            </div>

            <div>
              <label style={{ ...theme.label, display: "block", fontSize: 11, fontWeight: 900, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Message Content
              </label>
              <textarea
                value={form.body}
                onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                placeholder="Write the core broadcast message..."
                rows={4}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, outline: "none", resize: "none", ...theme.input }}
                maxLength={500}
              />
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Button onClick={handleSend} disabled={sending || !form.title.trim() || !form.body.trim()} className="w-full justify-center">
              {sending
                ? "DISPATCHING PULSE..."
                : `DISPATCH PULSE TO ${estimateCount() === "—" ? "MATCHED AUDIENCE" : `${estimateCount()} IDENTITIES`}`}
            </Button>
          </div>

          {result && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: result.success ? "rgba(16,185,129,0.10)" : "rgba(244,63,94,0.10)",
                border: `1px solid ${result.success ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
                color: result.success ? "rgb(var(--color-success))" : "rgb(var(--color-danger))",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {result.success
                ? `✓ Successfully dispatched to ${result.count} identities.`
                : "Dispatch encountered an internal error. Please retry."}
            </div>
          )}
        </div>

        <div style={{ ...theme.panel, borderRadius: 20, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2
              style={{
                ...theme.label,
                fontSize: 14,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Broadcast Trail
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {logsLoading ? (
              <div style={{ padding: "40px 0", textAlign: "center", ...theme.muted }}>Synchronizing history...</div>
            ) : logs.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", ...theme.muted, fontSize: 13 }}>
                No recorded pulses in this node.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    ...theme.mutedPanel,
                    padding: 16,
                    borderRadius: 16,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "rgb(var(--color-info))" }} />
                  <div style={{ ...theme.strong, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    {log.payload?.title || "SYSTEM PULSE"}
                  </div>
                  <div style={{ ...theme.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                    {(log.payload?.body || "").substring(0, 80)}
                    {(log.payload?.body || "").length > 80 ? "..." : ""}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ ...theme.muted, fontSize: 11, fontWeight: 600 }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                    <div
                      style={{
                        padding: "4px 8px",
                        background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))",
                        borderRadius: 6,
                        fontSize: 10,
                        color: "rgb(var(--color-info))",
                        fontWeight: 700,
                      }}
                    >
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

export default AdminNotifications;
