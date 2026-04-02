import { ArrowLeft } from "lucide-react";

export default function AgentHeader({
  title,
  subtitle,
  onBack,
  badge,
  badgeClassName = "w-10 h-10 rounded-full flex items-center justify-center",
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-border ${className}`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-surface rounded-lg transition"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {badge && <div className={badgeClassName}>{badge}</div>}
    </div>
  );
}
