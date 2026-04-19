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
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Events</h1>

            {/* ── Filter bar ──────────────────────────────── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <input
                    placeholder="Search events..."
                    onChange={(e) => setFilter("q", e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", fontSize: 14, minWidth: 200 }}
                />
                <select
                    value={filters.status}
                    onChange={(e) => setFilter("status", e.target.value)}
                    style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", fontSize: 13 }}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</option>
                    ))}
                </select>
                <select
                    onChange={(e) => setFilter("upcoming", e.target.value)}
                    style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", fontSize: 13 }}
                >
                    <option value="">All Time</option>
                    <option value="true">Upcoming Only</option>
                </select>
            </div>

            <AdminTable
                columns={columns}
                data={events}
                loading={loading}
                rowActions={rowActions}
                pagination={pagination}
                onPageChange={(p) => { const f = { ...filters, page: p }; setFilters(f); fetchEvents(f); }}
            />

            {/* ── Cancel Modal ─────────────────────────────── */}
            {cancelModal && (
                <ReasonModal
                    title="Force Cancel Event"
                    prompt="All registrants will be notified. Enter a reason:"
                    onClose={handleCancelEvent}
                />
            )}

            {/* ── Registrants Modal ─────────────────────────── */}
            {registrantsModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
                    <div style={{ background: "#1e293b", borderRadius: 12, padding: 28, width: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", border: "1px solid #334155" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <h3 style={{ fontWeight: 700 }}>Registrants — {registrantsModal.title}</h3>
                            <button onClick={() => setRegistrantsModal(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
                        </div>
                        <div style={{ overflowY: "auto" }}>
                            {registrants.length === 0
                                ? <div style={{ color: "#64748b", textAlign: "center", padding: 32 }}>No registrants</div>
                                : registrants.map((r) => (
                                    <div key={r._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #334155" }}>
                                        <div>
                                            <div style={{ color: "#f8fafc", fontSize: 14 }}>{r.userId?.profile?.displayName}</div>
                                            <div style={{ color: "#64748b", fontSize: 12 }}>{r.userId?.email}</div>
                                        </div>
                                        <AdminBadge type="status" value={r.status} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
