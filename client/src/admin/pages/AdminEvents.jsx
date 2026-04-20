import { useState, useEffect, useCallback } from "react";
import { getAdminEvents, forceCancelEvent, getEventRegistrations } from "../../api/adminApi";
import { useSelector } from "react-redux";
import { selectSelectedCampus } from "../../redux/slices/adminSlice";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";

const STATUS_OPTIONS = ["all", "draft", "published", "registration", "ongoing", "submission_locked", "judging", "completed", "cancelled"];

const AdminEvents = () => {
    const selectedCampus = useSelector(selectSelectedCampus);

    const [events, setEvents] = useState([]);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ page: 1, limit: 20, status: "all" });
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState(null);
    const [registrantsModal, setRegistrantsModal] = useState(null); // { eventId, title }
    const [registrants, setRegistrants] = useState([]);

    const fetchEvents = useCallback(async (f = filters) => {
        setLoading(true);
        try {
            const params = {
                ...f,
                status: f.status === "all" ? undefined : f.status,
                campusId: selectedCampus || undefined,
            };
            const { data } = await getAdminEvents(params);
            setEvents(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        } finally {
            setLoading(false);
        }
    }, [filters, selectedCampus]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const handleCancelEvent = async ({ confirmed, reason }) => {
        if (!confirmed || !cancelModal) return setCancelModal(null);
        await forceCancelEvent(cancelModal, { reason });
        setCancelModal(null);
        fetchEvents();
    };

    const openRegistrants = async (eventId, title) => {
        setRegistrantsModal({ eventId, title });
        const { data } = await getEventRegistrations(eventId, { limit: 50 });
        setRegistrants(data.data?.registrations || []);
    };

    const columns = [
        {
            key: "title",
            label: "Event",
            render: (e) => (
                <div>
                    <div style={{ color: "#f8fafc", fontWeight: 500 }}>{e.title}</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>
                        {e.societyId?.name} {e.isOnlineCompetition ? "· 🏆 Competition" : ""}
                    </div>
                </div>
            ),
        },
        { key: "campus",  label: "Campus",  render: (e) => e.campusId?.name || "—" },
        { key: "status",  label: "Status",  render: (e) => <AdminBadge type="status" value={e.status} /> },
        {
            key: "startAt",
            label: "Date",
            render: (e) => e.startAt
                ? new Date(e.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : "—",
        },
        { key: "registrationCount", label: "Registrants", render: (e) => e.registrationCount ?? 0 },
    ];

    const rowActions = (e) => [
        { label: "View Registrants", onClick: () => openRegistrants(e._id, e.title) },
        ...(!["cancelled", "completed"].includes(e.status)
            ? [{ label: "Cancel Event", onClick: () => setCancelModal(e._id), danger: true }]
            : []),
    ];

    const setFilter = (key, val) => {
        const f = { ...filters, [key]: val, page: 1 };
        setFilters(f);
        fetchEvents(f);
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Event Governance</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Audit system-wide events, manage lifecycle status, and oversee registration telemetry.</p>
            </div>

            {/* ── Filters & Metrics ────────────────────────── */}
            <div style={{ 
                background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, 
                padding: "20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" 
            }}>
                <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>🔍</span>
                    <input
                        placeholder="Search event registry..."
                        onChange={(e) => setFilter("q", e.target.value)}
                        style={inputStyle}
                    />
                </div>
                
                <div style={{ display: "flex", gap: 12 }}>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilter("status", e.target.value)}
                        style={selectStyle}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s === "all" ? "ALL STATUSES" : s.replace(/_/g, " ").toUpperCase()}</option>
                        ))}
                    </select>

                    <select
                        onChange={(e) => setFilter("upcoming", e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">ALL TIMES</option>
                        <option value="true">UPCOMING ONLY</option>
                    </select>
                </div>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
                <AdminTable
                    columns={columns}
                    data={events}
                    loading={loading}
                    rowActions={rowActions}
                    pagination={pagination}
                    onPageChange={(p) => { const f = { ...filters, page: p }; setFilters(f); fetchEvents(f); }}
                />
            </div>

            {/* ── Cancel Modal ─────────────────────────────── */}
            {cancelModal && (
                <ReasonModal
                    title="Administrative Cancellation"
                    prompt="Warning: This action will notify all registrants and revoke event access. Provide a mandatory reason."
                    onClose={handleCancelEvent}
                />
            )}

            {/* ── Registrants Modal (Premium) ────────────────── */}
            {registrantsModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #1e293b" }}>
                            <div>
                                <h3 style={{ fontWeight: 800, fontSize: 18, color: "#f8fafc", margin: 0 }}>Attendee Registry</h3>
                                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{registrantsModal.title}</div>
                            </div>
                            <button 
                                onClick={() => setRegistrantsModal(null)} 
                                style={{ background: "rgba(30, 41, 59, 0.5)", border: "none", color: "#64748b", cursor: "pointer", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ overflowY: "auto", maxHeight: "400px", paddingRight: 8 }}>
                            {registrants.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                                    <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                                    <div style={{ fontWeight: 600 }}>Registry Empty</div>
                                    <div style={{ fontSize: 12 }}>No successful registrations found for this node.</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {registrants.map((r) => (
                                        <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(30, 41, 59, 0.3)", borderRadius: 12, border: "1px solid transparent" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: 13 }}>
                                                    {r.userId?.profile?.displayName?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 700 }}>{r.userId?.profile?.displayName}</div>
                                                    <div style={{ color: "#64748b", fontSize: 11 }}>{r.userId?.email}</div>
                                                </div>
                                            </div>
                                            <AdminBadge type="status" value={r.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e293b", display: "flex", justifyContent: "flex-end" }}>
                            <button 
                                onClick={() => setRegistrantsModal(null)}
                                style={{ padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                            >
                                CLOSE REGISTRY
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    width: "100%", padding: "12px 14px 12px 42px", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, color: "#f8fafc", fontSize: 13, outline: "none"
};

const selectStyle = {
    padding: "12px 16px", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, color: "#f8fafc", fontSize: 12, fontWeight: 700, outline: "none", cursor: "pointer"
};

const overlayStyle = {
    position: "fixed", inset: 0, background: "rgba(10, 15, 30, 0.8)",
    backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
};

const modalStyle = {
    background: "#0f172a", borderRadius: 20, padding: 32, width: 500,
    border: "1px solid #1e293b", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

export default AdminEvents;
