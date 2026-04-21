export default function StatsCard({ value, label, icon }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 text-center shadow-xl hover:border-[#238636]/30 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-[#238636]/10 flex items-center justify-center text-[#238636] mx-auto mb-3 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-xl">{icon || 'analytics'}</span>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="text-[10px] text-[#8b949e] font-bold uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
