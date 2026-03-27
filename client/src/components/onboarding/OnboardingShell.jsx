export default function OnboardingShell({ children, className = "" }) {
  return (
    <div
      className={`bg-[#0d1117] font-display min-h-screen flex items-center justify-center p-4 ${className}`}
    >
      {children}
    </div>
  );
}
