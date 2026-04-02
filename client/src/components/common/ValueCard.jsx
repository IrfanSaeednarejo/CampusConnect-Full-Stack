export default function ValueCard({ title, description, className = "" }) {
  return (
    <div
      className={`p-4 rounded-lg border border-border bg-surface ${className}`}
    >
      <h3 className="text-primary font-bold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm">{description}</p>
    </div>
  );
}
