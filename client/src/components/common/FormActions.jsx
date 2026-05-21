import Button from "./Button";

export default function FormActions({
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Submit",
  loadingText = "Loading...",
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
  return (
    <div className={`flex gap-3 ${className}`}>
      {onCancel && (
        <Button
          type="button"
          onClick={onCancel}
          variant={cancelVariant}
          size="md"
          className={`flex-1 ${cancelClassName}`.trim()}
          disabled={loading}
          leftIcon={
            cancelIcon ? (
              <span className="material-symbols-outlined">{cancelIcon}</span>
            ) : undefined
          }
        >
          {cancelText}
        </Button>
      )}
      {onSubmit && (
        <Button
          type="submit"
          onClick={onSubmit}
          variant={submitVariant}
          size="md"
          className={`flex-1 ${submitClassName}`.trim()}
          isLoading={loading}
          disabled={disabled}
          leftIcon={
            !loading && submitIcon ? (
              <span className="material-symbols-outlined">{submitIcon}</span>
            ) : undefined
          }
        >
          {loading ? loadingText : submitText}
        </Button>
      )}
    </div>
  );
}
