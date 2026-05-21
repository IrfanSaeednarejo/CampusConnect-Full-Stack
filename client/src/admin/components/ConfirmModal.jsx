import { useState } from "react";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export const ConfirmModal = ({
  title,
  description,
  confirmWord = "DELETE",
  danger = true,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const isDark = useHomeTheme();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: isDark ? "#1e293b" : "#ffffff",
          borderRadius: 12,
          padding: 32,
          width: 400,
          border: isDark ? "1px solid #334155" : "1px solid #dbe4ee",
          boxShadow: isDark
            ? "0 20px 45px rgba(0,0,0,0.32)"
            : "0 20px 45px rgba(15,23,42,0.12)",
        }}
      >
        <h3
          style={{
            color: danger ? "#ef4444" : isDark ? "#f8fafc" : "#0f172a",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              color: isDark ? "#94a3b8" : "#64748b",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            {description}
          </p>
        )}
        <p
          style={{
            color: isDark ? "#64748b" : "#64748b",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Type{" "}
          <strong style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>
            {confirmWord}
          </strong>{" "}
          to confirm:
        </p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={confirmWord}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: isDark ? "#0f172a" : "#f8fafc",
            border: isDark ? "1px solid #334155" : "1px solid #dbe4ee",
            borderRadius: 10,
            color: isDark ? "#f8fafc" : "#0f172a",
            marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={() => onClose({ confirmed: false })}
            type="button"
            className={getButtonClassName({
              variant: "secondary",
              size: "sm",
              isDark,
            })}
          >
            Cancel
          </button>
          <button
            disabled={input !== confirmWord}
            onClick={() => onClose({ confirmed: true })}
            type="button"
            className={getButtonClassName({
              variant: danger ? "danger" : "success",
              size: "sm",
              isDark,
            })}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
