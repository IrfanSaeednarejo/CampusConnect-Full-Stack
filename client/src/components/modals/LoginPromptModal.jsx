import { useNavigate } from "react-router-dom";

/**
 * LoginPromptModal — Reusable modal shown when unauthenticated users
 * try to perform protected actions (Register, Join Society, etc.)
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Close handler
 * @param {string} message - Custom message (default provided)
 */
export default function LoginPromptModal({
  isOpen,
  onClose,
  message = "You need to be logged in to perform this action.",
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative z-10 w-full max-w-md mx-4 bg-surface border border-border rounded-xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">
              lock
            </span>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-text-primary text-xl font-bold text-center mb-2">
          Login Required
        </h3>
        <p className="text-text-secondary text-sm text-center mb-8">{message}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full h-11 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-full h-11 rounded-lg border border-border bg-transparent text-text-primary font-bold text-sm hover:bg-surface-hover transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
