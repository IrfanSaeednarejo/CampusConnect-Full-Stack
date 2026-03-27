export default function ValueCard({ title, description, className = "" }) {
  return (
    <div
      className={`p-4 rounded-lg border border-[#30363d] bg-[#161b22] ${className}`}
    >
      <h3 className="text-[#238636] font-bold mb-2">{title}</h3>
      <p className="text-[#8b949e] text-sm">{description}</p>
    </div>
  );
}
