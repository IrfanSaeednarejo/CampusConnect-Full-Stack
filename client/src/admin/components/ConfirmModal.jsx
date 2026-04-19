import { useState } from "react";

export const ConfirmModal = ({ title, description, confirmWord = "DELETE", danger = true, onClose }) => {
    const [input, setInput] = useState("");

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, width: 400, border: "1px solid #334155" }}>
                <h3 style={{ color: danger ? "#ef4444" : "#f8fafc", fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                {description && <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>{description}</p>}
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
                    Type <strong style={{ color: "#f8fafc" }}>{confirmWord}</strong> to confirm:
                </p>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={confirmWord}
                    style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 6, color: "#f8fafc", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => onClose({ confirmed: false })} style={{ padding: "8px 16px", background: "#334155", border: "none", borderRadius: 6, color: "#f8fafc", cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button
                        disabled={input !== confirmWord}
                        onClick={() => onClose({ confirmed: true })}
                        style={{ padding: "8px 16px", background: input === confirmWord ? (danger ? "#dc2626" : "#22c55e") : "#374151", border: "none", borderRadius: 6, color: "#fff", cursor: input === confirmWord ? "pointer" : "not-allowed" }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmModal;
