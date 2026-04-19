import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAdminMentors,
    getPendingMentors,
    verifyMentor,
    rejectMentor,
    suspendMentor,
    overrideMentorTier,
} from "../../api/adminApi";
import { useDispatch } from "react-redux";
import { decrementPending } from "../../redux/slices/adminSlice";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";

// ─── Shared styles ────────────────────────────────────────────────────────────

const tabBtn = (active) => ({
    padding: "8px 20px",
    border: "none",
    borderRadius: "8px 8px 0 0",
    background: active ? "#1e293b" : "transparent",
    color: active ? "#f8fafc" : "#64748b",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
    transition: "all 0.15s",
});

const actionBtn = (color) => ({
    padding: "5px 14px",
    border: "none",
    borderRadius: 6,
    background: color,
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
});

// ─── Pending Tab ──────────────────────────────────────────────────────────────

const PendingMentorsTab = () => {
    const dispatch = useDispatch();
    const [mentors, setMentors] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState(null); // mentorId

    const fetchPending = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await getPendingMentors({ page: p, limit: 12 });
            setMentors(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(page); }, [page, fetchPending]);

    const handleVerify = async (mentorId) => {
        await verifyMentor(mentorId);
        dispatch(decrementPending({ key: "mentors" }));
        setMentors((prev) => prev.filter((m) => m._id !== mentorId));
    };

    const handleReject = async ({ confirmed, reason }) => {
        if (!confirmed || !rejectModal) return setRejectModal(null);
        await rejectMentor(rejectModal, { reason });
        dispatch(decrementPending({ key: "mentors" }));
        setMentors((prev) => prev.filter((m) => m._id !== rejectModal));
        setRejectModal(null);
    };

    if (loading) return <div style={{ color: "#64748b", padding: 32 }}>Loading...</div>;

    if (mentors.length === 0)
        return <div style={{ color: "#64748b", padding: 32, textAlign: "center" }}>No pending mentor applications ✓</div>;

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {mentors.map((mentor) => (
                    <div key={mentor._id} style={{
                        background: "#0f172a", borderRadius: 12, padding: 20,
                        border: "1px solid #334155",
                    }}>
                        {/* Header */}
                        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                            <img
                                src={mentor.userId?.profile?.avatar || ""}
                                alt=""
                                style={{ width: 44, height: 44, borderRadius: "50%", background: "#334155", objectFit: "cover" }}
                            />
                            <div>
                                <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>
                                    {mentor.userId?.profile?.displayName || "Unknown"}
                                </div>
                                <div style={{ color: "#64748b", fontSize: 12 }}>
                                    {mentor.userId?.email}
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {mentor.bio && (
                            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                                {mentor.bio.length > 100 ? mentor.bio.substring(0, 100) + "…" : mentor.bio}
                            </p>
                        )}

                        {/* Expertise tags */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                            {(mentor.expertise || []).slice(0, 5).map((e) => (
                                <span key={e} style={{
                                    padding: "2px 8px", background: "#1e293b", borderRadius: 4,
                                    color: "#94a3b8", fontSize: 11, border: "1px solid #334155",
                                }}>
                                    {e}
                                </span>
                            ))}
                        </div>

                        {/* Rate + campus */}
                        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>
                            {mentor.hourlyRate > 0 ? `${mentor.currency || "PKR"} ${mentor.hourlyRate}/hr` : "Free"} ·{" "}
                            {mentor.userId?.campusId?.name || "Unknown Campus"}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleVerify(mentor._id)} style={actionBtn("#16a34a")}>
                                ✓ Approve
                            </button>
                            <button onClick={() => setRejectModal(mentor._id)} style={actionBtn("#dc2626")}>
                                ✗ Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} style={{
                            width: 32, height: 32, border: "none", borderRadius: 6,
                            background: p === page ? "#6366f1" : "#1e293b", color: "#f8fafc", cursor: "pointer",
                        }}>{p}</button>
                    ))}
                </div>
            )}

            {rejectModal && (
                <ReasonModal
                    title="Reject Mentor Application"
                    prompt="Provide a reason (will be sent to the applicant):"
                    onClose={handleReject}
                />
            )}
        </div>
    );
};

