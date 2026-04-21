import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { approveEvent, rejectEvent } from "../../api/adminApi";
import ReasonModal from "../components/ReasonModal";
import EventDetailModal from "../components/EventDetailModal";

const TYPE_CFG = {
  mentor:      { label: "Mentor", icon: "🎓", bg: "rgba(99,102,241,0.15)", color: "#818cf8", border: "rgba(99,102,241,0.3)" },
  society:     { label: "Society", icon: "🏛️", bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  event:       { label: "Event", icon: "📅", bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  study_group: { label: "Study Group", icon: "📚", bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.3)" },
};

const FILTERS = ["all", "mentor", "society", "event", "study_group"];

// Backend uses plural keys for type filter; map display keys to API params
const FILTER_API_MAP = { mentor: "mentors", society: "societies", event: "events", study_group: "study_groups" };

const AdminRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const apiType = filter === "all" ? "all" : (FILTER_API_MAP[filter] ?? filter);
      const { data } = await axios.get("/admin/requests", { params: { type: apiType } });
      setRequests(data.data || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, type, action, reason = "") => {
    try {
      let endpoint = "", method = "PATCH", payload = {};
      if (type === "mentor") {
        endpoint = `/admin/mentors/${requestId}/${action === "approve" ? "verify" : "reject"}`;
        payload = action === "reject" ? { reason } : {};
      } else if (type === "society") {
        endpoint = `/admin/societies/${requestId}/status`;
        payload = { status: action === "approve" ? "approved" : "rejected", reason };
      } else if (type === "event") {
        if (action === "approve") await approveEvent(requestId);
        else await rejectEvent(requestId, { reason });
        showToast(action === "approve" ? "✅ Event approved! Society members notified." : "Event rejected. Society head notified.");
        fetchRequests();
        return;
      } else if (type === "study_group") {
        if (action === "approve") { endpoint = `/admin/study-groups/${requestId}/status`; payload = { status: "active" }; }
        else { method = "DELETE"; endpoint = `/admin/study-groups/${requestId}`; }
      }
      await axios({ method, url: endpoint, data: payload });
      showToast(action === "approve" ? "Request approved." : "Request rejected.");
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || "Action failed";
      if (msg.includes("already")) {
        showToast(action === "approve" ? "Request approved." : "Request rejected.");
        fetchRequests();
      } else {
        showToast(msg, "error");
      }
    }
  };

  // Count per type
  const counts = requests.reduce((acc, r) => {
    acc[r.requestType] = (acc[r.requestType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Pending Requests</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Review and take action on all pending approval requests across the platform.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ marginBottom: 20, padding: "12px 18px", background: toast.type === "error" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)", border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)"}`, borderRadius: 12, color: toast.type === "error" ? "#f87171" : "#34d399", fontSize: 14, fontWeight: 600 }}>
          {toast.msg}
        </div>
      )}

      {/* Summary Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {Object.entries(counts).map(([type, count]) => {
          const cfg = TYPE_CFG[type] || { label: type, icon: "•", bg: "#1e293b", color: "#64748b", border: "#334155" };
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, color: cfg.color, fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={() => setFilter(type)}>
              <span>{cfg.icon}</span> {count} {cfg.label} request{count > 1 ? "s" : ""}
            </div>
          );
        })}
        {requests.length === 0 && !loading && (
          <div style={{ color: "#34d399", fontWeight: 600, fontSize: 14, padding: "8px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12 }}>
            ✅ All clear — no pending requests!
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: 4, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, width: "fit-content", flexWrap: "wrap" }}>
        {FILTERS.map(f => {
          const cfg = TYPE_CFG[f] || {};
          const cnt = f === "all" ? requests.length : (counts[f] || 0);
          return (
            <button key={f} onClick={() => setFilter(f === filter ? "all" : f)} style={{ padding: "9px 16px", background: filter === f ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", color: filter === f ? "#fff" : "#64748b", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
              {cfg.icon || "📋"} {f === "all" ? "All" : cfg.label || f}
              {cnt > 0 && <span style={{ background: filter === f ? "rgba(255,255,255,0.25)" : "#1e293b", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 80, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, animation: "pulse 1.5s infinite" }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Nothing here!</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>No pending {filter === "all" ? "requests" : filter.replace("_", " ")} at the moment.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map((row) => {
            const cfg = TYPE_CFG[row.requestType] || { label: row.requestType, icon: "•", bg: "#1e293b", color: "#64748b", border: "#334155" };
            const user = row.userId || row.createdBy || row.coordinatorId;
            const subject = row.name || row.title || "Untitled";
            const isEvent = row.requestType === "event";

            return (
              <div key={row._id}
                style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, transition: "border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.boxShadow = "0 4px 20px -4px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Type Badge */}
                <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.08em" }}>
                      {cfg.label.toUpperCase()}
                    </span>
                    <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 15 }}>{subject}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    {user && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontSize: 10, fontWeight: 700 }}>
                          {user?.profile?.displayName?.[0] || "?"}
                        </div>
                        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{user?.profile?.displayName}</span>
                        {user?.email && <span style={{ color: "#475569", fontSize: 11 }}>· {user.email}</span>}
                      </div>
                    )}
                    {row.societyId?.name && <span style={{ color: "#64748b", fontSize: 12 }}>🏛️ {row.societyId.name}</span>}
                    <span style={{ color: "#475569", fontSize: 11 }}>{new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                  {isEvent && (
                    <button
                      onClick={() => setDetailEvent(row)}
                      style={{ padding: "8px 14px", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}
                    >
                      View Details
                    </button>
                  )}
                  <button
                    onClick={async (e) => {
                      e.currentTarget.disabled = true;
                      await handleAction(row._id, row.requestType, "approve");
                    }}
                    style={{ padding: "8px 16px", background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => { setSelectedRequest(row); setShowRejectModal(true); }}
                    style={{ padding: "8px 16px", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onAction={(action) => {
            showToast(action === "approved" ? "✅ Event approved! Society members notified." : "Event rejected.");
            setDetailEvent(null);
            fetchRequests();
          }}
        />
      )}

      {showRejectModal && (
        <ReasonModal
          title={`Reject ${selectedRequest?.requestType?.replace("_", " ")} Request`}
          prompt="Provide a clear reason for rejection. The requester will be notified."
          onClose={({ confirmed, reason }) => {
            if (confirmed) handleAction(selectedRequest._id, selectedRequest.requestType, "reject", reason);
            setShowRejectModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminRequests;
