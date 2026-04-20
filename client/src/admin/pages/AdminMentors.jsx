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
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Mentor Governance</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Manage verification lifecycle, tier assignments, and performance monitoring.</p>
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
                {activeTab === "pending" && <PendingMentorsTab />}
                {activeTab !== "pending" && <MentorListTab filterParams={tabFilterMap[activeTab]} />}
            </div>
        </div>
    );
};

// ── Shared UI Styles ─────────────────────────────────────────────────────────

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

const MentorCard = ({ mentor, onVerify, onReject }) => (
    <div style={{ background: "#0f172a", borderRadius: 20, padding: 24, border: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: 20, transition: "transform 0.2s, border-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6366f1"}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <img src={mentor.userId?.profile?.avatar || "/default-avatar.png"} alt="" style={{ width: 56, height: 56, borderRadius: 16, background: "#1e293b", objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
                <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{mentor.userId?.profile?.displayName}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{mentor.userId?.email}</div>
            </div>
        </div>

        <div style={{ background: "#1e293b", borderRadius: 12, padding: 12, fontSize: 13, color: "#94a3b8", lineHeight: 1.6, minHeight: 60 }}>
            {mentor.bio || "No professional overview provided."}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(mentor.expertise || []).map(e => (
                <span key={e} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(99, 102, 241, 0.1)", color: "#818cf8", fontSize: 11, fontWeight: 700 }}>{e.toUpperCase()}</span>
            ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1e293b" }}>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                {mentor.hourlyRate > 0 ? `${mentor.currency || "PKR"} ${mentor.hourlyRate}/hr` : "Free Service"}
            </div>
            <div style={{ color: "#64748b", fontSize: 12 }}>{mentor.userId?.campusId?.name || "Global Node"}</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <ActionButton label="Approve" color="#6366f1" onClick={onVerify} />
            <ActionButton label="Reject" color="#f43f5e" onClick={onReject} variant="outline" />
        </div>
    </div>
);

// ─── Modal Styles ─────────────────────────────────────────────────────────────

const overlayStyle = {
    position: "fixed", inset: 0, background: "rgba(10, 15, 30, 0.8)",
    backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
};
const modalStyle = {
    background: "#0f172a", borderRadius: 20, padding: 32, width: 400,
    border: "1px solid #1e293b", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

export default AdminMentors;
