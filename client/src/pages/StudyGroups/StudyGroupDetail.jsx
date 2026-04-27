import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudyGroupById, selectSelectedStudyGroup, selectStudyGroupLoading,
  joinStudyGroupThunk, leaveStudyGroupThunk, selectStudyGroupActionLoading,
  deleteStudyGroupThunk,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import StudyGroupChatView from "../../components/studyGroups/StudyGroupChatView";
import MembersSection from "../../components/studyGroups/MembersSection";
import ResourcesSection from "../../components/studyGroups/ResourcesSection";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudyGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const group = useSelector(selectSelectedStudyGroup);
  const loading = useSelector(selectStudyGroupLoading);
  const actionLoading = useSelector(selectStudyGroupActionLoading);

  const [activeTab, setActiveTab] = useState("about");
  const [confirmState, setConfirmState] = useState({ isOpen: false });

  useEffect(() => {
    dispatch(fetchStudyGroupById(id));
  }, [dispatch, id]);

  const isCoordinator = useMemo(() =>
    group?.coordinatorId?._id === user?._id || group?.coordinatorId === user?._id,
    [group, user?._id]
  );

  const membership = useMemo(() =>
    group?.groupMembers?.find(m => (m.memberId?._id || m.memberId) === user?._id),
    [group, user?._id]
  );

  const isMember = membership?.status === "approved" || isCoordinator;
  const isPending = membership?.status === "pending";

  const handleJoinLeave = async () => {
    if (isMember) {
      setConfirmState({
        isOpen: true,
        title: "Leave Study Group",
        message: `Are you sure you want to leave "${group.name}"? You'll lose access to the group chat.`,
        confirmText: "Yes, Leave",
        variant: "danger",
        onConfirm: async () => {
          try {
            await dispatch(leaveStudyGroupThunk(id)).unwrap();
            toast.success("Left the group");
            setActiveTab("about");
          } catch (err) { toast.error(err || "Failed to leave"); }
          finally { setConfirmState({ isOpen: false }); }
        }
      });
    } else if (!isPending) {
      try {
        const result = await dispatch(joinStudyGroupThunk(id)).unwrap();
        if (result.status === "pending") toast.success("Request sent! Waiting for approval.");
        else { toast.success("Joined successfully!"); setActiveTab("discussion"); }
      } catch (err) { toast.error(err || "Failed to join"); }
    }
  };

  const handleDelete = () => {
    setConfirmState({
      isOpen: true,
      title: "Delete Study Group",
      message: `Permanently delete "${group.name}"? This cannot be undone.`,
      confirmText: "Delete Group",
      variant: "danger",
      onConfirm: async () => {
        try {
          await dispatch(deleteStudyGroupThunk(id)).unwrap();
          toast.success("Study group deleted");
          navigate("/study-groups");
        } catch (err) { toast.error(err || "Failed to delete"); }
        finally { setConfirmState({ isOpen: false }); }
      }
    });
  };

  if (loading && !group) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#238636] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm">Loading study group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-[#c9d1d9] p-4">
        <span className="material-symbols-outlined text-6xl text-[#f85149] mb-4">error</span>
        <h1 className="text-2xl font-bold">Study Group Not Found</h1>
        <p className="text-[#8b949e] mt-2 text-sm">This group may have been deleted or archived.</p>
        <button onClick={() => navigate("/study-groups")} className="mt-6 px-5 py-2.5 bg-[#238636] rounded-xl font-bold text-sm text-white hover:bg-[#2ea043] transition-all">
          Browse Groups
        </button>
      </div>
    );
  }

  const TABS = [
    { id: "about", label: "About", icon: "info" },
    { id: "members", label: "Members", icon: "group", badge: group.groupMembers?.filter(m => m.status === "pending").length },
    { id: "discussion", label: "Discussion", icon: "forum", locked: !isMember },
    { id: "resources", label: "Resources", icon: "folder_open", locked: !isMember },
  ];

  const memberPct = Math.round((group.memberCount / group.maxMembers) * 100);
  const pendingCount = group.groupMembers?.filter(m => m.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Hero */}
      <div className="relative bg-[#0d1117] border-b border-[#30363d]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#238636]/8 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0 relative">
          {/* Back */}
          <button onClick={() => navigate("/study-groups")} className="flex items-center gap-1 text-[#8b949e] hover:text-[#c9d1d9] text-sm mb-5 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Groups
          </button>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#238636]/20 to-[#1a7f37]/10 
                            border-2 border-[#238636]/30 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-2xl sm:text-3xl font-black text-[#238636] uppercase">
                {group.name?.substring(0, 2) || "??"}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{group.name}</h1>
                {group.isPrivate && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/20 uppercase flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]">lock</span> Private
                  </span>
                )}
                {group.requireJoinApproval && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e3b341]/10 text-[#e3b341] border border-[#e3b341]/20 uppercase">
                    Approval Required
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[#8b949e] text-sm">
                {group.subject && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">school</span>{group.subject}</span>}
                {group.course && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">book</span>{group.course}</span>}
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">group</span>
                  {group.memberCount}/{group.maxMembers}
                </span>
              </div>

              {/* Tags */}
              {group.tags?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {group.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-[#58a6ff] bg-[#58a6ff]/10 px-2 py-0.5 rounded-full border border-[#58a6ff]/15">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {isCoordinator ? (
                <>
                  <button onClick={() => navigate(`/study-groups/${id}/edit`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#21262d] text-white text-sm font-bold rounded-xl border border-[#30363d] hover:bg-[#30363d] transition-all">
                    <span className="material-symbols-outlined text-sm">edit</span> Manage
                  </button>
                  <button onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 text-[#f85149] text-sm font-bold rounded-xl border border-[#f85149]/20 hover:bg-[#f85149]/5 transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoinLeave}
                  disabled={actionLoading || isPending}
                  className={`flex items-center gap-2 px-5 py-2 font-bold rounded-xl transition-all text-sm shadow-lg disabled:opacity-70 ${
                    isMember
                      ? "bg-[#161b22] text-[#f85149] border border-[#f85149]/30 hover:bg-[#f85149]/5"
                      : isPending
                        ? "bg-[#21262d] text-[#e3b341] border border-[#e3b341]/30 cursor-not-allowed"
                        : "bg-[#238636] text-white hover:bg-[#2ea043] shadow-[#238636]/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isMember ? "logout" : isPending ? "hourglass_top" : "person_add"}
                  </span>
                  {isMember ? "Leave" : isPending ? "Pending…" : group.requireJoinApproval ? "Request to Join" : "Join Group"}
                </button>
              )}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex mt-6 border-t border-[#30363d] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.locked && setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "border-[#238636] text-[#238636]"
                    : tab.locked
                      ? "border-transparent text-[#8b949e]/40 cursor-not-allowed"
                      : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]"
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
                {tab.locked && <span className="material-symbols-outlined text-xs">lock</span>}
                {tab.badge > 0 && isCoordinator && (
                  <span className="bg-[#f85149] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                <h2 className="text-white font-bold mb-3">About This Group</h2>
                <p className="text-[#8b949e] text-sm leading-relaxed">
                  {group.description || "No description provided."}
                </p>
              </div>

              {/* Schedule */}
              {group.schedule?.length > 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                  <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#238636]">schedule</span> Weekly Schedule
                  </h2>
                  <div className="space-y-2">
                    {group.schedule.map((s, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                        <span className="text-[#238636] font-bold text-sm w-8">{DAYS[s.day]}</span>
                        <span className="text-[#c9d1d9] text-sm">{s.startTime} – {s.endTime}</span>
                        {s.recurring && <span className="text-[10px] text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded-full">Weekly</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-member CTA */}
              {!isMember && !isPending && (
                <div className="bg-[#238636]/5 border border-[#238636]/20 rounded-2xl p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-[#238636] block mb-4">groups</span>
                  <h3 className="text-white font-bold text-lg mb-2">Join to Unlock Discussion & Resources</h3>
                  <p className="text-[#8b949e] text-sm mb-5">Members get access to group chat and shared study resources.</p>
                  <button onClick={handleJoinLeave} disabled={actionLoading}
                    className="px-6 py-2.5 bg-[#238636] text-white font-bold rounded-xl hover:bg-[#2ea043] transition-all text-sm">
                    {group.requireJoinApproval ? "Request to Join" : "Join Group"}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Stats */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 space-y-4">
                <h3 className="text-[#8b949e] text-xs font-bold uppercase tracking-widest">Group Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Members", value: group.memberCount, sub: `/ ${group.maxMembers} max` },
                    { label: "Resources", value: group.groupResources?.length || 0, sub: "files" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#0d1117] rounded-xl p-3 border border-[#30363d] text-center">
                      <p className="text-xl font-black text-white">{s.value}</p>
                      <p className="text-[9px] text-[#8b949e] uppercase font-bold">{s.label}</p>
                      <p className="text-[9px] text-[#8b949e]">{s.sub}</p>
                    </div>
                  ))}
                </div>
                {/* Capacity bar */}
                <div>
                  <div className="flex justify-between text-xs text-[#8b949e] mb-1">
                    <span>Capacity</span><span>{memberPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${memberPct >= 90 ? "bg-[#f85149]" : "bg-[#238636]"}`}
                      style={{ width: `${Math.min(memberPct, 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Coordinator */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                <h3 className="text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-3">Coordinator</h3>
                <div className="flex items-center gap-3">
                  {group.coordinatorId?.profile?.avatar ? (
                    <img src={group.coordinatorId.profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#238636]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#238636] text-lg">person</span>
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-bold">{group.coordinatorId?.profile?.displayName || "Unknown"}</p>
                    <p className="text-[10px] text-[#e3b341] font-bold uppercase">Group Leader</p>
                  </div>
                </div>
              </div>

              {/* Joining Policy */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                <h3 className="text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-3">Joining Policy</h3>
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-lg ${group.requireJoinApproval ? "text-[#e3b341]" : "text-[#238636]"}`}>
                    {group.requireJoinApproval ? "how_to_reg" : "door_open"}
                  </span>
                  <span className="text-[#c9d1d9] text-sm">
                    {group.requireJoinApproval ? "Requires coordinator approval" : "Open — anyone can join"}
                  </span>
                </div>
              </div>

              {/* Pending requests badge for coordinator */}
              {isCoordinator && pendingCount > 0 && (
                <button onClick={() => setActiveTab("members")}
                  className="w-full flex items-center gap-3 bg-[#f85149]/5 border border-[#f85149]/20 rounded-2xl p-4 hover:bg-[#f85149]/10 transition-all">
                  <span className="bg-[#f85149] text-white text-xs font-black px-2 py-1 rounded-full">{pendingCount}</span>
                  <span className="text-[#f85149] text-sm font-bold">Pending join requests</span>
                  <span className="material-symbols-outlined text-sm text-[#f85149] ml-auto">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <MembersSection members={group.groupMembers} isCoordinator={isCoordinator} groupId={id} />
        )}

        {activeTab === "discussion" && isMember && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden" style={{ height: "65vh" }}>
            <StudyGroupChatView chatId={group.chatId?._id || group.chatId} groupName={group.name} />
          </div>
        )}

        {activeTab === "resources" && isMember && (
          <ResourcesSection groupId={id} isCoordinator={isCoordinator} />
        )}

        {/* Locked tab message */}
        {(activeTab === "discussion" || activeTab === "resources") && !isMember && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-[#30363d] block mb-4">lock</span>
            <h3 className="text-white font-bold text-lg mb-2">Members Only</h3>
            <p className="text-[#8b949e] text-sm mb-6">Join this group to access the {activeTab === "discussion" ? "group chat" : "shared resources"}.</p>
            <button onClick={handleJoinLeave} disabled={actionLoading || isPending}
              className="px-5 py-2.5 bg-[#238636] text-white font-bold rounded-xl hover:bg-[#2ea043] transition-all text-sm disabled:opacity-60">
              {isPending ? "Request Pending…" : "Join Group"}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal {...confirmState} onCancel={() => setConfirmState({ isOpen: false })} />
    </div>
  );
}
