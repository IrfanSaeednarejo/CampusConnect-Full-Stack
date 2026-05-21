import { useState } from "react";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export const ReasonModal = ({
  title,
  prompt,
  onClose,
  confirmLabel = "Confirm",
  dangerous = true,
}) => {
  const [reason, setReason] = useState("");
  const canConfirm = reason.trim().length > 0;
  const isDark = useHomeTheme();

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[rgba(15,23,42,0.65)] p-6 backdrop-blur-sm">
      <div
        className={`w-full max-w-[440px] rounded-[28px] border p-6 sm:p-8 ${
          isDark ? "border-[#30363d] bg-[#161b22]" : "border-[#dbe4ee] bg-white"
        }`}
        style={{
          boxShadow: isDark
            ? "0 30px 80px rgba(0,0,0,0.4)"
            : "0 30px 80px rgba(15,23,42,0.16)",
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3
              className={
                isDark
                  ? "text-lg font-semibold text-[#e6edf3]"
                  : "text-lg font-semibold text-[#0f172a]"
              }
            >
              {title}
            </h3>
            {prompt && (
              <p
                className={`mt-2 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                  isDark
                    ? "border-[#30363d] bg-[#0d1117] text-[#8b949e]"
                    : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
                }`}
              >
                {prompt}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onClose({ confirmed: false, reason: "" })}
            className={getButtonClassName({
              variant: "ghost",
              size: "icon-sm",
              isDark,
              className: "rounded-xl border shadow-none",
              iconOnly: true,
            })}
          >
            x
          </button>
        </div>

        <div className="mb-5">
          <label
            className={`mb-2 block text-xs font-semibold uppercase tracking-[0.16em] ${
              isDark ? "text-[#8b949e]" : "text-[#64748b]"
            }`}
          >
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Be specific and constructive..."
            className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition-colors ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder:text-[#8b949e] focus:border-[#475569]"
                : "border-[#dbe4ee] bg-[#f8fafc] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#cbd5e1]"
            }`}
          />
          <div
            className={
              isDark
                ? "mt-2 text-right text-xs text-[#6e7681]"
                : "mt-2 text-right text-xs text-[#94a3b8]"
            }
          >
            {reason.length} chars
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onClose({ confirmed: false, reason: "" })}
            className={getButtonClassName({
              variant: "secondary",
              size: "md",
              isDark,
              className: "flex-1 rounded-2xl px-4 py-3 text-sm font-medium",
            })}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onClose({ confirmed: true, reason: reason.trim() })}
            className={getButtonClassName({
              variant: dangerous ? "danger" : "primary",
              size: "md",
              isDark,
              className: "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold",
            })}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
