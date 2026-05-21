import useHomeTheme from "../../hooks/useHomeTheme";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows,
  className = "",
}) {
  const isDark = useHomeTheme();
  const isTextarea = type === "textarea" || rows;

  const labelClasses = isDark
    ? "text-text-secondary-dark"
    : "text-slate-600";
  const inputClasses = isDark
    ? "w-full rounded-xl border border-border-dark bg-surface-dark px-3 py-2.5 text-sm text-text-primary-dark placeholder:text-text-secondary-dark transition-colors focus:border-info focus:outline-none focus:ring-2 focus:ring-info/15"
    : "w-full rounded-xl border border-border-light bg-surface-light px-3 py-2.5 text-sm text-text-primary-light placeholder:text-text-secondary-light transition-colors focus:border-info focus:outline-none focus:ring-2 focus:ring-info/15";

  return (
    <div className={className}>
      {label && (
        <label className={`mb-2 block text-sm font-semibold ${labelClasses}`}>
          {label}
        </label>
      )}
      {isTextarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows || 5}
          className={inputClasses}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={inputClasses}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
