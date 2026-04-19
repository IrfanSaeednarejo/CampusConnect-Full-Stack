import { useState, useEffect, useCallback } from "react";
import { getAdminStudyGroups, adminDeleteGroup, adminUpdateGroupStatus } from "../../api/adminApi";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";

export const AdminStudyGroups = () => {
    const [groups, setGroups] = useState([]);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ page: 1, limit: 20, status: "active" });
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(null);

    const fetchGroups = useCallback(async (f = filters) => {
        setLoading(true);
        try {
            const { data } = await getAdminStudyGroups(f);
            setGroups(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    const handleDelete = async ({ confirmed }) => {
        if (!confirmed || !deleteModal) return setDeleteModal(null);
        await adminDeleteGroup(deleteModal);
        setDeleteModal(null);
        fetchGroups();
    };

    const handleStatusChange = async (id, status) => {
        await adminUpdateGroupStatus(id, { status });
        fetchGroups();
    };

    const columns = [
        {
            key: "name",
            label: "Study Group",
            render: (g) => (
                <div>
                    <div style={{ color: "#f8fafc", fontWeight: 500 }}>{g.name}</div>
                    {g.subject && <div style={{ color: "#64748b", fontSize: 11 }}>{g.subject}</div>}
                </div>
            ),
        },
        { key: "campus",       label: "Campus",      render: (g) => g.campusId?.name || "—" },
        { key: "coordinator",  label: "Coordinator", render: (g) => g.coordinatorId?.profile?.displayName || "—" },
        { key: "memberCount",  label: "Members",     render: (g) => g.memberCount ?? 0 },
        { key: "status",       label: "Status",      render: (g) => <AdminBadge type="status" value={g.status} /> },
    ];

    const rowActions = (g) => [
        ...(g.status === "active"
            ? [{ label: "Archive", onClick: () => handleStatusChange(g._id, "archived") }]
            : [{ label: "Reactivate", onClick: () => handleStatusChange(g._id, "active") }]
        ),
        { label: "Delete", onClick: () => setDeleteModal(g._id), danger: true },
    ];

    const setFilter = (key, val) => {
        const f = { ...filters, [key]: val, page: 1 };
        setFilters(f);
        fetchGroups(f);
    };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Study Groups</h1>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input
                    placeholder="Search by name or subject..."
                    onChange={(e) => setFilter("q", e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", fontSize: 14 }}
                />
                {["all", "active", "archived", "deleted"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter("status", s)}
                        style={{
                            padding: "8px 14px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
                            background: filters.status === s ? "#6366f1" : "#1e293b", color: "#f8fafc",
                        }}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            <AdminTable
                columns={columns}
                data={groups}
                loading={loading}
                rowActions={rowActions}
                pagination={pagination}
                onPageChange={(p) => { const f = { ...filters, page: p }; setFilters(f); fetchGroups(f); }}
            />

            {deleteModal && (
                <ConfirmModal
                    title="Delete Study Group"
                    description="This will soft-delete the group and archive its chat. The coordinator will be notified."
                    confirmWord="DELETE"
                    danger
                    onClose={handleDelete}
                />
            )}
        </div>
    );
};

export default AdminStudyGroups;
