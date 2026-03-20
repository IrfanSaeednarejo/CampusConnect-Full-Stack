export default function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`w-full rounded-lg border border-[#30363d] bg-[#161b22] ${className}`}
    >
      {children}
    </div>
  );
}
