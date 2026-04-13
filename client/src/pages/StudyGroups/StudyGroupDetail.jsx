import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudyGroupById,
  fetchGroupMembers,
  fetchGroupResources,
  selectSelectedGroup,
  selectGroupMembers,
  selectGroupResources,
  selectGroupDiscussions,
  selectStudyGroupLoading,
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

  const group = useSelector(selectSelectedGroup);
  const members = useSelector(selectGroupMembers(id));
  const resources = useSelector(selectGroupResources(id));
  const discussions = useSelector(selectGroupDiscussions(id));
  const loading = useSelector(selectStudyGroupLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudyGroupById(id));
      dispatch(fetchGroupMembers(id));
      dispatch(fetchGroupResources(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto bg-background">
        <div className="flex items-center justify-center h-screen">
          <p className="text-text-secondary">Loading study group...</p>
        </div>
      </div>
    );
  }

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
        subtitle={group.course || group.subject}
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
