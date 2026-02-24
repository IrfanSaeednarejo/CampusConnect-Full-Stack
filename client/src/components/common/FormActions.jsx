/**
 * FormActions Component
 * Reusable form action buttons (Cancel + Submit)
 * Consolidates repeated button group patterns across 25+ pages
 */
export default function FormActions({
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Submit",
  loading = false,
  disabled = false,
  submitVariant = "primary",
  cancelVariant = "secondary",
  className = "",
  submitClassName = "",
  cancelClassName = "",
  submitIcon,
  cancelIcon,
}) {
  const variantClasses = {
    primary:
      "px-6 py-3 rounded-lg bg-[#238636] text-white font-semibold hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "px-6 py-3 rounded-lg bg-[#21262d] text-[#c9d1d9] font-semibold border border-[#30363d] hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 ${variantClasses[cancelVariant]} ${cancelClassName}`}
          disabled={loading}
        >
          {cancelIcon && (
            <span className="material-symbols-outlined mr-2">{cancelIcon}</span>
          )}
          {cancelText}
        </button>
      )}
      {onSubmit && (
        <button
          type={onSubmit ? "button" : "submit"}
          onClick={onSubmit}
          className={`flex-1 ${variantClasses[submitVariant]} ${submitClassName} flex items-center justify-center gap-2`}
          disabled={disabled || loading}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Loading...
            </>
          ) : (
            <>
              {submitIcon && (
                <span className="material-symbols-outlined">{submitIcon}</span>
              )}
              {submitText}
            </>
          )}
        </button>
      )}
    </div>
  );
}
