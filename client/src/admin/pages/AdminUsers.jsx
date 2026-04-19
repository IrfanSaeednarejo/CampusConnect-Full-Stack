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
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Users</h1>

            {/* ── Filters ──────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input
                    placeholder="Search name or email..."
                    onChange={(e) => { const f = { ...filters, q: e.target.value, page: 1 }; setFilters(f); fetchUsers(f); }}
                    style={inputStyle}
                />
                {["all", "active", "suspended"].map((s) => (
                    <button
                        key={s}
                        onClick={() => { const f = { ...filters, status: s, page: 1 }; setFilters(f); fetchUsers(f); }}
                        style={{ ...pillBtn, background: filters.status === s ? "#6366f1" : "#1e293b" }}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
                {selectedIds.length > 0 && (
                    <button style={{ ...pillBtn, background: "#dc2626" }}>
                        Bulk Suspend ({selectedIds.length})
                    </button>
                )}
            </div>

            <AdminTable
                columns={columns}
                data={users}
                loading={loading}
                rowActions={rowActions}
                onRowClick={(u) => navigate(`/admin/users/${u._id}`)}
                pagination={pagination}
                onPageChange={(p) => { const f = { ...filters, page: p }; setFilters(f); fetchUsers(f); }}
            />

            {reasonModal && (
                <ReasonModal
                    title="Suspend User"
                    prompt="Provide a reason for suspension:"
                    onClose={(result) => handleSuspend(result)}
                />
            )}
        </div>
    );
};

const inputStyle = {
    flex: 1, padding: "8px 12px", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 6, color: "#f8fafc", fontSize: 14,
};
const pillBtn = {
    padding: "8px 14px", border: "none", borderRadius: 6,
    color: "#f8fafc", cursor: "pointer", fontSize: 13,
};

export default AdminUsers;
