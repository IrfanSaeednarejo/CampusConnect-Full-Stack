import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAdminSocieties,
    getPendingSocieties,
    updateSocietyStatus,
    adminDeleteSociety,
    reassignSocietyHead,
} from "../../api/adminApi";
import { useDispatch } from "react-redux";
import { decrementPending } from "../../redux/slices/adminSlice";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";

// ─── Pending Tab ──────────────────────────────────────────────────────────────

const PendingSocietiesTab = () => {
    const dispatch = useDispatch();
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState(null);

    useEffect(() => {
        getPendingSocieties({ limit: 20 })
            .then(({ data }) => setSocieties(data.data?.docs || []))
            .finally(() => setLoading(false));
    }, []);

    const handleApprove = async (id) => {
        await updateSocietyStatus(id, { status: "approved" });
        dispatch(decrementPending({ key: "societies" }));
        setSocieties((prev) => prev.filter((s) => s._id !== id));
    };

    const handleReject = async ({ confirmed, reason }) => {
        if (!confirmed || !rejectModal) return setRejectModal(null);
        await updateSocietyStatus(rejectModal, { status: "rejected", reason });
        dispatch(decrementPending({ key: "societies" }));
        setSocieties((prev) => prev.filter((s) => s._id !== rejectModal));
        setRejectModal(null);
    };

    if (loading) return <div style={{ color: "#64748b", padding: 32 }}>Loading...</div>;
    if (societies.length === 0)
        return <div style={{ color: "#64748b", padding: 32, textAlign: "center" }}>No pending societies ✓</div>;

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {societies.map((s) => (
                    <div key={s._id} style={{ background: "#0f172a", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            {s.media?.logo && (
                                <img src={s.media.logo} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                            )}
                            <div>
                                <div style={{ color: "#f8fafc", fontWeight: 600 }}>{s.name}</div>
                                <div style={{ color: "#64748b", fontSize: 12 }}>#{s.tag} · {s.category}</div>
                            </div>
                        </div>

                        {s.description && (
                            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                                {s.description.length > 100 ? s.description.substring(0, 100) + "…" : s.description}
                            </p>
                        )}

                        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
                            Requested by:{" "}
                            <span style={{ color: "#94a3b8" }}>{s.createdBy?.profile?.displayName || s.createdBy?.email}</span>
                            {s.campusId && <span> · {s.campusId.name}</span>}
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleApprove(s._id)} style={approveBtn}>✓ Approve</button>
                            <button onClick={() => setRejectModal(s._id)} style={rejectBtn}>✗ Reject</button>
                        </div>
                    </div>
                ))}
            </div>

            {rejectModal && (
                <ReasonModal
                    title="Reject Society"
                    prompt="Provide a reason (sent to the society head):"
                    onClose={handleReject}
                />
            )}
        </div>
    );
};

// ─── Active / Frozen Tab ─────────────────────────────────────────────────────

