export default function StatsCard({ value, label }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
      <div className="text-3xl font-bold text-[#238636]">{value}</div>
      <div className="text-sm text-[#8b949e] mt-1">{label}</div>
    </div>
  );
}
