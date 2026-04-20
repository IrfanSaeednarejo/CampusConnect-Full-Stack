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

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>System Control Center</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Live telemetry, feature flag management, and emergency maintenance overrides.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {/* ── Health Command Center ────────────────── */}
                    <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #1e293b", padding: 32 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Live Telemetry</h2>
                            <div style={{ padding: "4px 12px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>STABLE</div>
                        </div>
                        
                        {health ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                                <Metric label="DATABASE CLUSTER" value={health.db?.status.toUpperCase()} color={health.db?.status === "connected" ? "#10b981" : "#f43f5e"} />
                                <Metric label="API LATENCY" value={`${health.db?.latencyMs || 0}ms`} color={health.db?.latencyMs > 50 ? "#f59e0b" : "#10b981"} />
                                <Metric label="ACTIVE SOCKETS" value={health.socketConnections} />
                                <Metric label="MEMORY PRESSURE" value={`${health.memory?.usedPercent}%`} color={health.memory?.usedPercent > 80 ? "#f43f5e" : "#10b981"} />
                                <Metric label="SYSTEM UPTIME" value={health.uptime?.formatted} />
                                <Metric label="ERROR RATE (1H)" value={health.errorCountLastHour} color={health.errorCountLastHour > 5 ? "#f43f5e" : "#10b981"} />
                            </div>
                        ) : (
                            <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>Synchronizing telemetry stream...</div>
                        )}
                    </div>

                    {/* ── Feature Flag Governance ─────────────── */}
                    <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #1e293b", padding: 32 }}>
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Feature Propagation</h2>
                            <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Control real-time system capability propagation across all nodes.</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {Object.entries(flags).map(([flag, enabled]) => (
                                <div key={flag} style={{ 
                                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                                    padding: "16px 20px", background: "rgba(30, 41, 59, 0.3)", borderRadius: 16, border: "1px solid #1e293b" 
                                }}>
                                    <div>
                                        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{flag.replace(/_/g, " ").toUpperCase()}</div>
                                        <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>Affects system globally</div>
                                    </div>
                                    <button
                                        onClick={() => handleFlagToggle(flag, !enabled)}
                                        style={{ 
                                            padding: "8px 20px", background: enabled ? "#6366f1" : "#1e293b", 
                                            border: "none", borderRadius: 10, color: enabled ? "#fff" : "#64748b", 
                                            cursor: "pointer", fontWeight: 800, fontSize: 11, transition: "all 0.2s" 
                                        }}
                                    >
                                        {enabled ? "ENABLED" : "DISABLED"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Emergency Protocols ───────────────────── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #7f1d1d", padding: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f43f5e", marginBottom: 12 }}>Emergency Protocol</h2>
                        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                            Activating maintenance mode will immediately terminate all public API access. Only administrative nodes will remain operational.
                        </p>
                        <button
                            onClick={() => setMaintenanceModal(true)}
                            style={{
                                width: "100%", padding: "16px", background: health?.maintenanceMode ? "#f43f5e" : "rgba(30, 41, 59, 0.5)",
                                border: health?.maintenanceMode ? "none" : "1px solid #334155", 
                                borderRadius: 12, color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, transition: "all 0.2s",
                                boxShadow: health?.maintenanceMode ? "0 8px 24px rgba(244, 63, 94, 0.3)" : "none"
                            }}
                        >
                            {health?.maintenanceMode ? "🔴 EXIT MAINTENANCE" : "ENTER MAINTENANCE"}
                        </button>
                    </div>

                    <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #1e293b", padding: 32 }}>
                        <h3 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Node Environment</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <EnvRow label="NODE_ENV" value="PRODUCTION" />
                            <EnvRow label="REGION" value="US-EAST-1" />
                            <EnvRow label="VERSION" value="2.4.0-STABLE" />
                        </div>
                    </div>
                </div>
            </div>

            {maintenanceModal && (
                <ConfirmModal
                    title={health?.maintenanceMode ? "Disable Emergency Protocol?" : "Activate Emergency Protocol?"}
                    description={health?.maintenanceMode
                        ? "System will return to nominal state. Public traffic will be re-routed to API clusters."
                        : "Nominal operation will cease. All public requests will receive 503 SERVICE_UNAVAILABLE."}
                    confirmWord={health?.maintenanceMode ? "DEACTIVATE" : "ACTIVATE"}
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

const Metric = ({ label, value, color }) => (
    <div style={{ background: "rgba(30, 41, 59, 0.3)", borderRadius: 16, padding: "20px", border: "1px solid #1e293b" }}>
        <div style={{ color: "#475569", fontSize: 10, fontWeight: 800, marginBottom: 8, letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ color: color || "#f1f5f9", fontSize: 20, fontWeight: 800 }}>{value ?? "—"}</div>
    </div>
);

const EnvRow = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>{label}</span>
        <span style={{ color: "#f8fafc", fontSize: 11, fontWeight: 800, fontFamily: "monospace" }}>{value}</span>
    </div>
);

export default AdminSystem;
