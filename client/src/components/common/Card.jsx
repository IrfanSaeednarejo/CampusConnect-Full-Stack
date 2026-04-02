export default function Card({ children, className = "", padding = "p-8" }) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
