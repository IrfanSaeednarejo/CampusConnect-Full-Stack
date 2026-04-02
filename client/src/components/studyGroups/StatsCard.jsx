export default function StatsCard({ value, label }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );
}
