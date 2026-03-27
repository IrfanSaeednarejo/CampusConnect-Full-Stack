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
        <p className="font-medium text-white">{label}</p>
        {description && (
          <p className="text-sm text-[#8b949e]">{description}</p>
        )}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[#30363d] rounded-full peer peer-checked:bg-[#238636] peer-focus:ring-2 peer-focus:ring-[#238636] transition-colors"></div>
        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
      </div>
    </label>
  );
}
