import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  approveMemberThunk,
  rejectMemberThunk,
  removeMemberThunk,
  selectStudyGroupActionLoading,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import {
  getStudyGroupTheme,
} from "./studyGroupTheme";

function MemberRow({ member, isCoordinator, groupId, currentUserId, theme, isDark }) {
  const dispatch = useDispatch();
  const actionLoading = useSelector(selectStudyGroupActionLoading);

  const memberId = member.memberId?._id || member.memberId;
  const isCurrentUser = memberId === currentUserId;
  const displayName =
    member.memberId?.profile?.displayName || member.memberId?.profile?.firstName || "Member";
  const avatar = member.memberId?.profile?.avatar;
  const isPending = member.status === "pending";
  const isApproved = member.status === "approved";

  const handleApprove = async () => {
    try {
      await dispatch(approveMemberThunk({ groupId, memberUserId: memberId })).unwrap();
      toast.success(`${displayName} approved!`);
    } catch (err) {
      toast.error(err || "Failed to approve");
    }
  };

  const handleReject = async () => {
    try {
      await dispatch(rejectMemberThunk({ groupId, memberUserId: memberId })).unwrap();
      toast.success("Request rejected");
    } catch (err) {
      toast.error(err || "Failed to reject");
    }
  };

  const handleRemove = async () => {
    if (!confirm(`Remove ${displayName} from the group?`)) return;
    try {
      await dispatch(removeMemberThunk({ groupId, memberId })).unwrap();
      toast.success(`${displayName} removed`);
    } catch (err) {
      toast.error(err || "Failed to remove");
    }
  };

  return (
    <div
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition ${
        isPending ? theme.warningSurface : `${theme.surfaceMuted} ${theme.hoverSurface}`
      }`}
    >
      {avatar ? (
        <img src={avatar} alt={displayName} className="h-10 w-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${theme.accentSurface}`}>
          <span className={`text-sm font-semibold uppercase ${theme.iconAccent}`}>{displayName[0]}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate text-sm font-medium ${theme.title}`}>{displayName}</p>
          {isCurrentUser && (
            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] ${theme.surfaceSoft} ${theme.muted}`}>
              You
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              member.role === "coordinator"
                ? `${theme.warningSurface} ${theme.warningText}`
                : `${theme.surfaceSoft} ${theme.muted}`
            }`}
          >
            {member.role || "member"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              isPending ? `${theme.warningSurface} ${theme.warningText}` : `${theme.accentSoft}`
            }`}
          >
            {member.status}
          </span>
          {member.joinedAt && (
            <span className={`text-[11px] ${theme.muted}`}>
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {isCoordinator && !isCurrentUser && (
        <div className="flex shrink-0 items-center gap-2">
          {isPending && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${theme.buttonPrimary}`}
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${theme.buttonDanger}`}
              >
                Reject
              </button>
            </>
          )}
          {isApproved && (
            <button
              onClick={handleRemove}
              disabled={actionLoading}
              className={`rounded-xl border p-2 opacity-0 transition group-hover:opacity-100 disabled:opacity-50 ${theme.buttonDanger}`}
            >
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
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

  const pendingMembers = useMemo(() => members.filter((member) => member.status === "pending"), [members]);
  const approvedMembers = useMemo(() => members.filter((member) => member.status === "approved"), [members]);

  return (
    <div className="space-y-6">
      {isCoordinator && pendingMembers.length > 0 && (
        <div className={`overflow-hidden rounded-[28px] border ${theme.warningSurface}`}>
          <div className="flex items-center gap-3 border-b px-5 py-4">
            <span className={`material-symbols-outlined ${theme.warningText}`}>pending</span>
            <h3 className={`text-lg font-medium ${theme.warningText}`}>Pending Requests</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${theme.warningText}`}>
              {pendingMembers.length}
            </span>
          </div>
          <div className="space-y-3 p-4">
            {pendingMembers.map((member) => (
              <MemberRow
                key={member.memberId?._id || member.memberId}
                member={member}
                isCoordinator={isCoordinator}
                groupId={groupId}
                currentUserId={user?._id}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      <div className={`overflow-hidden rounded-[28px] border ${theme.surface}`}>
        <div className={`flex items-center gap-3 border-b px-5 py-4 ${theme.border}`}>
          <span className={`material-symbols-outlined ${theme.iconAccent}`}>group</span>
          <h3 className={`text-lg font-medium ${theme.title}`}>Active Members</h3>
          <span className={`ml-auto text-sm ${theme.muted}`}>
            {approvedMembers.length} member{approvedMembers.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="p-4">
          {approvedMembers.length === 0 ? (
            <div className={`py-10 text-center text-sm ${theme.muted}`}>
              <span className={`material-symbols-outlined mb-2 block text-3xl ${theme.subtle}`}>group</span>
              No approved members yet
            </div>
          ) : (
            <div className="space-y-3">
              {approvedMembers.map((member) => (
                <MemberRow
                  key={member.memberId?._id || member.memberId}
                  member={member}
                  isCoordinator={isCoordinator}
                  groupId={groupId}
                  currentUserId={user?._id}
                  theme={theme}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
