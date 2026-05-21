import useHomeTheme from "../../hooks/useHomeTheme";

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
  isDark,
  ...rest
}) {
  const themeIsDark = useHomeTheme();
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : themeIsDark;

  const baseInputClasses = `w-full rounded-xl border px-4 py-3 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
    resolvedIsDark
      ? "border-border-dark bg-surface-dark text-text-primary-dark placeholder:text-text-secondary-dark focus:ring-info"
      : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light shadow-sm focus:ring-info"
  } focus:outline-none focus:ring-2 focus:border-transparent`;

  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";
  const labelClasses = resolvedIsDark ? "text-text-primary-dark" : "text-text-primary-light";
  const helpTextClasses = resolvedIsDark ? "text-text-secondary-dark" : "text-text-secondary-light";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium transition-colors duration-300 ${labelClasses}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
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
        <p className={`text-xs transition-colors duration-300 ${helpTextClasses}`}>
          {helpText}
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
