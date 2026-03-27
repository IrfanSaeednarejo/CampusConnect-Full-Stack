import { useNavigate } from "react-router-dom";

export default function GroupCard({ group }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#238636]/50 transition-colors">
      <div className="mb-4">
        <h3 className="text-[#c9d1d9] text-lg font-bold mb-2">{group.name}</h3>
        <p className="text-[#8b949e] text-sm mb-3">{group.description}</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#238636]/20 text-[#238636] border border-[#238636]/30">
          {group.course}
        </span>
        <div className="flex items-center gap-1 text-[#8b949e]">
          <span className="material-symbols-outlined text-sm">group</span>
          <span className="text-xs font-medium">{group.members} Members</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/study-groups/${group.id}`)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#21262d] text-[#c9d1d9] text-sm font-semibold border border-[#30363d] hover:bg-[#30363d] transition-colors"
        >
          View Group
        </button>
        <button
          onClick={() => navigate(`/study-groups/${group.id}/join`)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-semibold hover:bg-[#2ea043] transition-colors"
        >
          Join Group
        </button>
      </div>
    </div>
  );
}
