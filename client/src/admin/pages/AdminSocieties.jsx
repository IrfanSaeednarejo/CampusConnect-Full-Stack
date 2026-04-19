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

// ─── AdminSocieties Main ──────────────────────────────────────────────────────

const TABS = [
    { key: "pending",  label: "Pending",  params: { status: "pending" } },
    { key: "active",   label: "Active",   params: { status: "approved" } },
    { key: "frozen",   label: "Frozen",   params: { status: "archived" } },
];

const tabBtn = (active) => ({
    padding: "8px 20px", border: "none",
    borderRadius: "8px 8px 0 0",
    background: active ? "#1e293b" : "transparent",
    color: active ? "#f8fafc" : "#64748b",
    cursor: "pointer", fontSize: 14,
    fontWeight: active ? 600 : 400,
    borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
    transition: "all 0.15s",
});

const AdminSocieties = () => {
    const [activeTab, setActiveTab] = useState("pending");
    const current = TABS.find((t) => t.key === activeTab);

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Societies</h1>

            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #334155", marginBottom: 24 }}>
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabBtn(activeTab === t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === "pending"
                ? <PendingSocietiesTab />
                : <SocietyListTab filterParams={current.params} />
            }
        </div>
    );
};

const approveBtn = { padding: "5px 14px", border: "none", borderRadius: 6, background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const rejectBtn  = { padding: "5px 14px", border: "none", borderRadius: 6, background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const inputStyle = { width: "100%", padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", fontSize: 14 };

export default AdminSocieties;
