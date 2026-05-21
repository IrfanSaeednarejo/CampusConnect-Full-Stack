import { useEffect, useState } from "react";
import { getSystemHealth, getFeatureFlags, toggleFeatureFlag, toggleMaintenance } from "../../api/adminApi";
import ConfirmModal from "../components/ConfirmModal";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";
import { getAdminThemeStyles } from "../utils/themeStyles";

export const AdminSystem = () => {
  const isDark = useHomeTheme();
  const theme = getAdminThemeStyles(isDark);
  const [health, setHealth] = useState(null);
  const [flags, setFlags] = useState({});
  const [maintenanceModal, setMaintenanceModal] = useState(false);

  useEffect(() => {
    Promise.all([getSystemHealth(), getFeatureFlags()])
      .then(([healthResponse, flagsResponse]) => {
        setHealth(healthResponse.data?.data);
        setFlags(flagsResponse.data?.data || {});
      })
      .catch(console.error);
  }, []);

  const handleFlagToggle = async (flag, enabled) => {
    await toggleFeatureFlag({ flag, enabled });
    setFlags((current) => ({ ...current, [flag]: enabled }));
  };

  const handleMaintenance = async (enabled) => {
    await toggleMaintenance({ enabled });
    setHealth((current) => ({ ...current, maintenanceMode: enabled }));
    setMaintenanceModal(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ ...theme.title, fontSize: 24, fontWeight: 800, margin: 0 }}>System Control Center</h1>
        <p style={{ ...theme.subtitle, marginTop: 4 }}>
          Live telemetry, feature flag management, and emergency maintenance overrides.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ ...theme.panel, borderRadius: 20, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ ...theme.title, fontSize: 18, fontWeight: 800, margin: 0 }}>Live Telemetry</h2>
              <div
                style={{
                  padding: "4px 12px",
                  background: "rgba(34,197,94,0.10)",
                  color: "rgb(var(--color-success))",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                STABLE
              </div>
            </div>

            {health ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                <Metric isDark={isDark} label="DATABASE CLUSTER" value={health.db?.status?.toUpperCase()} color={health.db?.status === "connected" ? "rgb(var(--color-success))" : "rgb(var(--color-danger))"} />
                <Metric isDark={isDark} label="API LATENCY" value={`${health.db?.latencyMs || 0}ms`} color={health.db?.latencyMs > 50 ? "rgb(var(--color-warning))" : "rgb(var(--color-success))"} />
                <Metric isDark={isDark} label="ACTIVE SOCKETS" value={health.socketConnections} />
                <Metric isDark={isDark} label="MEMORY PRESSURE" value={`${health.memory?.usedPercent}%`} color={health.memory?.usedPercent > 80 ? "rgb(var(--color-danger))" : "rgb(var(--color-success))"} />
                <Metric isDark={isDark} label="SYSTEM UPTIME" value={health.uptime?.formatted} />
                <Metric isDark={isDark} label="ERROR RATE (1H)" value={health.errorCountLastHour} color={health.errorCountLastHour > 5 ? "rgb(var(--color-danger))" : "rgb(var(--color-success))"} />
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: "center", ...theme.muted }}>Synchronizing telemetry stream...</div>
            )}
          </div>

          <div style={{ ...theme.panel, borderRadius: 20, padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ ...theme.title, fontSize: 18, fontWeight: 800, margin: 0 }}>Feature Propagation</h2>
              <p style={{ ...theme.subtitle, fontSize: 13, marginTop: 4 }}>
                Control real-time system capability propagation across all nodes.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(flags).map(([flag, enabled]) => (
                <div
                  key={flag}
                  style={{
                    ...theme.mutedPanel,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderRadius: 16,
                  }}
                >
                  <div>
                    <div style={{ ...theme.strong, fontWeight: 700, fontSize: 14 }}>{flag.replace(/_/g, " ").toUpperCase()}</div>
                    <div style={{ ...theme.muted, fontSize: 11, marginTop: 2 }}>Affects system globally</div>
                  </div>
                  <button
                    onClick={() => handleFlagToggle(flag, !enabled)}
                    className={getButtonClassName({
                      variant: enabled ? "primary" : "secondary",
                      size: "sm",
                      isDark,
                    })}
                  >
                    {enabled ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ ...theme.dangerPanel, borderRadius: 20, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "rgb(var(--color-danger))", marginBottom: 12 }}>
              Emergency Protocol
            </h2>
            <p style={{ ...theme.subtitle, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Activating maintenance mode will immediately terminate all public API access. Only administrative nodes will remain operational.
            </p>
            <button
              onClick={() => setMaintenanceModal(true)}
              className={getButtonClassName({
                variant: health?.maintenanceMode ? "danger" : "secondary",
                size: "lg",
                isDark,
                className: "w-full",
              })}
            >
              {health?.maintenanceMode ? "EXIT MAINTENANCE" : "ENTER MAINTENANCE"}
            </button>
          </div>

          <div style={{ ...theme.panel, borderRadius: 20, padding: 32 }}>
            <h3
              style={{
                ...theme.label,
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Node Environment
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <EnvRow isDark={isDark} label="NODE_ENV" value="PRODUCTION" />
              <EnvRow isDark={isDark} label="REGION" value="US-EAST-1" />
              <EnvRow isDark={isDark} label="VERSION" value="2.4.0-STABLE" />
            </div>
          </div>
        </div>
      </div>

      {maintenanceModal && (
        <ConfirmModal
          title={health?.maintenanceMode ? "Disable Emergency Protocol?" : "Activate Emergency Protocol?"}
          description={
            health?.maintenanceMode
              ? "System will return to nominal state. Public traffic will be re-routed to API clusters."
              : "Nominal operation will cease. All public requests will receive 503 SERVICE_UNAVAILABLE."
          }
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

const Metric = ({ label, value, color, isDark }) => (
  <div
    style={{
      background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))",
      borderRadius: 16,
      padding: 20,
      border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
    }}
  >
    <div
      style={{
        color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
        fontSize: 10,
        fontWeight: 800,
        marginBottom: 8,
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </div>
    <div
      style={{
        color: color || (isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))"),
        fontSize: 20,
        fontWeight: 800,
      }}
    >
      {value ?? "—"}
    </div>
  </div>
);

const EnvRow = ({ label, value, isDark }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span
      style={{
        color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
    <span
      style={{
        color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
        fontSize: 11,
        fontWeight: 800,
        fontFamily: "monospace",
      }}
    >
      {value}
    </span>
  </div>
);

export default AdminSystem;
