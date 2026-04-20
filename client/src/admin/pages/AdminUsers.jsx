import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, updateUserStatus, forceLogoutUser } from "../../api/adminApi";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";

export const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ page: 1, limit: 20, status: "active" });
    const [selectedIds, setSelectedIds] = useState([]);
    const [reasonModal, setReasonModal] = useState(null); // { userId, action }

    const fetchUsers = useCallback(async (f = filters) => {
        setLoading(true);
        try {
            const { data } = await getAdminUsers(f);
            setUsers(data.data.docs || []);
            setPagination(data.data.pagination || {});
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSuspend = async ({ confirmed, reason }) => {
        if (!confirmed || !reasonModal) {
            setReasonModal(null);
            return;
        }
        await updateUserStatus(reasonModal.userId, { status: "suspended", reason });
        setReasonModal(null);
        fetchUsers();
    };

    const columns = [
        { key: "profile.displayName", label: "Name", render: (u) => u.profile?.displayName },
        { key: "email", label: "Email" },
        { key: "roles", label: "Roles", render: (u) => u.roles?.map((r) => <AdminBadge key={r} type="role" value={r} />) },
        { key: "status", label: "Status", render: (u) => <AdminBadge type="status" value={u.status} /> },
        { key: "lastLoginAt", label: "Last Login", render: (u) => u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never" },
    ];

    const rowActions = (user) => [
        { label: "View Detail", onClick: () => navigate(`/admin/users/${user._id}`) },
        { label: "Suspend", onClick: () => setReasonModal({ userId: user._id, action: "suspend" }), danger: true },
        { label: "Force Logout", onClick: () => forceLogoutUser(user._id).then(() => fetchUsers()) },
    ];

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>User Management</h1>
                    <p style={{ color: "#64748b", marginTop: 4 }}>Audit, moderate, and manage system access across all roles.</p>
                </div>
                {selectedIds.length > 0 && (
                    <button style={{ 
                        padding: "10px 20px", background: "#f43f5e", color: "#fff", 
                        border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700,
                        boxShadow: "0 4px 6px -1px rgba(244, 63, 94, 0.4)"
                    }}>
                        BULK SUSPEND ({selectedIds.length})
                    </button>
                )}
            </div>

            {/* ── Filters & Search ────────────────────────────── */}
            <div style={{ 
                background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, 
                padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center" 
            }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>🔍</span>
                    <input
                        placeholder="Search by identity or email..."
                        onChange={(e) => { const f = { ...filters, q: e.target.value, page: 1 }; setFilters(f); fetchUsers(f); }}
                        style={inputStyle}
                    />
                </div>
                
                <div style={{ display: "flex", gap: 6, background: "#1e293b", padding: 4, borderRadius: 10 }}>
                    {["all", "active", "suspended"].map((s) => (
                        <button
                            key={s}
                            onClick={() => { const f = { ...filters, status: s, page: 1 }; setFilters(f); fetchUsers(f); }}
                            style={{ 
                                ...filterPill, 
                                background: filters.status === s ? "#6366f1" : "transparent",
                                color: filters.status === s ? "#fff" : "#94a3b8",
                                fontWeight: filters.status === s ? 700 : 500,
                            }}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
                <AdminTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    rowActions={rowActions}
                    onRowClick={(u) => navigate(`/admin/users/${u._id}`)}
                    pagination={pagination}
                    onPageChange={(p) => { const f = { ...filters, page: p }; setFilters(f); fetchUsers(f); }}
                />
            </div>

            {reasonModal && (
                <ReasonModal
                    title="Administrative Suspension"
                    prompt={`You are about to suspend user access. This action will be logged in the audit trail.`}
                    onClose={(result) => handleSuspend(result)}
                />
            )}
        </div>
    );
};

const inputStyle = {
    width: "100%", padding: "12px 14px 12px 42px", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, color: "#f8fafc", fontSize: 14, outline: "none", transition: "border-color 0.2s"
};
const filterPill = {
    padding: "8px 16px", border: "none", borderRadius: 8,
    cursor: "pointer", fontSize: 13, transition: "all 0.2s"
};

export default AdminUsers;
