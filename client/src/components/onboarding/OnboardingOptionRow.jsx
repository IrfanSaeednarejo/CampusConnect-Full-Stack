export default function OnboardingOptionRow({
  icon,
  label,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-4">
        <div className="bg-surface-hover text-text-secondary flex items-center justify-center rounded-lg h-10 w-10">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-[#e6edf3] font-medium flex-1">{label}</p>
      </div>
      <input
        type="checkbox"
        className="h-5 w-5 cursor-pointer"
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}
