export default function OnboardingCard({
  children,
  className = "",
  padding = "p-6",
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