// ─── Verified / Suspended Tab ─────────────────────────────────────────────────

const MentorListTab = ({ filterParams }) => {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [suspendModal, setSuspendModal] = useState(null);
    const [tierModal, setTierModal] = useState(null);

    const fetchMentors = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await getAdminMentors({ ...filterParams, page: p, limit: 20 });
            setMentors(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        } finally {
            setLoading(false);
        }
    }, [filterParams]);

    useEffect(() => { fetchMentors(page); }, [page, fetchMentors]);

    const handleSuspend = async ({ confirmed, reason }) => {
        if (!confirmed || !suspendModal) return setSuspendModal(null);
        await suspendMentor(suspendModal, { reason });
        setSuspendModal(null);
        fetchMentors(page);
    };

    const handleTierOverride = async (mentorId, tier) => {
        await overrideMentorTier(mentorId, { tier });
        setTierModal(null);
        fetchMentors(page);
    };

    const columns = [
        {
            key: "user",
            label: "Mentor",
            render: (m) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={m.userId?.profile?.avatar || ""} alt="" style={{ width: 32, height: 32, borderRadius: "50%", background: "#334155" }} />
                    <div>
                        <div style={{ color: "#f8fafc", fontWeight: 500 }}>{m.userId?.profile?.displayName}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>{m.userId?.email}</div>
                    </div>
                </div>
            ),
        },
        { key: "tier", label: "Tier", render: (m) => <AdminBadge type="tier" value={m.tier} /> },
        { key: "totalSessions", label: "Sessions", render: (m) => m.totalSessions ?? 0 },
        { key: "averageRating", label: "Rating", render: (m) => m.averageRating ? `⭐ ${m.averageRating}` : "—" },
        { key: "isActive", label: "Status", render: (m) => <AdminBadge type="status" value={m.isActive ? "active" : "suspended"} /> },
    ];

    const rowActions = (m) => [
        { label: "View Profile", onClick: () => navigate(`/admin/mentors/${m._id}`) },
        ...(m.isActive ? [{ label: "Suspend", onClick: () => setSuspendModal(m._id), danger: true }] : []),
        { label: "Override Tier", onClick: () => setTierModal(m) },
    ];

    return (
        <div>
            <AdminTable
                columns={columns}
                data={mentors}
                loading={loading}
                rowActions={rowActions}
                pagination={pagination}
                onPageChange={setPage}
                onRowClick={(m) => navigate(`/admin/mentors/${m._id}`)}
            />

            {suspendModal && (
                <ReasonModal title="Suspend Mentor" prompt="Reason for suspension:" onClose={handleSuspend} />
            )}

            {tierModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Override Tier — {tierModal.userId?.profile?.displayName}</h3>
                        <div style={{ display: "flex", gap: 8 }}>
                            {["bronze", "silver", "gold"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleTierOverride(tierModal._id, t)}
                                    style={{ ...actionBtn(t === "gold" ? "#d97706" : t === "silver" ? "#64748b" : "#92400e"), flex: 1 }}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setTierModal(null)} style={{ ...actionBtn("#334155"), width: "100%", marginTop: 12 }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── AdminMentors Main ────────────────────────────────────────────────────────

const TABS = [
    { key: "pending",   label: "Pending" },
    { key: "verified",  label: "Verified" },
    { key: "suspended", label: "Suspended" },
];

const AdminMentors = () => {
    const [activeTab, setActiveTab] = useState("pending");

    const tabFilterMap = {
        verified:  { verified: true, isActive: true },
        suspended: { isActive: false },
    };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Mentors</h1>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #334155", marginBottom: 24 }}>
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabBtn(activeTab === t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === "pending" && <PendingMentorsTab />}
            {activeTab !== "pending" && <MentorListTab filterParams={tabFilterMap[activeTab]} />}
        </div>
    );
};

// ─── Shared modal styles ──────────────────────────────────────────────────────

const overlayStyle = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
};
const modalStyle = {
    background: "#1e293b", borderRadius: 12, padding: 28, width: 360,
    border: "1px solid #334155",
};

export default AdminMentors;
