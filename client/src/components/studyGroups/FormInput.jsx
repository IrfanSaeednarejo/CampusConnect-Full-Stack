export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  rows,
  min,
  max,
  ...props
}) {
  if (type === "textarea") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-semibold text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows || 3}
          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-primary placeholder-[#475569] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          {...props}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-primary placeholder-[#475569] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        {...props}
      />
    </div>
  );
}
