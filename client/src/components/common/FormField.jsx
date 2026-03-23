/**
 * FormField Component
 * Reusable form input field with label, validation, and error display
 * Consolidates repeated form field patterns across 30+ pages
 */
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  rows = 4,
  min,
  max,
  step,
  className = "",
  inputClassName = "",
  ...rest
}) {
  const baseInputClasses =
    "w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#238636] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-[#c9d1d9]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${baseInputClasses} ${errorClasses} ${inputClassName} resize-none`}
          {...rest}
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={`${baseInputClasses} ${errorClasses} ${inputClassName}`}
          {...rest}
        >
          {rest.children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`${baseInputClasses} ${errorClasses} ${inputClassName}`}
          {...rest}
        />
      )}

      {helpText && !error && (
        <p className="text-xs text-[#8b949e]">{helpText}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
