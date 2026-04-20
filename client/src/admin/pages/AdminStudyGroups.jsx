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
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Study Group Governance</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Monitor academic nodes, manage coordination status, and audit member engagement.</p>
            </div>

            {/* ── Search & Filter Bar ────────────────────────── */}
            <div style={{ 
                background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, 
                padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center" 
            }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>🔍</span>
                    <input
                        placeholder="Search by name or academic subject..."
                        onChange={(e) => setFilter("q", e.target.value)}
                        style={inputStyle}
                    />
                </div>
                
                <div style={{ display: "flex", gap: 6, background: "#1e293b", padding: 4, borderRadius: 10 }}>
                    {["all", "active", "archived", "deleted"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter("status", s)}
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
                    data={groups}
                    loading={loading}
                    rowActions={rowActions}
                    pagination={pagination}
                    onPageChange={(p) => { const f = { ...filters, page: p }; setFilters(f); fetchGroups(f); }}
                />
            </div>

            {deleteModal && (
                <ConfirmModal
                    title="Administrative Deletion"
                    description="This node will be soft-deleted. The coordinator will be notified via system pulse. This action is tracked in the audit log."
                    confirmWord="DELETE GROUP"
                    danger
                    onClose={handleDelete}
                />
            )}
        </div>
    );
};

const inputStyle = {
    width: "100%", padding: "12px 14px 12px 42px", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, color: "#f8fafc", fontSize: 13, outline: "none"
};

const filterPill = {
    padding: "8px 16px", border: "none", borderRadius: 8,
    cursor: "pointer", fontSize: 12, transition: "all 0.2s"
};

export default AdminStudyGroups;
