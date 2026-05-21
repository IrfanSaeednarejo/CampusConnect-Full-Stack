export default function ToggleRow({
  label,
  description,
  checked,
  onChange,
  className = "",
  isDark = true,
}) {
  return (
    <label className={`flex items-center justify-between cursor-pointer py-3 ${className}`}>
      <div>
        <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{label}</p>
        {description && (
          <p className={`text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{description}</p>
        )}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 rounded-full peer transition-colors ${
            isDark
              ? "bg-[#30363d] peer-checked:bg-[#238636] peer-focus:ring-[#238636]"
              : "bg-slate-200 peer-checked:bg-slate-900 peer-focus:ring-slate-400"
          } peer-focus:ring-2`}
        ></div>
        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
      </div>
    </label>
  );
}
