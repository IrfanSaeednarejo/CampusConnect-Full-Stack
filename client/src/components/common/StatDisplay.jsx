export default function StatDisplay({ stat, label, className = "" }) {
  return (
    <div
      className={`p-6 rounded-lg border border-[#30363d] bg-[#161b22] text-center ${className}`}
    >
      <p className="text-3xl font-bold text-[#238636] mb-2">{stat}</p>
      <p className="text-[#8b949e] text-sm">{label}</p>
    </div>
  );
}
