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
        className="flex-1 px-6 py-3 rounded-lg bg-[#21262d] text-[#c9d1d9] font-semibold border border-[#30363d] hover:bg-[#30363d] transition-colors"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 px-6 py-3 rounded-lg bg-[#238636] text-white font-semibold hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
