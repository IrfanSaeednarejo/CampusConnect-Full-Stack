import { useEffect, useState } from "react";
import { getSystemHealth, getFeatureFlags, toggleFeatureFlag, toggleMaintenance } from "../../api/adminApi";
import ConfirmModal from "../components/ConfirmModal";

export const AdminSystem = () => {
    const [health, setHealth] = useState(null);
    const [flags, setFlags] = useState({});
    const [maintenanceModal, setMaintenanceModal] = useState(false);

    useEffect(() => {
        Promise.all([getSystemHealth(), getFeatureFlags()]).then(([h, f]) => {
            setHealth(h.data?.data);
            setFlags(f.data?.data || {});
        }).catch(console.error);
    }, []);

    const handleFlagToggle = async (flag, enabled) => {
        await toggleFeatureFlag({ flag, enabled });
        setFlags((prev) => ({ ...prev, [flag]: enabled }));
    };

    const handleMaintenance = async (enabled) => {
        await toggleMaintenance({ enabled });
        setHealth((prev) => ({ ...prev, maintenanceMode: enabled }));
        setMaintenanceModal(false);
    };

    const Metric = ({ label, value, color }) => (
        <div style={{ background: "#0f172a", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>{label}</div>
            <div style={{ color: color || "#f8fafc", fontSize: 18, fontWeight: 700 }}>{value ?? "—"}</div>
        </div>
    );

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>System</h1>

            {/* ── Health ─────────────────────────────────── */}
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>System Health</h2>
                {health && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        <Metric label="DB Status" value={health.db?.status} color={health.db?.status === "connected" ? "#22c55e" : "#ef4444"} />
                        <Metric label="DB Latency" value={health.db?.latencyMs != null ? `${health.db.latencyMs}ms` : "—"} />
                        <Metric label="Socket Connections" value={health.socketConnections} />
                        <Metric label="Memory Used" value={`${health.memory?.usedPercent}%`} color={health.memory?.usedPercent > 80 ? "#f59e0b" : "#22c55e"} />
                        <Metric label="Uptime" value={health.uptime?.formatted} />
                        <Metric label="Errors (1h)" value={health.errorCountLastHour} color={health.errorCountLastHour > 5 ? "#ef4444" : "#22c55e"} />
                    </div>
                )}
            </div>

            {/* ── Feature Flags ─────────────────────────── */}
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Feature Flags</h2>
                <p style={{ color: "#f59e0b", fontSize: 12, marginBottom: 12 }}>
                    ⚠ Changes apply immediately to all users
                </p>
                {Object.entries(flags).map(([flag, enabled]) => (
                    <div key={flag} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ color: "#f8fafc", fontSize: 14 }}>{flag}</span>
                        <button
                            onClick={() => handleFlagToggle(flag, !enabled)}
                            style={{ padding: "4px 16px", background: enabled ? "#22c55e" : "#dc2626", border: "none", borderRadius: 20, color: "#fff", cursor: "pointer" }}
                        >
                            {enabled ? "ON" : "OFF"}
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Maintenance Mode ──────────────────────── */}
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Maintenance Mode</h2>
                <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
                    When enabled, all non-admin API routes return 503.
                </p>
                <button
                    onClick={() => setMaintenanceModal(true)}
                    style={{
                        padding: "10px 24px", background: health?.maintenanceMode ? "#dc2626" : "#374151",
                        border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600,
                    }}
                >
                    {health?.maintenanceMode ? "🔴 Maintenance ACTIVE — Click to Disable" : "Enable Maintenance Mode"}
                </button>
            </div>

            {maintenanceModal && (
                <ConfirmModal
                    title={health?.maintenanceMode ? "Disable Maintenance Mode?" : "Enable Maintenance Mode?"}
                    description={health?.maintenanceMode
                        ? "This will restore access for all users."
                        : "This will block all users from accessing the platform."}
                    confirmWord={health?.maintenanceMode ? "DISABLE" : "ENABLE"}
                    danger={!health?.maintenanceMode}
                    onClose={({ confirmed }) => {
                        if (confirmed) handleMaintenance(!health?.maintenanceMode);
                        else setMaintenanceModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default AdminSystem;
