import { useState } from "react";
import { approveEvent, rejectEvent } from "../../api/adminApi";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const Row = ({ label, value, isDark, isLast = false }) =>
  value ? (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: isLast ? "none" : `1px solid ${isDark ? "#30363d" : "#dbe4ee"}`,
      }}
    >
      <span
        style={{
          color: isDark ? "#8b949e" : "#64748b",
          fontSize: 12,
          fontWeight: 600,
          minWidth: 140,
          flexShrink: 0,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span style={{ color: isDark ? "#e6edf3" : "#0f172a", fontSize: 13 }}>{value}</span>
    </div>
  ) : null;

export default function EventDetailModal({ event, onClose, onAction, onError }) {
  const isDark = useHomeTheme();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState("");

  if (!event) return null;

  const creator = event.createdBy;
  const society = event.societyId;

  const palette = {
    overlay: isDark ? "rgba(2,6,23,0.78)" : "rgba(15,23,42,0.28)",
    panel: isDark ? "#161b22" : "#ffffff",
    border: isDark ? "#30363d" : "#dbe4ee",
    mutedBorder: isDark ? "#30363d" : "#e2e8f0",
    softSurface: isDark ? "#0d1117" : "#f8fafc",
    accentSurface: isDark ? "rgba(99,102,241,0.12)" : "rgba(37,99,235,0.08)",
    text: isDark ? "#e6edf3" : "#0f172a",
    subtle: isDark ? "#8b949e" : "#64748b",
    description: isDark ? "#9fb0c3" : "#475569",
    titleShadow: isDark ? "0 40px 80px -12px rgba(0,0,0,0.8)" : "0 40px 80px -12px rgba(15,23,42,0.2)",
  };

  const reportError = (fallbackMessage, error) => {
    const message = error?.response?.data?.message || fallbackMessage;
    onError?.(message);
  };

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approveEvent(event._id);
      onAction?.("approved");
      onClose();
    } catch (error) {
      const message = error?.response?.data?.message || "";
      if (message.includes("already")) {
        onAction?.("approved");
        onClose();
      } else {
        reportError("Failed to approve", error);
      }
    } finally {
      setLoading("");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading("reject");
    try {
      await rejectEvent(event._id, { reason: rejectReason.trim() });
      onAction?.("rejected");
      onClose();
    } catch (error) {
      reportError("Failed to reject", error);
    } finally {
      setLoading("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: palette.overlay,
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 24,
      }}
    >
      <div
        style={{
          background: palette.panel,
          border: `1px solid ${palette.border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: palette.titleShadow,
        }}
      >
        <div
          style={{
            padding: "20px 28px",
            borderBottom: `1px solid ${palette.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  background: "rgba(245,158,11,0.15)",
                  color: "#f59e0b",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(245,158,11,0.3)",
                  letterSpacing: "0.1em",
                }}
              >
                PENDING REVIEW
              </span>
              {event.isOnlineCompetition && (
                <span
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    color: "#6366f1",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  COMPETITION
                </span>
              )}
            </div>
            <h2 style={{ color: palette.text, fontWeight: 800, fontSize: 18, margin: "8px 0 0" }}>{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className={getButtonClassName({
              variant: "ghost",
              size: "icon-sm",
              isDark,
              iconOnly: true,
            })}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0 28px 24px" }}>
          {event.coverImage && (
            <div style={{ margin: "20px 0", borderRadius: 14, overflow: "hidden", height: 200 }}>
              <img
                src={event.coverImage}
                alt={event.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              background: palette.softSurface,
              borderRadius: 14,
              margin: "20px 0",
              border: `1px solid ${palette.mutedBorder}`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: palette.accentSurface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                fontWeight: 800,
                fontSize: 16,
                border: `1px solid ${palette.mutedBorder}`,
              }}
            >
              {creator?.profile?.avatar ? (
                <img
                  src={creator.profile.avatar}
                  alt=""
                  style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }}
                />
              ) : (
                creator?.profile?.displayName?.[0] || "?"
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: palette.text, fontWeight: 700, fontSize: 14 }}>{creator?.profile?.displayName}</div>
              <div style={{ color: palette.subtle, fontSize: 12 }}>{creator?.email}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: palette.subtle, fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>
                Society
              </div>
              <div style={{ color: "#7c3aed", fontSize: 13, fontWeight: 600 }}>{society?.name}</div>
            </div>
          </div>

          {event.description && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: palette.subtle,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                Description
              </div>
              <p
                style={{
                  color: palette.description,
                  fontSize: 14,
                  lineHeight: 1.7,
                  background: palette.softSurface,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1px solid ${palette.mutedBorder}`,
                }}
              >
                {event.description}
              </p>
            </div>
          )}

          <div
            style={{
              background: palette.softSurface,
              borderRadius: 14,
              padding: "4px 16px",
              border: `1px solid ${palette.mutedBorder}`,
              marginBottom: 20,
            }}
          >
            <Row label="Start Date" value={fmt(event.startAt)} isDark={isDark} />
            <Row label="End Date" value={fmt(event.endAt)} isDark={isDark} />
            <Row label="Reg. Deadline" value={fmt(event.registrationDeadline)} isDark={isDark} />
            {event.submissionDeadline && <Row label="Sub. Deadline" value={fmt(event.submissionDeadline)} isDark={isDark} />}
            <Row label="Category" value={event.category} isDark={isDark} />
            <Row label="Event Type" value={event.eventType?.replace(/_/g, " ")} isDark={isDark} />
            <Row label="Participation" value={event.participationType} isDark={isDark} />
            <Row label="Venue Type" value={event.venue?.type} isDark={isDark} />
            {event.venue?.address && <Row label="Address" value={event.venue.address} isDark={isDark} />}
            {event.venue?.onlineUrl && <Row label="Online URL" value={event.venue.onlineUrl} isDark={isDark} />}
            {event.maxCapacity > 0 && <Row label="Max Capacity" value={event.maxCapacity} isDark={isDark} />}
            {event.fee?.amount > 0 && <Row label="Fee" value={`${event.fee.amount} ${event.fee.currency}`} isDark={isDark} />}
            <Row label="Waitlist" value={event.waitlistEnabled ? "Enabled" : "Disabled"} isDark={isDark} isLast />
          </div>

          {event.isOnlineCompetition && event.teamConfig && (
            <div
              style={{
                background: palette.accentSurface,
                border: `1px solid ${isDark ? "rgba(99,102,241,0.25)" : "rgba(37,99,235,0.18)"}`,
                borderRadius: 14,
                padding: "4px 16px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  color: isDark ? "#818cf8" : "#2563eb",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "12px 0 4px",
                }}
              >
                Competition Config
              </div>
              <Row label="Min Team Size" value={event.teamConfig.minSize} isDark={isDark} />
              <Row label="Max Team Size" value={event.teamConfig.maxSize} isDark={isDark} />
              {event.teamConfig.maxTeams > 0 && <Row label="Max Teams" value={event.teamConfig.maxTeams} isDark={isDark} isLast />}
            </div>
          )}

          {event.prizePool?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: palette.subtle,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                Prize Pool
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {event.prizePool.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 16px",
                      background: palette.softSurface,
                      borderRadius: 10,
                      border: `1px solid ${palette.mutedBorder}`,
                    }}
                  >
                    <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>#{p.rank}</span>
                    <span style={{ color: palette.text, fontWeight: 600, fontSize: 13 }}>{p.prize}</span>
                    {p.description && <span style={{ color: palette.subtle, fontSize: 12 }}>{p.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.tags?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: palette.subtle,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {event.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 10px",
                      background: palette.accentSurface,
                      border: `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "rgba(37,99,235,0.25)"}`,
                      borderRadius: 20,
                      color: isDark ? "#818cf8" : "#2563eb",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {showRejectInput && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                Rejection Reason (required)
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Provide a clear reason. The society head will see this message..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: palette.softSurface,
                  border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: 12,
                  color: palette.text,
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            padding: "16px 28px",
            borderTop: `1px solid ${palette.border}`,
            display: "flex",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {!showRejectInput ? (
            <>
              <button
                onClick={handleApprove}
                disabled={loading === "approve"}
                type="button"
                className={getButtonClassName({
                  variant: "success",
                  size: "lg",
                  isDark,
                  className: "flex-1",
                })}
              >
                {loading === "approve" ? "Approving..." : "Approve Event"}
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                type="button"
                className={getButtonClassName({
                  variant: "danger",
                  size: "lg",
                  isDark,
                  className: "flex-1",
                })}
              >
                Reject Event
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
                type="button"
                className={getButtonClassName({
                  variant: "secondary",
                  size: "lg",
                  isDark,
                })}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || loading === "reject"}
                type="button"
                className={getButtonClassName({
                  variant: "danger",
                  size: "lg",
                  isDark,
                  className: "flex-1",
                })}
              >
                {loading === "reject" ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
