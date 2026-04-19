export const AdminStatCard = ({ icon, label, value, color = "#f8fafc", trend }) => (
    <div style={{
        background: "#1e293b", borderRadius: 12, padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 8,
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
        </div>
        <div style={{ color, fontSize: 28, fontWeight: 700 }}>{value}</div>
        {trend !== undefined && (
            <div style={{ color: trend >= 0 ? "#22c55e" : "#ef4444", fontSize: 12 }}>
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last period
            </div>
        )}
    </div>
);
export default AdminStatCard;
