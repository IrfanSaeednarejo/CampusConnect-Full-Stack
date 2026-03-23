export default function InfoBox({
  icon = "info",
  title,
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-[#238636]/10 border border-[#238636]/30 rounded-lg p-4 flex gap-3 ${className}`}
    >
      <span className="material-symbols-outlined text-[#238636] text-xl">
        {icon}
      </span>
      <div className="text-sm text-[#8b949e]">
        {title && <p className="font-medium text-[#c9d1d9] mb-1">{title}</p>}
        {children}
      </div>
    </div>
  );
}
