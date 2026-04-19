const STATUS_COLORS = {
    active: "#22c55e", suspended: "#f59e0b", deleted: "#ef4444", deactivated: "#64748b",
    approved: "#22c55e", pending: "#f59e0b", rejected: "#ef4444", archived: "#64748b",
    verified: "#22c55e", bronze: "#92400e", silver: "#64748b", gold: "#d97706",
    super_admin: "#6366f1", campus_admin: "#06b6d4", read_only_admin: "#64748b",
    admin: "#8b5cf6", student: "#334155", mentor: "#0284c7", society_head: "#7c3aed",
};

export const AdminBadge = ({ type, value }) => {
    const color = STATUS_COLORS[value] || "#334155";
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 8px", borderRadius: 9999,
            background: color + "30", color, border: `1px solid ${color}40`,
            fontSize: 11, fontWeight: 600, marginRight: 4,
        }}>
            {value}
        </span>
    );
};
export default AdminBadge;
