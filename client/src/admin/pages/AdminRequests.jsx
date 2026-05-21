import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useHomeTheme from "@/hooks/useHomeTheme";
import axios from "../../api/axios";
import { approveEvent, rejectEvent } from "../../api/adminApi";
import ReasonModal from "../components/ReasonModal";
import EventDetailModal from "../components/EventDetailModal";
import { getButtonClassName } from "../../components/common/Button";

const TYPE_CFG = {
  mentor: {
    label: "Mentor",
    icon: "🎓",
    bg: "rgba(99,102,241,0.15)",
    color: "#818cf8",
    border: "rgba(99,102,241,0.3)",
  },
  society: {
    label: "Society",
    icon: "🏛️",
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    border: "rgba(16,185,129,0.3)",
  },
  event: {
    label: "Event",
    icon: "📅",
    bg: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    border: "rgba(245,158,11,0.3)",
  },
  study_group: {
    label: "Study Group",
    icon: "📚",
    bg: "rgba(168,85,247,0.12)",
    color: "#c084fc",
    border: "rgba(168,85,247,0.3)",
  },
};

const FILTERS = ["all", "mentor", "society", "event", "study_group"];
const FILTER_API_MAP = { mentor: "mentors", society: "societies", event: "events", study_group: "study_groups" };

