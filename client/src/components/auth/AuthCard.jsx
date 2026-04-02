export default function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`w-full rounded-lg border border-border bg-surface ${className}`}
    >
      {children}
    </div>
  );
}
