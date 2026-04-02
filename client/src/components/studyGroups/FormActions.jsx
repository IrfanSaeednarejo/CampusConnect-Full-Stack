export default function FormActions({
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading = false,
}) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-6 py-3 rounded-lg bg-surface-hover text-text-primary font-semibold border border-border hover:bg-[#30363d] transition-colors"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitLabel === "Save Changes" ? (
          <>
            <span className="material-symbols-outlined text-xl">save</span>
            {submitLabel}
          </>
        ) : submitLabel === "Create Group" ? (
          <>
            <span className="material-symbols-outlined text-xl">add</span>
            {submitLabel}
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}