const AdminRequests = () => {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedColor = isDark ? "#64748b" : "#64748b";
  const subtleText = isDark ? "#94a3b8" : "#475569";
  const surface = isDark ? "#0f172a" : "#ffffff";
  const softSurface = isDark ? "#1e293b" : "#f8fafc";
  const border = isDark ? "#1e293b" : "#dbe4ee";
  const softBorder = isDark ? "#334155" : "#e2e8f0";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const apiType = filter === "all" ? "all" : FILTER_API_MAP[filter] ?? filter;
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
      let endpoint = "";
      let method = "PATCH";
      let payload = {};

      if (type === "mentor") {
        endpoint = `/admin/mentors/${requestId}/${action === "approve" ? "verify" : "reject"}`;
        payload = action === "reject" ? { reason } : {};
      } else if (type === "society") {
        endpoint = `/admin/societies/${requestId}/status`;
        payload = { status: action === "approve" ? "approved" : "rejected", reason };
      } else if (type === "event") {
        if (action === "approve") await approveEvent(requestId);
        else await rejectEvent(requestId, { reason });
        showToast(
          action === "approve"
            ? "Event approved. Society members notified."
            : "Event rejected. Society head notified."
        );
        fetchRequests();
        return;
      } else if (type === "study_group") {
        if (action === "approve") {
          endpoint = `/admin/study-groups/${requestId}/status`;
          payload = { status: "active" };
        } else {
          method = "DELETE";
          endpoint = `/admin/study-groups/${requestId}`;
        }
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

  const counts = requests.reduce((acc, r) => {
    acc[r.requestType] = (acc[r.requestType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: titleColor, margin: 0 }}>Pending Requests</h1>
        <p style={{ color: mutedColor, marginTop: 4, fontSize: 14 }}>
          Review and take action on all pending approval requests across the platform.
        </p>
      </div>

      {toast && (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 18px",
            background: toast.type === "error" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
            border: `1px solid ${
              toast.type === "error" ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)"
            }`,
            borderRadius: 12,
            color: toast.type === "error" ? "#dc2626" : isDark ? "#34d399" : "#047857",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {Object.entries(counts).map(([type, count]) => {
          const cfg = TYPE_CFG[type] || {
            label: type,
            icon: "•",
            bg: softSurface,
            color: mutedColor,
            border: softBorder,
          };
          return (
            <div
              key={type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: isDark ? cfg.bg : "#ffffff",
                border: `1px solid ${isDark ? cfg.border : softBorder}`,
                borderRadius: 12,
                color: isDark ? cfg.color : titleColor,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: isDark ? "none" : "0 10px 24px rgba(15,23,42,0.06)",
              }}
              onClick={() => setFilter(type)}
            >
              <span>{cfg.icon}</span> {count} {cfg.label} request{count > 1 ? "s" : ""}
            </div>
          );
        })}
        {requests.length === 0 && !loading && (
          <div
            style={{
              color: isDark ? "#34d399" : "#047857",
              fontWeight: 600,
              fontSize: 14,
              padding: "8px 16px",
              background: isDark ? "rgba(16,185,129,0.1)" : "#ecfdf5",
              border: `1px solid ${isDark ? "rgba(16,185,129,0.25)" : "#bbf7d0"}`,
              borderRadius: 12,
            }}
          >
            All clear — no pending requests.
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          padding: 4,
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 14,
          width: "fit-content",
          flexWrap: "wrap",
          boxShadow: isDark ? "none" : "0 16px 40px rgba(15,23,42,0.06)",
        }}
      >
        {FILTERS.map((f) => {
          const cfg = TYPE_CFG[f] || {};
          const cnt = f === "all" ? requests.length : counts[f] || 0;
          return (
            <button
              key={f}
              onClick={() => setFilter(f === filter ? "all" : f)}
              className={getButtonClassName({
                variant: filter === f ? "primary" : "ghost",
                size: "sm",
                isDark,
              })}
            >
              {cfg.icon || "📋"} {f === "all" ? "All" : cfg.label || f}
              {cnt > 0 && (
                <span
                  style={{
                    background: filter === f ? (isDark ? "rgba(255,255,255,0.25)" : "#ffffff") : softSurface,
                    borderRadius: 20,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 80,
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 16,
                animation: "pulse 1.5s infinite",
                boxShadow: isDark ? "none" : "0 18px 40px rgba(15,23,42,0.06)",
              }}
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            boxShadow: isDark ? "none" : "0 18px 40px rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <div style={{ color: titleColor, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Nothing here</div>
          <div style={{ color: mutedColor, fontSize: 14 }}>
            No pending {filter === "all" ? "requests" : filter.replace("_", " ")} at the moment.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map((row) => {
            const cfg = TYPE_CFG[row.requestType] || {
              label: row.requestType,
              icon: "•",
              bg: softSurface,
              color: mutedColor,
              border: softBorder,
            };
            const user = row.userId || row.createdBy || row.coordinatorId;
            const subject = row.name || row.title || "Untitled";
            const isEvent = row.requestType === "event";

            return (
              <div
                key={row._id}
                style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: isDark ? "none" : "0 18px 40px rgba(15,23,42,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = softBorder;
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 4px 20px -4px rgba(0,0,0,0.3)"
                    : "0 18px 40px rgba(15,23,42,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.boxShadow = isDark ? "none" : "0 18px 40px rgba(15,23,42,0.06)";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {cfg.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 6,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {cfg.label.toUpperCase()}
                    </span>
                    <span style={{ color: titleColor, fontWeight: 700, fontSize: 15 }}>{subject}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    {user && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: softSurface,
                            border: `1px solid ${softBorder}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isDark ? "#2563eb" : "#2563eb",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {user?.profile?.displayName?.[0] || "?"}
                        </div>
                        <span style={{ color: subtleText, fontSize: 12, fontWeight: 600 }}>
                          {user?.profile?.displayName}
                        </span>
                        {user?.email && <span style={{ color: mutedColor, fontSize: 11 }}>· {user.email}</span>}
                      </div>
                    )}
                    {row.societyId?.name && <span style={{ color: mutedColor, fontSize: 12 }}>🏛️ {row.societyId.name}</span>}
                    <span style={{ color: mutedColor, fontSize: 11 }}>
                      {new Date(row.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                  {isEvent && (
                    <button
                      onClick={() => setDetailEvent(row)}
                      className={getButtonClassName({
                        variant: "outline",
                        size: "sm",
                        isDark,
                      })}
                    >
                      View Details
                    </button>
                  )}
                  <button
                    onClick={async (e) => {
                      e.currentTarget.disabled = true;
                      await handleAction(row._id, row.requestType, "approve");
                    }}
                    className={getButtonClassName({
                      variant: "success",
                      size: "sm",
                      isDark,
                    })}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(row);
                      setShowRejectModal(true);
                    }}
                    className={getButtonClassName({
                      variant: "danger",
                      size: "sm",
                      isDark,
                    })}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onAction={(action) => {
            showToast(action === "approved" ? "Event approved. Society members notified." : "Event rejected.");
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
