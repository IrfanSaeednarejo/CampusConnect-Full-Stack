import { useState } from "react";

export const ReasonModal = ({ title, prompt, onClose }) => {
    const [reason, setReason] = useState("");

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, width: 400, border: "1px solid #334155" }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{title}</h3>
                {prompt && <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>{prompt}</p>}
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Enter reason..."
                    style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", resize: "vertical", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => onClose({ confirmed: false, reason: "" })} style={{ padding: "8px 16px", background: "#334155", border: "none", borderRadius: 6, color: "#f8fafc", cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button onClick={() => onClose({ confirmed: true, reason: reason.trim() })} style={{ padding: "8px 16px", background: "#dc2626", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ReasonModal;
