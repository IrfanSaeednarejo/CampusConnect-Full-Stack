import { useState, useEffect, useCallback } from "react";
import { getAdminEvents, forceCancelEvent, getEventRegistrations, getPendingEvents, approveEvent, rejectEvent } from "../../api/adminApi";
import { useSelector } from "react-redux";
import { selectSelectedCampus } from "../../redux/slices/adminSlice";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";
import EventDetailModal from "../components/EventDetailModal";

const STATUS_OPTIONS = ["all", "draft", "published", "registration", "ongoing", "submission_locked", "judging", "completed", "cancelled"];

const pill = (text, bg, color, border) => (
  <span style={{ background: bg, color, border: `1px solid ${border}`, fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.08em" }}>{text}</span>
);

const AdminEvents = () => {
  const selectedCampus = useSelector(selectSelectedCampus);
  const [tab, setTab] = useState("pending");

  // All events
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: "all" });
  const [loading, setLoading] = useState(true);

  // Pending approval
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingPagination, setPendingPagination] = useState({ page: 1, pages: 1 });

  // Modals / UI
  const [detailEvent, setDetailEvent] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [registrantsModal, setRegistrantsModal] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = { ...f, status: f.status === "all" ? undefined : f.status, campusId: selectedCampus || undefined };
      const { data } = await getAdminEvents(params);
      setEvents(data.data?.docs || []);
      setPagination(data.data?.pagination || {});
    } finally { setLoading(false); }
  }, [filters, selectedCampus]);

  const fetchPending = useCallback(async (page = 1) => {
    setPendingLoading(true);
    try {
      const { data } = await getPendingEvents({ page, limit: 12, campusId: selectedCampus || undefined });
      setPendingEvents(data.data?.docs || []);
      setPendingPagination(data.data?.pagination || { page: 1, pages: 1 });
    } finally { setPendingLoading(false); }
  }, [selectedCampus]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleCancelEvent = async ({ confirmed, reason }) => {
    if (!confirmed || !cancelModal) return setCancelModal(null);
    await forceCancelEvent(cancelModal, { reason });
    setCancelModal(null);
    fetchEvents();
    showToast("Event cancelled. Participants notified.");
  };

  const handleDetailAction = (action) => {
    showToast(action === "approved" ? "✅ Event approved! Society members notified." : "Event rejected. Society head notified.");
    fetchPending();
    fetchEvents();
  };

  const openRegistrants = async (eventId, title) => {
    setRegistrantsModal({ eventId, title });
    const { data } = await getEventRegistrations(eventId, { limit: 50 });
    setRegistrants(data.data?.registrations || []);
  };

  const setFilter = (key, val) => {
    const f = { ...filters, [key]: val, page: 1 };
    setFilters(f);
    fetchEvents(f);
  };

  const columns = [
    {
      key: "title", label: "Event",
      render: (e) => (
        <div>
          <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{e.title}</div>
          <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>{e.societyId?.name || "—"} {e.isOnlineCompetition ? "· 🏆" : ""}</div>
        </div>
      )
    },
    { key: "campus", label: "Campus", render: (e) => <span style={{ color: "#94a3b8", fontSize: 13 }}>{e.campusId?.name || "—"}</span> },
    { key: "status", label: "Status", render: (e) => <AdminBadge type="status" value={e.status} /> },
    {
      key: "approvalStatus", label: "Approval",
      render: (e) => {
        const cfg = { approved: ["rgba(16,185,129,0.15)", "#34d399", "rgba(16,185,129,0.3)"], pending_admin_review: ["rgba(245,158,11,0.15)", "#fbbf24", "rgba(245,158,11,0.3)"], rejected: ["rgba(239,68,68,0.1)", "#f87171", "rgba(239,68,68,0.3)"] }[e.approvalStatus] || ["#1e293b", "#64748b", "#334155"];
        return pill(e.approvalStatus?.replace(/_/g, " ") || "—", ...cfg);
      }
    },
    { key: "startAt", label: "Date", render: (e) => e.startAt ? new Date(e.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—" },
  ];

  const rowActions = (e) => [
    { label: "View Details", onClick: () => setDetailEvent(e) },
    { label: "View Registrants", onClick: () => openRegistrants(e._id, e.title) },
    ...(["pending_admin_review"].includes(e.approvalStatus) ? [
      { label: "Approve", onClick: async () => { 
        try {
          await approveEvent(e._id); 
          showToast("✅ Approved!"); 
          fetchPending(); 
          fetchEvents(); 
        } catch(err) {
          showToast(err.response?.data?.message || "Failed to approve", "error");
          fetchPending();
        }
      } },
      { label: "Reject", onClick: () => setRejectModal(e._id), danger: true },
    ] : []),
    ...(!["cancelled", "completed"].includes(e.status) ? [{ label: "Force Cancel", onClick: () => setCancelModal(e._id), danger: true }] : []),
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Event Governance</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Review approval requests and manage the full event registry.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ marginBottom: 20, padding: "12px 18px", background: toast.type === "error" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)", border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)"}`, borderRadius: 12, color: toast.type === "error" ? "#f87171" : "#34d399", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          {toast.msg}
        </div>
      )}

      {/* Summary row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Pending Review", value: pendingPagination.total || pendingEvents.length, bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.25)" },
          { label: "Total Events", value: pagination.total || events.length, bg: "rgba(99,102,241,0.1)", color: "#818cf8", border: "rgba(99,102,241,0.25)" },
        ].map(({ label, value, bg, color, border }) => (
          <div key={label} style={{ padding: "10px 18px", background: bg, border: `1px solid ${border}`, borderRadius: 12, color, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{value}</span>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: 4, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, width: "fit-content" }}>
        {[{ key: "pending", label: "⏳ Approval Queue", count: pendingEvents.length }, { key: "all", label: "📋 All Events" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 20px", background: tab === t.key ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", color: tab === t.key ? "#fff" : "#64748b", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}>
            {t.label}
            {t.count > 0 && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "1px 7px", fontSize: 11 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ─── Pending Approval Tab ─── */}
      {tab === "pending" && (
        <div>
          <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, color: "#fbbf24", fontSize: 13 }}>
            ⏳ <strong>Review carefully</strong> — approving an event will notify all society members and list it publicly.
          </div>

          {pendingLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 260, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, animation: "pulse 1.5s infinite" }} />)}
            </div>
          ) : pendingEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Inbox Zero!</div>
              <div style={{ color: "#64748b", fontSize: 14 }}>No events are pending your review right now.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {pendingEvents.map(ev => (
                <div key={ev._id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.boxShadow = "0 8px 32px -8px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.boxShadow = "none"; }}>
                  {/* Cover */}
                  {ev.coverImage
                    ? <div style={{ height: 130, overflow: "hidden", position: "relative" }}><img src={ev.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0f172a 0%, transparent 60%)" }} /></div>
                    : <div style={{ height: 60, background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 28 }}>📅</span></div>
                  }
                  <div style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
                      <h3 style={{ color: "#f8fafc", fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1.3 }}>{ev.title}</h3>
                      {ev.isOnlineCompetition && pill("🏆 Competition", "rgba(99,102,241,0.15)", "#818cf8", "rgba(99,102,241,0.3)")}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 12, marginBottom: 10 }}>
                      <strong style={{ color: "#94a3b8" }}>{ev.societyId?.name}</strong>
                      {" · "}{ev.eventType?.replace(/_/g, " ")} · {ev.category}
                    </div>
                    {ev.createdBy && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#1e293b", borderRadius: 10, marginBottom: 12 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 8, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#6366f1", fontSize: 12 }}>
                          {ev.createdBy?.profile?.displayName?.[0] || "?"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{ev.createdBy?.profile?.displayName}</div>
                          <div style={{ color: "#475569", fontSize: 10 }}>{ev.createdBy?.email}</div>
                        </div>
                        {ev.startAt && <span style={{ color: "#475569", fontSize: 11 }}>📅 {new Date(ev.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                      </div>
                    )}
                    {ev.description && <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ev.description}</p>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setDetailEvent(ev)} style={{ flex: 1, padding: "9px", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        View Details
                      </button>
                      <button onClick={async (e) => { 
                        e.currentTarget.disabled = true;
                        try { 
                          await approveEvent(ev._id); 
                          handleDetailAction("approved"); 
                        } catch (err) { 
                          showToast(err.response?.data?.message || "Failed to approve", "error"); 
                          fetchPending(); 
                        } 
                      }} style={{ flex: 1, padding: "9px", background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => setRejectModal(ev._id)} style={{ padding: "9px 14px", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        ❌
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination */}
          {pendingPagination.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {Array.from({ length: pendingPagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchPending(p)} style={{ width: 36, height: 36, border: "none", borderRadius: 8, background: p === pendingPagination.page ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e293b", color: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── All Events Tab ─── */}
      {tab === "all" && (
        <>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20, marginBottom: 20, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 14 }}>🔍</span>
              <input placeholder="Search events…" onChange={e => setFilter("q", e.target.value)} style={{ width: "100%", padding: "11px 14px 11px 40px", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f8fafc", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <select value={filters.status} onChange={e => setFilter("status", e.target.value)} style={{ padding: "11px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f8fafc", fontSize: 12, fontWeight: 700, outline: "none", cursor: "pointer" }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
            <AdminTable columns={columns} data={events} loading={loading} rowActions={rowActions} onRowClick={(e) => setDetailEvent(e)} pagination={pagination} onPageChange={p => { const f = { ...filters, page: p }; setFilters(f); fetchEvents(f); }} />
          </div>
        </>
      )}

      {/* Modals */}
      {detailEvent && (
        <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} onAction={handleDetailAction} />
      )}
      {cancelModal && <ReasonModal title="Force Cancel Event" prompt="This will cancel the event and notify all registered participants." onClose={handleCancelEvent} />}
      {rejectModal && (
        <ReasonModal
          title="Reject Event Request"
          prompt="Provide a clear reason. The society head will see this and be notified."
          onClose={async ({ confirmed, reason }) => {
            if (confirmed) {
              try { await rejectEvent(rejectModal, { reason }); handleDetailAction("rejected"); } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
            }
            setRejectModal(null);
          }}
        />
      )}
      {registrantsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,20,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: 32, width: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 40px 80px -12px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #1e293b" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: "#f8fafc", margin: 0 }}>Registrant Registry</h3>
                <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>{registrantsModal.title}</p>
              </div>
              <button onClick={() => setRegistrantsModal(null)} style={{ width: 32, height: 32, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#64748b", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {registrants.length === 0
                ? <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}><div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>No registrants yet</div>
                : registrants.map(r => (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#1e293b", borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: 12 }}>{r.userId?.profile?.displayName?.[0] || "?"}</div>
                      <div>
                        <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600 }}>{r.userId?.profile?.displayName}</div>
                        <div style={{ color: "#475569", fontSize: 11 }}>{r.userId?.email}</div>
                      </div>
                    </div>
                    <AdminBadge type="status" value={r.status} />
                  </div>
                ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1e293b", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setRegistrantsModal(null)} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
