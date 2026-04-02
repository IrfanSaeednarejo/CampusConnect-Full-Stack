import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectStudyGroupById,
  selectGroupMembers,
  selectGroupResources,
  selectGroupDiscussions,
  setGroupMembers,
  setGroupResources,
  setGroupDiscussions,
} from "../../redux/slices/studyGroupSlice";
import { useTabs, useNavigation } from "../../hooks";
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

  const group = useSelector(selectStudyGroupById(id));
  const members = useSelector(selectGroupMembers(id));
  const resources = useSelector(selectGroupResources(id));
  const discussions = useSelector(selectGroupDiscussions(id));

  useEffect(() => {
    if (members.length === 0) {
      const mockMembers = [
        { id: 1, name: "Sarah Johnson", role: "Creator", avatar: "SJ" },
        { id: 2, name: "Alex Chen", role: "Member", avatar: "AC" },
        { id: 3, name: "Emma Wilson", role: "Member", avatar: "EW" },
        { id: 4, name: "Michael Brown", role: "Member", avatar: "MB" },
      ];
      dispatch(setGroupMembers({ groupId: id, members: mockMembers }));
    }

    if (resources.length === 0) {
      const mockResources = [
        {
          id: 1,
          name: "Week 1-5 Lecture Notes.pdf",
          type: "PDF",
          uploadedBy: "Sarah Johnson",
          date: "2024-02-10",
        },
        {
          id: 2,
          name: "Practice Problems Set 1.pdf",
          type: "PDF",
          uploadedBy: "Alex Chen",
          date: "2024-02-12",
        },
        {
          id: 3,
          name: "Exam Tips and Strategies",
          type: "Document",
          uploadedBy: "Emma Wilson",
          date: "2024-02-14",
        },
      ];
      dispatch(setGroupResources({ groupId: id, resources: mockResources }));
    }

    if (discussions.length === 0) {
      const mockDiscussions = [
        {
          id: 1,
          author: "Alex Chen",
          avatar: "AC",
          message: "Anyone up for a study session this weekend?",
          timestamp: "2 hours ago",
          replies: 3,
        },
        {
          id: 2,
          author: "Emma Wilson",
          avatar: "EW",
          message: "I'm struggling with pointers. Can someone explain?",
          timestamp: "5 hours ago",
          replies: 7,
        },
      ];
      dispatch(setGroupDiscussions({ groupId: id, discussions: mockDiscussions }));
    }
  }, [dispatch, id, members.length, resources.length, discussions.length]);

  if (!group) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto bg-background">
        <div className="flex items-center justify-center h-screen">
          <p className="text-text-secondary">Study group not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-background">
      {/* Header */}
      <PageHeader
        title={group.name}
        subtitle={group.course}
        icon="groups"
        backPath="/study-groups"
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
