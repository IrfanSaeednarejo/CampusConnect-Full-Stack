export default function Badge({ children, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-primary text-white",
    secondary: "bg-surface text-text-secondary border border-border",
    info: "bg-primary text-white",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
