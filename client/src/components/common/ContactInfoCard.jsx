export default function ContactInfoCard({ icon, title, children, className = "" }) {
  return (
    <div
      className={`p-6 rounded-lg border border-border bg-surface ${className}`}
    >
      <h3 className="text-xl font-bold mb-4">
        {icon} {title}
      </h3>
      <div className="text-text-secondary">{children}</div>
    </div>
  );
}
