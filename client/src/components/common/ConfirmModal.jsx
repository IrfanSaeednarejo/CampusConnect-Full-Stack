import React, { useEffect } from "react";
import Button from "../common/Button";

/**
 * A reusable, premium confirmation modal for CampusNexus.
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {string} title - The heading of the modal
 * @param {string} message - Descriptive text explaining the consequences
 * @param {string} confirmText - Label for the action button
 * @param {string} cancelText - Label for the abort button
 * @param {function} onConfirm - Callback when user confirms
 * @param {function} onCancel - Callback when user cancels
 * @param {string} variant - 'danger' | 'primary' | 'warning'
 */
const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm Action", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  variant = "primary",
  loading = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-500 bg-red-500/10',
          button: 'bg-red-500 hover:bg-red-600',
          border: 'border-red-500/20'
        };
      case 'warning':
        return {
          icon: 'text-amber-500 bg-amber-500/10',
          button: 'bg-amber-500 hover:bg-amber-600',
          border: 'border-amber-500/20'
        };
      default:
        return {
          icon: 'text-[#1f6feb] bg-[#1f6feb]/10',
          button: 'bg-[#1f6feb] hover:bg-[#388bfd]',
          border: 'border-[#1f6feb]/20'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`bg-[#0d1117] border ${styles.border} rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl ${styles.icon} flex items-center justify-center mx-auto mb-6 scale-110 shadow-lg`}>
            <span className="material-symbols-outlined text-3xl">
              {variant === 'danger' ? 'report' : variant === 'warning' ? 'warning' : 'verified'}
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h2>
          <p className="text-[#8b949e] text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 ${styles.button}`}
            >
              {loading ? "Processing Protocol..." : confirmText}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-[#8b949e] hover:text-white hover:bg-[#30363d]/50 transition-all active:scale-[0.98]"
            >
              {cancelText}
            </button>
          </div>
        </div>

        <div className="bg-[#161b22]/50 p-4 border-t border-[#30363d]/50 text-center">
          <p className="text-[10px] text-[#484f58] font-bold uppercase tracking-[0.2em]">
            CampusNexus Secure Operation Gate
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
