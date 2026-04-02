export default function InfoBox({
  icon = "info",
  title,
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-primary/10 border border-primary/30 rounded-lg p-4 flex gap-3 ${className}`}
    >
      <span className="material-symbols-outlined text-primary text-xl">
        {icon}
      </span>
      <div className="text-sm text-text-secondary">
        {title && <p className="font-medium text-text-primary mb-1">{title}</p>}
        {children}
      </div>
    </div>
  );
}
