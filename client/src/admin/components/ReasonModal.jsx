import { useState } from "react";

export const ReasonModal = ({ title, prompt, onClose, confirmLabel = "Confirm", dangerous = true }) => {
  const [reason, setReason] = useState("");
  const canConfirm = reason.trim().length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,20,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 24 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 40px 80px -12px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: "#f8fafc", margin: 0, lineHeight: 1.4 }}>{title}</h3>
          <button onClick={() => onClose({ confirmed: false, reason: "" })} style={{ width: 30, height: 30, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#64748b", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        {prompt && <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginBottom: 18, padding: "12px 14px", background: "#1e293b", borderRadius: 10 }}>{prompt}</p>}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Reason <span style={{ color: "#f87171" }}>*</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Be specific and constructive…"
            style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${canConfirm ? "#334155" : "#1e293b"}`, borderRadius: 12, color: "#f8fafc", resize: "none", outline: "none", fontSize: 13, lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = dangerous ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.5)"}
            onBlur={e => e.target.style.borderColor = "#334155"}
          />
          <div style={{ textAlign: "right", color: "#475569", fontSize: 11, marginTop: 4 }}>{reason.length} chars</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onClose({ confirmed: false, reason: "" })} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #334155", borderRadius: 12, color: "#64748b", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s" }}>
            Cancel
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => onClose({ confirmed: true, reason: reason.trim() })}
            style={{
              flex: 1, padding: "12px",
              background: canConfirm ? (dangerous ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg,#6366f1,#8b5cf6)") : "transparent",
              border: `1px solid ${canConfirm ? (dangerous ? "rgba(239,68,68,0.4)" : "transparent") : "#1e293b"}`,
              borderRadius: 12, color: canConfirm ? (dangerous ? "#fca5a5" : "#fff") : "#334155",
              cursor: canConfirm ? "pointer" : "not-allowed",
              fontWeight: 700, fontSize: 14, transition: "all 0.2s"
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
