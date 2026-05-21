export default function Badge({ children, variant = "primary", className = "" }) {
  const variants = {
    primary: "border border-primary bg-primary text-white",
    secondary: "border border-border bg-[rgb(var(--color-surface-muted)/1)] text-text-secondary",
    info: "border border-info bg-info text-white",
  };

  return (
    <span
      className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
