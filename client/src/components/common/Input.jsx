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
    "w-full px-3 py-2 rounded bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#238636]";

  return (
    <div className={className}>
      {label && (
        <label className="block text-[#8b949e] text-sm font-semibold mb-2">
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
