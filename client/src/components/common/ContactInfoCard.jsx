export default function ContactInfoCard({ icon, title, children, className = "" }) {
  return (
    <div
      className={`p-6 rounded-lg border border-[#30363d] bg-[#161b22] ${className}`}
    >
      <h3 className="text-xl font-bold mb-4">
        {icon} {title}
      </h3>
      <div className="text-[#8b949e]">{children}</div>
    </div>
  );
}
