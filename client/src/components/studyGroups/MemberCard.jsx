export default function MemberCard({ member }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#238636] flex items-center justify-center text-white font-bold">
          {member.avatar}
        </div>
        <div>
          <div className="text-[#c9d1d9] font-semibold">{member.name}</div>
          <div className="text-sm text-[#8b949e]">{member.role}</div>
        </div>
      </div>
      <button className="px-4 py-2 rounded-lg bg-[#21262d] text-[#c9d1d9] text-sm font-medium border border-[#30363d] hover:bg-[#30363d] transition-colors">
        View Profile
      </button>
    </div>
  );
}
