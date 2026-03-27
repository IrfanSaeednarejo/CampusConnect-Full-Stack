export default function OnboardingCard({
  children,
  className = "",
  padding = "p-6",
}) {
  return (
    <div
      className={`rounded-lg border border-[#30363d] bg-[#161b22] ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
