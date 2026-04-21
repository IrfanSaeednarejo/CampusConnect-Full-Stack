import { useState } from "react";
import { approveEvent, rejectEvent } from "../../api/adminApi";

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const Row = ({ label, value }) => value ? (
  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
    <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600, minWidth: 140, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
    <span style={{ color: "#e2e8f0", fontSize: 13 }}>{value}</span>
  </div>
) : null;

export default function EventDetailModal({ event, onClose, onAction }) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState("");

  if (!event) return null;

  const creator = event.createdBy;
  const society = event.societyId;

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approveEvent(event._id);
      onAction?.("approved");
      onClose();
    } catch (e) {
      const msg = e.response?.data?.message || "";
      if (msg.includes("already")) {
        onAction?.("approved"); // It's already approved, so act as if it succeeded
        onClose();
      } else {
        alert(msg || "Failed to approve");
      }
    }
    setLoading("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading("reject");
    try {
      await rejectEvent(event._id, { reason: rejectReason.trim() });
      onAction?.("rejected");
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to reject");
    }
    setLoading("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,20,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 40px 80px -12px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(245,158,11,0.3)", letterSpacing: "0.1em" }}>PENDING REVIEW</span>
              {event.isOnlineCompetition && <span style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.3)" }}>🏆 COMPETITION</span>}
            </div>
            <h2 style={{ color: "#f8fafc", fontWeight: 800, fontSize: 18, margin: "8px 0 0" }}>{event.title}</h2>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", border: "1px solid #334155", borderRadius: 10, color: "#64748b", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>✕</button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 28px 24px" }}>

          {/* Cover Image */}
          {event.coverImage && (
            <div style={{ margin: "20px 0", borderRadius: 14, overflow: "hidden", height: 200 }}>
              <img src={event.coverImage} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {/* Creator Card */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "#1e293b", borderRadius: 14, margin: "20px 0", border: "1px solid #334155" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 800, fontSize: 16, border: "1px solid #334155" }}>
              {creator?.profile?.avatar
                ? <img src={creator.profile.avatar} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                : (creator?.profile?.displayName?.[0] || "?")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{creator?.profile?.displayName}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>{creator?.email}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Society</div>
              <div style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600 }}>{society?.name}</div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Description</div>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, background: "#1e293b", padding: "14px 16px", borderRadius: 12, border: "1px solid #334155" }}>{event.description}</p>
            </div>
          )}

          {/* Key Details */}
          <div style={{ background: "#1e293b", borderRadius: 14, padding: "4px 16px", border: "1px solid #334155", marginBottom: 20 }}>
            <Row label="Start Date" value={fmt(event.startAt)} />
            <Row label="End Date" value={fmt(event.endAt)} />
            <Row label="Reg. Deadline" value={fmt(event.registrationDeadline)} />
            {event.submissionDeadline && <Row label="Sub. Deadline" value={fmt(event.submissionDeadline)} />}
            <Row label="Category" value={event.category} />
            <Row label="Event Type" value={event.eventType?.replace(/_/g, " ")} />
            <Row label="Participation" value={event.participationType} />
            <Row label="Venue Type" value={event.venue?.type} />
            {event.venue?.address && <Row label="Address" value={event.venue.address} />}
            {event.venue?.onlineUrl && <Row label="Online URL" value={event.venue.onlineUrl} />}
            {event.maxCapacity > 0 && <Row label="Max Capacity" value={event.maxCapacity} />}
            {event.fee?.amount > 0 && <Row label="Fee" value={`${event.fee.amount} ${event.fee.currency}`} />}
            <Row label="Waitlist" value={event.waitlistEnabled ? "Enabled" : "Disabled"} />
          </div>

          {/* Competition Details */}
          {event.isOnlineCompetition && event.teamConfig && (
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 14, padding: "4px 16px", marginBottom: 20 }}>
              <div style={{ color: "#818cf8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "12px 0 4px" }}>Competition Config</div>
              <Row label="Min Team Size" value={event.teamConfig.minSize} />
              <Row label="Max Team Size" value={event.teamConfig.maxSize} />
              {event.teamConfig.maxTeams > 0 && <Row label="Max Teams" value={event.teamConfig.maxTeams} />}
            </div>
          )}

          {/* Prize Pool */}
          {event.prizePool?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🎁 Prize Pool</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {event.prizePool.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#1e293b", borderRadius: 10, border: "1px solid #334155" }}>
                    <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13 }}>#{p.rank}</span>
                    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{p.prize}</span>
                    {p.description && <span style={{ color: "#64748b", fontSize: 12 }}>{p.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {event.tags.map(t => (
                  <span key={t} style={{ padding: "4px 10px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, color: "#818cf8", fontSize: 12, fontWeight: 600 }}>#{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reject Input */}
          {showRejectInput && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#f87171", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>❌ Rejection Reason (required)</div>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Provide a clear reason. The society head will see this message..."
                style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, color: "#f8fafc", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #1e293b", display: "flex", gap: 12, flexShrink: 0 }}>
          {!showRejectInput ? (
            <>
              <button onClick={handleApprove} disabled={loading === "approve"} style={{ flex: 1, padding: "12px", background: loading === "approve" ? "#064e3b" : "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                {loading === "approve" ? "Approving…" : "✅ Approve Event"}
              </button>
              <button onClick={() => setShowRejectInput(true)} style={{ flex: 1, padding: "12px", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                ❌ Reject Event
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }} style={{ padding: "12px 24px", background: "transparent", color: "#64748b", border: "1px solid #334155", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim() || loading === "reject"} style={{ flex: 1, padding: "12px", background: rejectReason.trim() ? "#7f1d1d" : "transparent", color: rejectReason.trim() ? "#fca5a5" : "#64748b", border: `1px solid ${rejectReason.trim() ? "rgba(239,68,68,0.5)" : "#334155"}`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: rejectReason.trim() ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                {loading === "reject" ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
