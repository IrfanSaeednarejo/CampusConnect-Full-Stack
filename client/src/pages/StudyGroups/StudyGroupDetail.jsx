import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchStudyGroupById, 
  selectSelectedStudyGroup, 
  selectStudyGroupLoading,
  joinStudyGroupThunk,
  leaveStudyGroupThunk,
  selectStudyGroupActionLoading
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

// Components
import StudyGroupChatView from "../../components/studyGroups/StudyGroupChatView";
import MembersSection from "../../components/studyGroups/MembersSection";
import ResourcesSection from "../../components/studyGroups/ResourcesSection";
import TabNavigation from "../../components/studyGroups/TabNavigation";

export default function StudyGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const group = useSelector(selectSelectedStudyGroup);
  const loading = useSelector(selectStudyGroupLoading);
  const actionLoading = useSelector(selectStudyGroupActionLoading);
  
  const [activeTab, setActiveTab] = useState("discussion");

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

  const isMember = membership?.status === 'approved' || isCoordinator;
  const isPending = membership?.status === 'pending';

  const handleJoinLeave = async () => {
    if (isMember || isPending) {
        if (!window.confirm("Are you sure you want to leave this study group?")) return;
        try {
            await dispatch(leaveStudyGroupThunk(id)).unwrap();
            toast.success("Successfully left the group");
        } catch (err) {
            toast.error(err || "Failed to leave group");
        }
    } else {
        try {
            const result = await dispatch(joinStudyGroupThunk(id)).unwrap();
            if (result.status === 'pending') {
                toast.success("Requested to join! Waiting for approval.");
            } else {
                toast.success("Successfully joined the study group!");
            }
        } catch (err) {
            toast.error(err || "Failed to join group");
        }
    }
  };

  if (loading && !group) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#238636] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#8b949e]">Loading study group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4">
        <span className="material-symbols-outlined text-6xl text-[#f85149] mb-4">error</span>
        <h1 className="text-2xl font-bold">Study Group Not Found</h1>
        <p className="text-[#8b949e] mt-2">The group you're looking for might have been deleted or archived.</p>
        <button onClick={() => navigate("/study-groups")} className="mt-6 px-6 py-2 bg-[#238636] rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const TABS = [
    { id: "discussion", label: "Discussion", icon: "forum", disabled: !isMember },
    { id: "members", label: "Members", icon: "group" },
    { id: "resources", label: "Resources", icon: "folder_open", disabled: !isMember },
    { id: "about", label: "About", icon: "info" },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] pb-20">
      {/* Premium Hero Banner */}
      <div className="relative h-64 w-full bg-[#161b22] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#238636]/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative flex items-end pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 w-full">
                {/* Visual Identity */}
                <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#0d1117] border-4 border-[#30363d] rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
                       {group.coordinatorId?.profile?.avatar ? (
                           <img src={group.coordinatorId.profile.avatar} className="w-full h-full object-cover" alt="logo" />
                       ) : (
                           <span className="text-4xl sm:text-5xl font-black text-[#238636] uppercase">
                               {group.name.substring(0, 2)}
                           </span>
                       )}
                    </div>
                </div>

                {/* Info & Actions */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{group.name}</h1>
                            {group.isPrivate && (
                                <span className="bg-[#f85149]/10 text-[#f85149] text-[10px] px-2 py-0.5 rounded-full border border-[#f85149]/20 font-bold uppercase flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">lock</span> Private
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-[#8b949e] text-sm">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">school</span> {group.subject}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span> {group.campusId?.name || "Global"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isCoordinator ? (
                            <button 
                                onClick={() => navigate(`/study-groups/edit/${id}`)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#21262d] text-white font-bold rounded-xl border border-[#30363d] hover:bg-[#30363d] transition-all"
                            >
                                <span className="material-symbols-outlined">edit</span> Manage Group
                            </button>
                        ) : (
                            <button 
                                onClick={handleJoinLeave}
                                disabled={actionLoading}
                                className={`flex items-center gap-2 px-8 py-2.5 font-bold rounded-xl transition-all shadow-lg ${
                                    isMember 
                                        ? 'bg-[#161b22] text-[#f85149] border border-[#f85149]/30 hover:bg-[#f85149]/5' 
                                        : isPending
                                            ? 'bg-[#21262d] text-[#e3b341] border border-[#e3b341]/30 opacity-80 cursor-not-allowed'
                                            : 'bg-[#238636] text-white hover:bg-[#2ea043]'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {isMember ? 'logout' : isPending ? 'hourglass_top' : 'person_add'}
                                </span>
                                {isMember ? 'Leave Group' : isPending ? 'Request Pending' : group.requireJoinApproval ? 'Request to Join' : 'Join Group'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar / Info */}
            <div className="lg:col-span-4 space-y-6">
                {/* Navigation */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-2 shadow-xl">
                    <div className="flex flex-col gap-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                disabled={tab.disabled}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-[#238636] text-white shadow-md' 
                                        : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                                } ${tab.disabled && 'opacity-30 grayscale cursor-not-allowed'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined">{tab.icon}</span>
                                    <span className="font-bold">{tab.label}</span>
                                </div>
                                {tab.disabled && <span className="material-symbols-outlined text-sm">lock</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats & Metadata */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-6 shadow-xl">
                    <div>
                        <h3 className="text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-4">Group Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] text-center">
                                <p className="text-xl font-black text-white">{group.memberCount}/{group.maxMembers}</p>
                                <p className="text-[10px] text-[#8b949e] font-bold uppercase">Members</p>
                            </div>
                            <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] text-center">
                                <p className="text-xl font-black text-white">{group.groupResources?.length || 0}</p>
                                <p className="text-[10px] text-[#8b949e] font-bold uppercase">Files</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#238636]/10 flex items-center justify-center text-[#238636]">
                                <span className="material-symbols-outlined">schedule</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#8b949e] uppercase">Weekly Schedule</p>
                                <p className="text-sm text-[#c9d1d9] font-medium">
                                    {group.schedule?.length > 0 
                                        ? `${group.schedule.length} sessions per week` 
                                        : "Flexible schedule"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#238636]/10 flex items-center justify-center text-[#238636]">
                                <span className="material-symbols-outlined">policy</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#8b949e] uppercase">Joining Policy</p>
                                <p className="text-sm text-[#c9d1d9] font-medium">
                                    {group.requireJoinApproval ? "Coordinator Approval Required" : "Instant Access"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Main Content */}
            <div className="lg:col-span-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === "discussion" && isMember && (
                        <div className="space-y-6">
                            <StudyGroupChatView chatId={group.chatId?._id || group.chatId} groupName={group.name} />
                        </div>
                    )}

                    {activeTab === "members" && (
                        <MembersSection 
                            members={group.groupMembers} 
                            isCoordinator={isCoordinator} 
                            groupId={id}
                        />
                    )}

                    {activeTab === "resources" && isMember && (
                        <ResourcesSection groupId={id} resources={group.groupResources} />
                    )}

                    {activeTab === "about" && (
                        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold text-white mb-6">About this Study Group</h2>
                            <p className="text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">{group.description || "No description provided for this study group."}</p>
                            
                            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h3 className="text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-4">Academic Focus</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-sm text-[#c9d1d9]">
                                            <span className="material-symbols-outlined text-[#238636]">check_circle</span>
                                            <strong>Subject:</strong> {group.subject}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-[#c9d1d9]">
                                            <span className="material-symbols-outlined text-[#238636]">check_circle</span>
                                            <strong>Course:</strong> {group.course || "General"}
                                        </li>
                                    </ul>
                                </section>
                                <section>
                                    <h3 className="text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-4">Coordinator Info</h3>
                                    <div className="flex items-center gap-3">
                                        <img src={group.coordinatorId?.profile?.avatar} className="w-10 h-10 rounded-full" alt="coordinator" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{group.coordinatorId?.profile?.displayName}</p>
                                            <p className="text-[10px] text-[#8b949e] uppercase font-bold">Group Leader</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {!isMember && (activeTab === "discussion" || activeTab === "resources") && (
                         <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center shadow-xl">
                            <div className="w-20 h-20 bg-[#238636]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl text-[#238636]">lock</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Member Access Only</h2>
                            <p className="text-[#8b949e] mt-4 max-w-md mx-auto">
                                You must be an approved member of this study group to access the group chat and shared resources.
                            </p>
                            <button onClick={handleJoinLeave} className="mt-8 px-8 py-3 bg-[#238636] text-white font-bold rounded-xl hover:bg-[#2ea043] transition-all">
                                {isPending ? 'View Request Status' : 'Request to Join'}
                            </button>
                         </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
