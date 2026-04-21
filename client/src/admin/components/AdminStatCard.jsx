export const AdminStatCard = ({ icon, label, value, color = "#818cf8", trend, sub, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      border: "1px solid #1e293b",
      borderRadius: 18,
      padding: "24px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = color + "60"; e.currentTarget.style.boxShadow = `0 8px 32px -8px ${color}30`; e.currentTarget.style.transform = "translateY(-1px)"; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
  >
    {/* Glow */}
    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: color + "15", filter: "blur(24px)", pointerEvents: "none" }} />

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
        {icon}
      </div>
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", borderRadius: 20, color: trend >= 0 ? "#34d399" : "#f87171", fontSize: 12, fontWeight: 700 }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </div>
      )}
    </div>

    <div>
      <div style={{ color, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ color: "#334155", fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

export default AdminStatCard;
