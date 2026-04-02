export default function StatCard({ label, value, icon, className = "" }) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-primary text-2xl font-bold">{value}</p>
        </div>
        <span className="material-symbols-outlined text-4xl text-primary">
          {icon}
        </span>
      </div>
    </div>
  );
}
