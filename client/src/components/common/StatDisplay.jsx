export default function StatDisplay({ stat, label, className = "" }) {
  return (
    <div
      className={`p-6 rounded-lg border border-border bg-surface text-center ${className}`}
    >
      <p className="text-3xl font-bold text-primary mb-2">{stat}</p>
      <p className="text-text-secondary text-sm">{label}</p>
    </div>
  );
}
