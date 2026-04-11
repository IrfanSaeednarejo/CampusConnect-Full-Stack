export default function ToggleRow({
  label,
  description,
  checked,
  onChange,
  className = "",
}) {
  return (
    <label className={`flex items-center justify-between cursor-pointer py-3 ${className}`}>
      <div>
        <p className="font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[#C7D2FE] rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary transition-colors"></div>
        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
      </div>
    </label>
  );
}