const SocietyListTab = ({ filterParams }) => {
    const navigate = useNavigate();
    const [societies, setSocieties] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [freezeModal, setFreezeModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [searchQ, setSearchQ] = useState("");

    const fetchSocieties = useCallback(async (p = 1, q = searchQ) => {
        setLoading(true);
        try {
            const { data } = await getAdminSocieties({ ...filterParams, page: p, limit: 20, q });
            setSocieties(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        } finally {
            setLoading(false);
        }
    }, [filterParams, searchQ]);

    useEffect(() => { fetchSocieties(1); }, [fetchSocieties]);

    const handleFreeze = async ({ confirmed, reason }) => {
        if (!confirmed || !freezeModal) return setFreezeModal(null);
        await updateSocietyStatus(freezeModal, { status: "archived", reason });
        setFreezeModal(null);
        fetchSocieties(page);
    };

    const handleDelete = async ({ confirmed }) => {
        if (!confirmed || !deleteModal) return setDeleteModal(null);
        await adminDeleteSociety(deleteModal);
        setDeleteModal(null);
        fetchSocieties(page);
    };

    const columns = [
        {
            key: "name",
            label: "Society",
            render: (s) => (
                <div>
                    <div style={{ color: "#f8fafc", fontWeight: 500 }}>{s.name}</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>#{s.tag} · {s.category}</div>
                </div>
            ),
        },
        { key: "campus", label: "Campus", render: (s) => s.campusId?.name || "—" },
        { key: "memberCount", label: "Members", render: (s) => s.memberCount ?? 0 },
        { key: "status", label: "Status", render: (s) => <AdminBadge type="status" value={s.status} /> },
        { key: "createdAt", label: "Created", render: (s) => new Date(s.createdAt).toLocaleDateString() },
    ];

    const rowActions = (s) => [
        { label: "View Detail", onClick: () => navigate(`/admin/societies/${s._id}`) },
        ...(s.status !== "archived" ? [{ label: "Freeze", onClick: () => setFreezeModal(s._id), danger: true }] : []),
        ...(s.status === "archived" ? [{ label: "Reactivate", onClick: async () => { await updateSocietyStatus(s._id, { status: "approved" }); fetchSocieties(page); } }] : []),
        { label: "Delete", onClick: () => setDeleteModal(s._id), danger: true },
    ];

    return (
        <div>
            <input
                placeholder="Search societies..."
                onChange={(e) => { setSearchQ(e.target.value); fetchSocieties(1, e.target.value); }}
                style={{ ...inputStyle, marginBottom: 16 }}
            />

            <AdminTable
                columns={columns}
                data={societies}
                loading={loading}
                rowActions={rowActions}
                pagination={pagination}
                onPageChange={setPage}
                onRowClick={(s) => navigate(`/admin/societies/${s._id}`)}
            />

            {freezeModal && (
                <ReasonModal title="Freeze Society" prompt="Reason for freezing:" onClose={handleFreeze} />
            )}

            {deleteModal && (
                <ConfirmModal
                    title="Delete Society"
                    description="This will permanently delete the society and cancel all its events. This cannot be undone."
                    confirmWord="DELETE"
                    danger
                    onClose={handleDelete}
                />
            )}
        </div>
    );
};

const AdminSocieties = () => {
    const [activeTab, setActiveTab] = useState("pending");

    const TABS = [
        { key: "pending", label: "Pending Requests", params: { status: "pending" } },
        { key: "active", label: "Active Societies", params: { status: "approved" } },
        { key: "frozen", label: "Frozen / Archived", params: { status: "archived" } },
    ];

    const current = TABS.find((t) => t.key === activeTab) || TABS[0];

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Society Governance</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Moderate organizational nodes, manage leadership transitions, and audit activity.</p>
            </div>

            {/* Tabs & Navigation */}
            <div style={{ display: "flex", gap: 6, padding: 4, background: "#0f172a", borderRadius: 12, marginBottom: 32, maxWidth: "fit-content", border: "1px solid #1e293b" }}>
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        style={{
                            padding: "10px 24px", border: "none", borderRadius: 8,
                            background: activeTab === t.key ? "#6366f1" : "transparent",
                            color: activeTab === t.key ? "#fff" : "#64748b",
                            cursor: "pointer", fontSize: 12, fontWeight: 700,
                            transition: "all 0.2s"
                        }}
                    >
                        {t.label.toUpperCase()}
                    </button>
                ))}
            </div>

            <div style={{ minHeight: "400px" }}>
                {activeTab === "pending"
                    ? <PendingSocietiesTab />
                    : <SocietyListTab filterParams={current.params} />
                }
            </div>
        </div>
    );
};

// ── Shared UI Style Components ───────────────────────────────────────────────

const ActionButton = ({ label, color, onClick, variant = "solid" }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            padding: "10px",
            background: variant === "solid" ? color : "transparent",
            color: variant === "solid" ? "#fff" : color,
            border: variant === "solid" ? "none" : `1px solid ${color}`,
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            transition: "all 0.2s",
            boxShadow: variant === "solid" ? `0 4px 8px ${color}33` : "none"
        }}
    >
        {label.toUpperCase()}
    </button>
);

const SocietyCard = ({ society, onApprove, onReject }) => (
    <div style={{ background: "#0f172a", borderRadius: 20, padding: 24, border: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: 20, transition: "transform 0.2s, border-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6366f1"}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {society.media?.logo ? (
                <img src={society.media.logo} alt="" style={{ width: 56, height: 56, borderRadius: 16, background: "#1e293b", objectFit: "cover" }} />
            ) : (
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏛️</div>
            )}
            <div style={{ flex: 1 }}>
                <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{society.name}</div>
                <div style={{ color: "#64748b", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#6366f1", fontWeight: 700 }}>#{society.tag}</span>
                    <span>·</span>
                    <span>{society.category}</span>
                </div>
            </div>
        </div>

        <div style={{ background: "#1e293b", borderRadius: 12, padding: 12, fontSize: 13, color: "#94a3b8", lineHeight: 1.6, minHeight: 60 }}>
            {society.description || "No mission statement provided."}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: "1px solid #1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>Requested By:</span>
                <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{society.createdBy?.profile?.displayName || society.createdBy?.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>Campus Node:</span>
                <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{society.campusId?.name || "Global Node"}</span>
            </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
            <ActionButton label="Approve" color="#6366f1" onClick={onApprove} />
            <ActionButton label="Reject" color="#f43f5e" onClick={onReject} variant="outline" />
        </div>
    </div>
);

const inputStyle = { 
    width: "100%", padding: "12px 16px", background: "#1e293b", 
    border: "1px solid #334155", borderRadius: 12, color: "#f8fafc", 
    fontSize: 14, outline: "none", transition: "border-color 0.2s" 
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

export default AdminSocieties;
