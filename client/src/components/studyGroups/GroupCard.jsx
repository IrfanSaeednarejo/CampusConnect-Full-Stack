import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const { isAuthenticated, openAuth, savePendingAction, user } = useAuth();

  const isCoordinator = group.coordinatorId?._id === user?._id || group.coordinatorId === user?._id;
  
  // Note: Detailed membership status is usually fetched in the detail view, 
  // but we can check if the current user is recorded in the group object if provided
  const isMember = group.groupMembers?.some(m => (m.memberId?._id || m.memberId) === user?._id && m.status === 'approved');
  const isPending = group.groupMembers?.some(m => (m.memberId?._id || m.memberId) === user?._id && m.status === 'pending');

  const handleJoinClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      savePendingAction({ 
        type: 'JOIN_STUDY_GROUP', 
        payload: group._id || group.id, 
        returnPath: `/study-groups/${group._id || group.id}` 
      });
      return openAuth();
    }
    navigate(`/study-groups/${group._id || group.id}`);
  };

  return (
    <div 
      onClick={() => navigate(`/study-groups/${group._id || group.id}`)}
      className="group bg-[#161b22] border border-[#30363d] rounded-2xl p-6 hover:border-[#238636]/50 hover:bg-[#1c2128] transition-all duration-300 flex flex-col h-full cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-[#238636]/5"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#238636]/10 flex items-center justify-center text-[#238636] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            {group.isPrivate && (
                 <span className="bg-[#f85149]/10 text-[#f85149] text-[10px] px-2 py-0.5 rounded-full border border-[#f85149]/20 font-bold uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span> Private
                </span>
            )}
        </div>

        <h3 className="text-[#c9d1d9] text-xl font-bold mb-2 group-hover:text-white transition-colors line-clamp-1">
            {group.name}
        </h3>
        
        <p className="text-[#8b949e] text-sm mb-6 line-clamp-2 leading-relaxed">
            {group.description || "A collaborative space for learning and academic growth."}
        </p>
        
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
            {group.course || group.subject || "Academic"}
          </span>
          <div className="flex items-center gap-1.5 text-[#8b949e]">
            <span className="material-symbols-outlined text-sm">group</span>
            <span className="text-xs font-bold">{group.memberCount ?? 0} Members</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-[#30363d]">
        <button
          className="flex-1 px-4 py-2.5 rounded-xl bg-transparent text-[#c9d1d9] text-xs font-bold border border-[#30363d] hover:bg-[#30363d] transition-all"
        >
          View Details
        </button>
        <button
          onClick={handleJoinClick}
          className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg ${
            isMember 
                ? 'bg-[#161b22] text-[#238636] border border-[#238636]/30' 
                : isPending
                    ? 'bg-[#21262d] text-[#e3b341] border border-[#e3b341]/30 opacity-70'
                    : isCoordinator
                        ? 'bg-[#238636]/10 text-[#238636] border border-[#238636]/30'
                        : 'bg-[#238636] text-white hover:bg-[#2eaa43] shadow-[#238636]/20'
          }`}
        >
          {isMember ? 'Joined' : isPending ? 'Pending' : isCoordinator ? 'Leader' : group.requireJoinApproval ? 'Request to Join' : 'Join Now'}
        </button>
      </div>
    </div>
  );
}
