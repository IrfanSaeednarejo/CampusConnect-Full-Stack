import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const { isAuthenticated, openAuth, savePendingAction } = useAuth();

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#238636]/50 transition-colors flex flex-col h-full">
      <div className="flex-grow mb-4">
        <h3 className="text-[#c9d1d9] text-lg font-bold mb-2 line-clamp-1">{group.name}</h3>
        <p className="text-[#8b949e] text-sm mb-3 line-clamp-2">{group.description}</p>
        
        <div className="flex items-center gap-3 mt-auto">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#238636]/20 text-[#238636] border border-[#238636]/30">
            {group.course || group.subject}
          </span>
          <div className="flex items-center gap-1 text-[#8b949e]">
            <span className="material-symbols-outlined text-sm">group</span>
            <span className="text-xs font-medium">{group.memberCount ?? 0} Members</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/study-groups/${group._id || group.id}`)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#21262d] text-[#c9d1d9] text-sm font-semibold border border-[#30363d] hover:bg-[#30363d] transition-colors"
        >
          View Group
        </button>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              savePendingAction({ type: 'JOIN_STUDY_GROUP', payload: group._id || group.id, returnPath: `/study-groups/${group._id || group.id}` });
              return openAuth();
            }
            navigate(`/study-groups/${group._id || group.id}/join`);
          }}
          className="flex-1 px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-semibold hover:bg-[#2ea043] transition-colors"
        >
          Join Group
        </button>
      </div>
    </div>
  );
}
