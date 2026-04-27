import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveMemberThunk, rejectMemberThunk, removeMemberThunk,
  selectStudyGroupActionLoading,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

function MemberRow({ member, isCoordinator, groupId, currentUserId }) {
  const dispatch = useDispatch();
  const actionLoading = useSelector(selectStudyGroupActionLoading);

  const memberId = member.memberId?._id || member.memberId;
  const isCurrentUser = memberId === currentUserId;
  const displayName = member.memberId?.profile?.displayName || member.memberId?.profile?.firstName || "Member";
  const avatar = member.memberId?.profile?.avatar;
  const isPending = member.status === "pending";
  const isApproved = member.status === "approved";

  const handleApprove = async () => {
    try {
      await dispatch(approveMemberThunk({ groupId, memberUserId: memberId })).unwrap();
      toast.success(`${displayName} approved!`);
    } catch (err) { toast.error(err || "Failed to approve"); }
  };

  const handleReject = async () => {
    try {
      await dispatch(rejectMemberThunk({ groupId, memberUserId: memberId })).unwrap();
      toast.success("Request rejected");
    } catch (err) { toast.error(err || "Failed to reject"); }
  };

  const handleRemove = async () => {
    if (!confirm(`Remove ${displayName} from the group?`)) return;
    try {
      await dispatch(removeMemberThunk({ groupId, memberId })).unwrap();
      toast.success(`${displayName} removed`);
    } catch (err) { toast.error(err || "Failed to remove"); }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
      isPending
        ? "bg-[#e3b341]/5 border-[#e3b341]/20"
        : "bg-[#0d1117] border-[#30363d] hover:border-[#238636]/20"
    }`}>
      {/* Avatar */}
      {avatar ? (
        <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#238636]/10 border border-[#238636]/20 flex items-center justify-center shrink-0">
          <span className="text-[#238636] font-black text-sm uppercase">{displayName[0]}</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[#c9d1d9] font-medium text-sm truncate">{displayName}</p>
          {isCurrentUser && <span className="text-[9px] text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded-full">You</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
            member.role === "coordinator"
              ? "text-[#e3b341] bg-[#e3b341]/10"
              : "text-[#8b949e] bg-[#30363d]/50"
          }`}>
            {member.role || "member"}
          </span>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
            isPending ? "text-[#e3b341] bg-[#e3b341]/10" : "text-[#238636] bg-[#238636]/10"
          }`}>
            {member.status}
          </span>
          {member.joinedAt && (
            <span className="text-[10px] text-[#8b949e]">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {isCoordinator && !isCurrentUser && (
        <div className="flex items-center gap-2 shrink-0">
          {isPending && (
            <>
              <button onClick={handleApprove} disabled={actionLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#238636] text-white text-xs font-bold rounded-lg hover:bg-[#2ea043] transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">check_circle</span> Approve
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#f85149]/10 text-[#f85149] text-xs font-bold rounded-lg border border-[#f85149]/20 hover:bg-[#f85149]/20 transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">cancel</span> Reject
              </button>
            </>
          )}
          {isApproved && (
            <button onClick={handleRemove} disabled={actionLoading}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#f85149] hover:bg-[#f85149]/10 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">person_remove</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MembersSection({ members = [], isCoordinator, groupId }) {
  const { user } = useAuth();

  const pendingMembers = useMemo(() => members.filter(m => m.status === "pending"), [members]);
  const approvedMembers = useMemo(() => members.filter(m => m.status === "approved"), [members]);

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {isCoordinator && pendingMembers.length > 0 && (
        <div className="bg-[#161b22] border border-[#e3b341]/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e3b341]/10 bg-[#e3b341]/5">
            <span className="material-symbols-outlined text-[#e3b341]">pending</span>
            <h3 className="text-[#e3b341] font-bold">Pending Requests</h3>
            <span className="bg-[#e3b341] text-[#0d1117] text-xs font-black px-2 py-0.5 rounded-full">{pendingMembers.length}</span>
          </div>
          <div className="p-4 space-y-3">
            {pendingMembers.map(m => (
              <MemberRow
                key={m.memberId?._id || m.memberId}
                member={m}
                isCoordinator={isCoordinator}
                groupId={groupId}
                currentUserId={user?._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Members */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#30363d]">
          <span className="material-symbols-outlined text-[#238636]">group</span>
          <h3 className="text-white font-bold">Active Members</h3>
          <span className="text-[#8b949e] text-sm ml-auto">{approvedMembers.length} member{approvedMembers.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="p-4 space-y-3">
          {approvedMembers.length === 0 ? (
            <div className="text-center py-8 text-[#8b949e] text-sm">
              <span className="material-symbols-outlined text-3xl block mb-2">group</span>
              No approved members yet
            </div>
          ) : (
            approvedMembers.map(m => (
              <MemberRow
                key={m.memberId?._id || m.memberId}
                member={m}
                isCoordinator={isCoordinator}
                groupId={groupId}
                currentUserId={user?._id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
