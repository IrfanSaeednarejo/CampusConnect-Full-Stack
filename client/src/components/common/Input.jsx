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
  const isTextarea = type === "textarea" || rows;

  const inputClasses =
    "w-full px-3 py-2 rounded bg-background border border-border text-text-primary text-sm placeholder-[#475569] focus:outline-none focus:border-primary";

  return (
    <div className={className}>
      {label && (
        <label className="block text-text-secondary text-sm font-semibold mb-2">
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
