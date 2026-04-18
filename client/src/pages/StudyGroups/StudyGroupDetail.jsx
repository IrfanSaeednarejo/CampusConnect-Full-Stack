import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedStudyGroup,
  fetchStudyGroupById,
  selectStudyGroupLoading,
  joinStudyGroupThunk,
  leaveStudyGroupThunk,
} from "../../redux/slices/studyGroupSlice";
import { useTabs, useNavigation } from "../../hooks";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import PageHeader from "../../components/common/PageHeader";
import TabNavigation from "../../components/studyGroups/TabNavigation";
import GroupInfoSection from "../../components/studyGroups/GroupInfoSection";
import MembersSection from "../../components/studyGroups/MembersSection";
import ResourcesSection from "../../components/studyGroups/ResourcesSection";
import DiscussionSection from "../../components/studyGroups/DiscussionSection";

const TABS = ["overview", "members", "resources", "discussion"];

export default function StudyGroupDetail() {
  const { goBack } = useNavigation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { activeTab, setActiveTab } = useTabs(TABS, "overview");
  const { isAuthenticated, openAuth, user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const group = useSelector(selectSelectedStudyGroup);
  const loading = useSelector(selectStudyGroupLoading);
  
  // For now, these are embedded in the group object or separate thunks
  const members = group?.groupMembers || [];
  const resources = group?.groupResources || [];
  const discussions = []; // To be implemented with Chat

  useEffect(() => {
    dispatch(fetchStudyGroupById(id));
  }, [dispatch, id]);

  const isMember = group?.groupMembers?.some(m => (m.memberId._id || m.memberId) === user?._id) || group?.isMember;

  const handleJoinLeave = async () => {
    if (!isAuthenticated) return openAuth();
    
    try {
      if (isMember) {
        await dispatch(leaveStudyGroupThunk(id)).unwrap();
        showSuccess("Left study group");
      } else {
        await dispatch(joinStudyGroupThunk(id)).unwrap();
        showSuccess("Joined study group!");
      }
    } catch (err) {
      showError(err || "Action failed");
    }
  };

  if (!group) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#8b949e]">Study group not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
      {/* Header */}
      <PageHeader
        title={group.name}
        subtitle={group.course || group.subject}
        icon="groups"
        backPath="/study-groups"
        action={
          <button
            onClick={handleJoinLeave}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              isMember
                ? "bg-[#30363d] text-[#c9d1d9] hover:bg-[#3d444d] border border-[#d0d7de20]"
                : "bg-[#238636] text-white hover:bg-[#2ea043]"
            }`}
          >
            {isMember ? "Leave Group" : "Join Group"}
          </button>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={TABS}
        />

        {/* Tab Content */}
        {activeTab === "overview" && <GroupInfoSection group={group} />}

        {activeTab === "members" && <MembersSection members={members} />}

        {activeTab === "resources" && (
          <ResourcesSection resources={resources} />
        )}

        {activeTab === "discussion" && (
          <DiscussionSection discussions={discussions} />
        )}
      </main>
    </div>
  );
}
