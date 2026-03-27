export default function StatCard({ label, value, icon, className = "" }) {
  return (
    <div
      className={`bg-[#161b22] border border-[#30363d] rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#8b949e] text-sm">{label}</p>
          <p className="text-[#238636] text-2xl font-bold">{value}</p>
        </div>
        <span className="material-symbols-outlined text-4xl text-[#238636]">
          {icon}
        </span>
      </div>
    </div>
  );
}
