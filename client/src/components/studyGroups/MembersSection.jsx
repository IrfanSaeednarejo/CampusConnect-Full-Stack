import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { approveMemberThunk, rejectMemberThunk, selectStudyGroupActionLoading } from "../../redux/slices/studyGroupSlice";
import MemberCard from "./MemberCard";
import { toast } from "react-hot-toast";

export default function MembersSection({ members, isCoordinator, groupId }) {
  const dispatch = useDispatch();
  const actionLoading = useSelector(selectStudyGroupActionLoading);

  const activeMembers = useMemo(() => 
    members.filter(m => m.status === 'approved' || m.role === 'coordinator'), [members]);
  
  const pendingRequests = useMemo(() => 
    members.filter(m => m.status === 'pending'), [members]);

  const handleApprove = async (memberUserId) => {
    try {
      await dispatch(approveMemberThunk({ groupId, memberUserId })).unwrap();
      toast.success("Member approved!");
    } catch (err) {
      toast.error(err || "Failed to approve member");
    }
  };

  const handleReject = async (memberUserId) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await dispatch(rejectMemberThunk({ groupId, memberUserId })).unwrap();
      toast.success("Request rejected.");
    } catch (err) {
      toast.error(err || "Failed to reject request");
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Requests - Section for Coordinator */}
      {isCoordinator && pendingRequests.length > 0 && (
        <div className="bg-[#1c2128] border border-[#f85149]/30 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-[#f85149]/5 px-6 py-4 border-b border-[#f85149]/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#f85149]">
              <span className="material-symbols-outlined text-xl">person_add</span>
              <h2 className="font-bold">Pending Join Requests ({pendingRequests.length})</h2>
            </div>
          </div>
          <div className="divide-y divide-[#30363d]">
            {pendingRequests.map((m) => (
              <div key={m.memberId._id || m.memberId} className="p-4 flex items-center justify-between hover:bg-[#21262d] transition-colors">
                 <div className="flex items-center gap-3">
                    <img 
                        src={m.memberId?.profile?.avatar || `https://ui-avatars.com/api/?name=${m.memberId?.profile?.displayName || 'U'}`} 
                        className="w-10 h-10 rounded-full border border-[#30363d]" 
                        alt="avatar" 
                    />
                    <div>
                        <p className="text-sm font-bold text-[#c9d1d9]">{m.memberId?.profile?.displayName}</p>
                        <p className="text-xs text-[#8b949e]">{m.memberId?.academic?.department || "Student"}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => handleApprove(m.memberId._id || m.memberId)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-[#238636] text-white text-xs font-bold hover:bg-[#2eaa43] transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">check</span> Accept
                    </button>
                    <button 
                         onClick={() => handleReject(m.memberId._id || m.memberId)}
                         disabled={actionLoading}
                         className="px-3 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-[#f85149] text-xs font-bold hover:bg-[#30363d] transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">close</span> Reject
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Members */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]/50">
            <h2 className="text-lg font-bold text-[#c9d1d9] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3fb950]">group</span>
                Active Members ({activeMembers.length})
            </h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMembers.map((m) => (
             <div key={m.memberId._id || m.memberId} className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl flex items-center gap-4 hover:border-[#8b949e]/30 transition-all">
                <img 
                    src={m.memberId?.profile?.avatar || `https://ui-avatars.com/api/?name=${m.memberId?.profile?.displayName || 'U'}`} 
                    className="w-12 h-12 rounded-full border border-[#30363d]" 
                    alt="avatar" 
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#c9d1d9]">{m.memberId?.profile?.displayName}</p>
                        {m.role === 'coordinator' && (
                            <span className="bg-[#238636]/20 text-[#3fb950] text-[10px] px-2 py-0.5 rounded-full border border-[#238636]/30 font-bold uppercase">Leader</span>
                        )}
                    </div>
                    <p className="text-xs text-[#8b949e] mt-0.5">{m.memberId?.academic?.department || "Campus Nexus Student"}</p>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
