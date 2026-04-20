import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
    getAdminStudyGroups, 
    adminUpdateGroupStatus, 
    adminDeleteGroup 
} from "../../api/adminApi";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";
import CreateStudyGroupModal from "../components/CreateStudyGroupModal";
import { toast } from "react-hot-toast";

const AdminStudyGroups = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("active");
    const [searchQ, setSearchQ] = useState("");
    const [groups, setGroups] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [archiveModal, setArchiveModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    const TABS = [
        { key: "pending", label: "Pending Requests" },
        { key: "active", label: "Active Groups" },
        { key: "archived", label: "Frozen / Archived" },
    ];

    const fetchGroups = useCallback(async (p = 1, q = searchQ) => {
        setLoading(true);
        try {
            const { data } = await getAdminStudyGroups({ 
                status: activeTab === "active" ? "active" : (activeTab === "pending" ? "pending" : "archived"), 
                page: p, 
                limit: 20,
                q: q.trim()
            });
            setGroups(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        } catch (err) {
            toast.error("Failed to load study groups");
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQ]);

    useEffect(() => {
        fetchGroups(1);
    }, [fetchGroups]);

    const handleStatusUpdate = async (id, status, reason = "") => {
        try {
            await adminUpdateGroupStatus(id, { status, reason });
            toast.success(`Group ${status} successfuly`);
            fetchGroups(page);
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const handleArchive = async ({ confirmed, reason }) => {
        if (!confirmed || !archiveModal) return setArchiveModal(null);
        await handleStatusUpdate(archiveModal, "archived", reason);
        setArchiveModal(null);
    };

    const handleDelete = async ({ confirmed }) => {
        if (!confirmed || !deleteModal) return setDeleteModal(null);
        try {
            await adminDeleteGroup(deleteModal);
            toast.success("Study group deleted");
            fetchGroups(page);
        } catch (err) {
            toast.error("Deletion failed");
        } finally {
            setDeleteModal(null);
        }
    };

    const columns = [
        {
            key: "name",
            label: "Study Group",
            render: (g) => (
                <div>
                    <div style={{ color: "#f8fafc", fontWeight: 500 }}>{g.name}</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>{g.subject} · {g.course || "General"}</div>
                </div>
            )
        },
        {
            key: "leader",
            label: "Group Leader",
            render: (g) => (
                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                    {g.coordinatorId?.profile?.displayName || "Unknown"}
                </div>
            )
        },
        {
            key: "members",
            label: "Members",
            render: (g) => (
                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                    {g.memberCount || 0} <span style={{ color: "#475569" }}>/ {g.maxMembers}</span>
                </div>
            )
        },
        {
            key: "campus",
            label: "Campus",
            render: (g) => <span style={{ color: "#64748b", fontSize: 13 }}>{g.campusId?.name || "—"}</span>
        },
        {
            key: "status",
            label: "Status",
            render: (g) => <AdminBadge type="status" value={g.status} />
        }
    ];

    const rowActions = (g) => [
        { label: "View Detail", onClick: () => navigate(`/admin/study-groups/${g._id}`) },
        ...(g.status === "pending" ? [
            { label: "Approve", onClick: () => handleStatusUpdate(g._id, "active") },
            { label: "Reject", onClick: () => setArchiveModal(g._id), danger: true }
        ] : []),
        ...(g.status === "active" ? [
            { label: "Archive", onClick: () => setArchiveModal(g._id), danger: true }
        ] : []),
        ...(g.status === "archived" ? [
            { label: "Reactivate", onClick: () => handleStatusUpdate(g._id, "active") }
        ] : []),
        { label: "Delete", onClick: () => setDeleteModal(g._id), danger: true }
    ];

    const PendingGroupsTab = () => {
        if (loading) return <div style={{ color: "#64748b", padding: 32 }}>Loading...</div>;
        if (groups.length === 0)
            return <div style={{ color: "#64748b", padding: 32, textAlign: "center" }}>No pending study group requests ✓</div>;

        return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {groups.map((g) => (
                    <div 
                        key={g._id} 
                        onClick={() => navigate(`/admin/study-groups/${g._id}`)}
                        style={{ background: "#0f172a", borderRadius: 12, padding: 20, border: "1px solid #334155", cursor: "pointer", transition: "border-color 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6366f1"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#334155"}
                    >
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
                            <div>
                                <div style={{ color: "#f8fafc", fontWeight: 600 }}>{g.name}</div>
                                <div style={{ color: "#64748b", fontSize: 12 }}>{g.subject} · {g.course || "General"}</div>
                            </div>
                        </div>

                        {g.description && (
                            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                                {g.description.length > 100 ? g.description.substring(0, 100) + "…" : g.description}
                            </p>
                        )}

                        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
                            Coordinator:{" "}
                            <span style={{ color: "#94a3b8" }}>{g.coordinatorId?.profile?.displayName || g.coordinatorId?.email}</span>
                            {g.campusId && <span> · {g.campusId.name}</span>}
                        </div>

                        <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleStatusUpdate(g._id, "active")} style={approveBtn}>✓ Approve</button>
                            <button onClick={() => setArchiveModal(g._id)} style={rejectBtn}>✗ Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Study Group Governance</h1>
                    <p style={{ color: "#64748b", marginTop: 4 }}>Moderate collaborative labs, manage group leadership, and audit participation metrics.</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    style={createBtnStyle}
                >
                    <span style={{ fontSize: 18 }}>+</span> CREATE STUDY GROUP
                </button>
            </div>

            {/* Tabs */}
            <div style={tabContainerStyle}>
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        style={{
                            ...tabButtonStyle,
                            background: activeTab === t.key ? "#6366f1" : "transparent",
                            color: activeTab === t.key ? "#fff" : "#64748b",
                        }}
                    >
                        {t.label.toUpperCase()}
                    </button>
                ))}
            </div>

            <div style={{ minHeight: "400px" }}>
                <input
                    placeholder="Search study groups..."
                    value={searchQ}
                    onChange={(e) => { setSearchQ(e.target.value); fetchGroups(1, e.target.value); }}
                    style={inputStyle}
                />

                {activeTab === "pending" ? (
                    <PendingGroupsTab />
                ) : (
                    <AdminTable 
                        columns={columns}
                        data={groups}
                        loading={loading}
                        rowActions={rowActions}
                        pagination={pagination}
                        onPageChange={(p) => { setPage(p); fetchGroups(p); }}
                        onRowClick={(g) => navigate(`/admin/study-groups/${g._id}`)}
                    />
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateStudyGroupModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setActiveTab("active"); fetchGroups(1); }}
                />
            )}

            {archiveModal && (
                <ReasonModal 
                    title={activeTab === "pending" ? "Reject Group Request" : "Archive Study Group"} 
                    prompt="Reason for this action (sent to the group leader):" 
                    onClose={handleArchive} 
                />
            )}

            {deleteModal && (
                <ConfirmModal 
                    title="Delete Study Group"
                    description="This will permanently delete the group and archive its chats. This action cannot be undone."
                    confirmWord="DELETE"
                    danger
                    onClose={handleDelete}
                />
            )}
        </div>
    );
};

// ── Styles ──────────────────────────────────────────────────────────────────

const createBtnStyle = { 
    background: "#6366f1", color: "#fff", border: "none", 
    padding: "12px 24px", borderRadius: 12, fontWeight: 700, 
    fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)"
};

const tabContainerStyle = { 
    display: "flex", gap: 6, padding: 4, background: "#0f172a", 
    borderRadius: 12, marginBottom: 32, maxWidth: "fit-content", 
    border: "1px solid #1e293b" 
};

const tabButtonStyle = {
    padding: "10px 24px", border: "none", borderRadius: 8,
    cursor: "pointer", fontSize: 12, fontWeight: 700,
    transition: "all 0.2s"
};

const inputStyle = { 
    width: "100%", padding: "12px 16px", background: "#1e293b", 
    border: "1px solid #334155", borderRadius: 12, color: "#f8fafc", 
    fontSize: 14, outline: "none", transition: "border-color 0.2s",
    marginBottom: 16
};

const approveBtn = {
    padding: "6px 16px", background: "#6366f1", color: "#fff",
    border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
    boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)"
};

const rejectBtn = {
    padding: "6px 16px", background: "transparent", color: "#94a3b8",
    border: "1px solid #334155", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600
};

export default AdminStudyGroups;
