import React, { useEffect } from "react";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "./Button";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary",
  loading = false,
}) => {
  const isDark = useHomeTheme();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "border border-danger/20 bg-danger/10 text-danger",
          border: "border-red-500/20",
          variant: "danger",
        };
      case "warning":
        return {
          icon: "border border-warning/20 bg-warning/10 text-warning",
          border: "border-amber-500/20",
          variant: "warning",
        };
      default:
        return {
          icon: "border border-info/20 bg-info/10 text-info",
          border: "border-info/20",
          variant: "primary",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-200 ${styles.border} ${
          isDark ? "bg-surface-dark" : "border-border-light bg-surface-light"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${styles.icon}`}>
            <span className="material-symbols-outlined text-3xl">
              {variant === "danger" ? "report" : variant === "warning" ? "warning" : "verified"}
            </span>
          </div>

          <h2 className={`mb-3 text-2xl font-bold tracking-tight ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{title}</h2>
          <p className={`mb-8 text-sm leading-relaxed ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{message}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={getButtonClassName({
                variant: styles.variant,
                size: "lg",
                isDark,
                className: "w-full",
              })}
            >
              {loading ? "Processing..." : confirmText}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className={getButtonClassName({
                variant: "ghost",
                size: "lg",
                isDark,
                className: "w-full",
              })}
            >
              {cancelText}
            </button>
          </div>
        </div>

        <div className={`border-t p-4 text-center ${isDark ? "border-border-dark bg-[rgb(var(--color-surface-muted-dark)/1)]" : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Confirmation Required
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
