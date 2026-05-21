import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  fetchStudyGroupById,
  selectSelectedStudyGroup,
  selectStudyGroupLoading,
  joinStudyGroupThunk,
  leaveStudyGroupThunk,
  selectStudyGroupActionLoading,
  deleteStudyGroupThunk,
} from "../../redux/slices/studyGroupSlice";
import { fetchModuleLeaderboard, selectGamificationLeaderboards } from "../../redux/slices/gamificationSlice";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getButtonClassName } from "../../components/common/Button";
import StudyGroupChatView from "../../components/studyGroups/StudyGroupChatView";
import MembersSection from "../../components/studyGroups/MembersSection";
import ResourcesSection from "../../components/studyGroups/ResourcesSection";
import {
  getStudyGroupTheme,
  studyGroupPageTitle,
  studyGroupSectionEyebrow,
} from "../../components/studyGroups/studyGroupTheme";
import LeaderboardTable from "../../components/gamification/LeaderboardTable";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudyGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);
  const gamificationLeaderboards = useSelector(selectGamificationLeaderboards);

  const group = useSelector(selectSelectedStudyGroup);
  const loading = useSelector(selectStudyGroupLoading);
  const actionLoading = useSelector(selectStudyGroupActionLoading);

  const [activeTab, setActiveTab] = useState("about");
  const [confirmState, setConfirmState] = useState({ isOpen: false });

  useEffect(() => {
    dispatch(fetchStudyGroupById(id));
    dispatch(fetchModuleLeaderboard("study_group"));
  }, [dispatch, id]);

  const isCoordinator = useMemo(
    () => group?.coordinatorId?._id === user?._id || group?.coordinatorId === user?._id,
    [group, user?._id]
  );

  const membership = useMemo(
    () => group?.groupMembers?.find((member) => (member.memberId?._id || member.memberId) === user?._id),
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
          } catch (err) {
            toast.error(err || "Failed to leave");
          } finally {
            setConfirmState({ isOpen: false });
          }
        },
      });
    } else if (!isPending) {
      try {
        const result = await dispatch(joinStudyGroupThunk(id)).unwrap();
        if (result.status === "pending") {
          toast.success("Request sent! Waiting for approval.");
        } else {
          toast.success("Joined successfully!");
          setActiveTab("discussion");
        }
      } catch (err) {
        toast.error(err || "Failed to join");
      }
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
        } catch (err) {
          toast.error(err || "Failed to delete");
        } finally {
          setConfirmState({ isOpen: false });
        }
      },
    });
  };

  if (loading && !group) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme.page}`}>
          <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className={`text-sm ${theme.muted}`}>Loading study group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center p-4 text-center ${theme.page}`}>
        <span className={`material-symbols-outlined mb-4 text-6xl ${theme.dangerText}`}>error</span>
        <h1 className={`text-3xl font-semibold ${theme.title}`}>Study Group Not Found</h1>
        <p className={`mt-2 text-sm ${theme.muted}`}>This group may have been deleted or archived.</p>
        <button
          onClick={() => navigate("/study-groups")}
          className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "mt-6" })}
        >
          Browse Groups
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "about", label: "About", icon: "info" },
    {
      id: "members",
      label: "Members",
      icon: "group",
      badge: group.groupMembers?.filter((member) => member.status === "pending").length,
    },
    { id: "discussion", label: "Discussion", icon: "forum", locked: !isMember },
    { id: "resources", label: "Resources", icon: "folder_open", locked: !isMember },
  ];

  const memberPct = group.maxMembers
    ? Math.round((group.memberCount / group.maxMembers) * 100)
    : 0;
  const pendingCount =
    group.groupMembers?.filter((member) => member.status === "pending").length || 0;

  return (
    <div className={`min-h-screen ${theme.page}`}>
      <div className={`border-b ${theme.hero}`}>
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/study-groups")}
            className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "mb-5 min-w-0 px-2" })}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to groups
          </button>

          <div className={`rounded-[32px] border p-6 sm:p-8 ${theme.surface}`}>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] border ${theme.accentSurface}`}>
                  <span className={`text-2xl font-semibold uppercase ${theme.iconAccent}`}>
                    {group.name?.substring(0, 2) || "??"}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className={`${studyGroupPageTitle} ${theme.title}`}>{group.name}</h1>
                    {group.isPrivate && (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${theme.dangerSurface} ${theme.dangerText}`}>
                        <span className="material-symbols-outlined text-[11px]">lock</span>
                        Private
                      </span>
                    )}
                    {group.requireJoinApproval && (
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${theme.warningSurface} ${theme.warningText}`}>
                        Approval Required
                      </span>
                    )}
                  </div>

                  <div className={`flex flex-wrap items-center gap-4 text-sm ${theme.muted}`}>
                    {group.subject && (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">school</span>
                        {group.subject}
                      </span>
                    )}
                    {group.course && (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">book</span>
                        {group.course}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">group</span>
                      {group.memberCount}/{group.maxMembers}
                    </span>
                  </div>

                  {group.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                            isDark
                            ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-primary/20 bg-primary/5 text-primary"
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isCoordinator ? (
                  <>
                    <button
                      onClick={() => navigate(`/study-groups/${id}/edit`)}
                      className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Manage
                    </button>
                    <button
                      onClick={handleDelete}
                      className={getButtonClassName({ variant: "danger", size: "md", isDark })}
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleJoinLeave}
                    disabled={actionLoading || isPending}
                    className={getButtonClassName({
                      variant: isMember ? "danger" : isPending ? "warning" : "primary",
                      size: "md",
                      isDark,
                    })}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isMember ? "logout" : isPending ? "hourglass_top" : "person_add"}
                    </span>
                    {isMember
                      ? "Leave"
                      : isPending
                        ? "Pending..."
                        : group.requireJoinApproval
                          ? "Request to Join"
                          : "Join Group"}
                  </button>
                )}
              </div>
            </div>

            <div className={`mt-8 flex flex-wrap gap-2 border-t pt-5 ${theme.border}`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.locked && setActiveTab(tab.id)}
                  className={getButtonClassName({
                    variant: activeTab === tab.id ? "primary" : tab.locked ? "ghost" : "secondary",
                    size: "sm",
                    isDark,
                    className: tab.locked ? "cursor-not-allowed opacity-60" : "",
                  })}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                  {tab.locked && <span className="material-symbols-outlined text-sm">lock</span>}
                  {tab.badge > 0 && isCoordinator && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${theme.dangerSurface} ${theme.dangerText}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "about" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className={`rounded-[28px] border p-6 ${theme.surface}`}>
                <p className={`${studyGroupSectionEyebrow} ${theme.muted}`}>About This Group</p>
                <p className={`mt-4 text-sm leading-7 ${theme.text}`}>
                  {group.description || "No description provided."}
                </p>
              </section>

              {group.schedule?.length > 0 && (
                <section className={`rounded-[28px] border p-6 ${theme.surface}`}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className={`material-symbols-outlined ${theme.iconAccent}`}>schedule</span>
                    <h2 className={`text-xl font-semibold ${theme.title}`}>Weekly Schedule</h2>
                  </div>
                  <div className="space-y-3">
                    {group.schedule.map((slot, index) => (
                      <div
                        key={index}
                        className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${theme.surfaceMuted}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${theme.title}`}>{DAYS[slot.day]}</span>
                          <span className={`text-sm ${theme.text}`}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {slot.recurring && (
                          <span className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium ${theme.surfaceSoft} ${theme.muted}`}>
                            Weekly
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!isMember && !isPending && (
                <section className={`rounded-[28px] border p-8 text-center ${theme.accentSurface}`}>
                  <span className={`material-symbols-outlined mb-4 block text-5xl ${theme.iconAccent}`}>groups</span>
                  <h3 className={`text-xl font-semibold ${theme.title}`}>Join to Unlock Discussion & Resources</h3>
                  <p className={`mx-auto mt-2 max-w-lg text-sm ${theme.muted}`}>
                    Members get access to the group chat, shared files, and the ongoing study workflow.
                  </p>
                  <button
                    onClick={handleJoinLeave}
                    disabled={actionLoading}
                    className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "mt-6" })}
                  >
                    {group.requireJoinApproval ? "Request to Join" : "Join Group"}
                  </button>
                </section>
              )}

              <LeaderboardTable rows={gamificationLeaderboards.module?.study_group || []} title="Top Group Contributors" dense />
            </div>

            <div className="space-y-5">
              <section className={`rounded-[28px] border p-5 ${theme.surface}`}>
                <p className={`${studyGroupSectionEyebrow} ${theme.muted}`}>Group Stats</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Members", value: group.memberCount, sub: `/ ${group.maxMembers} max` },
                    { label: "Resources", value: group.groupResources?.length || 0, sub: "files" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-2xl border p-4 text-center ${theme.surfaceMuted}`}>
                      <p className={`text-2xl font-semibold ${theme.title}`}>{stat.value}</p>
                      <p className={`mt-1 text-[11px] font-semibold uppercase ${theme.muted}`}>{stat.label}</p>
                      <p className={`text-[11px] ${theme.muted}`}>{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className={`mb-2 flex items-center justify-between text-xs ${theme.muted}`}>
                    <span>Capacity</span>
                    <span>{memberPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${memberPct >= 90 ? "bg-danger" : "bg-success"}`}
                      style={{ width: `${Math.min(memberPct, 100)}%` }}
                    />
                  </div>
                </div>
              </section>

              <section className={`rounded-[28px] border p-5 ${theme.surface}`}>
                <p className={`${studyGroupSectionEyebrow} ${theme.muted}`}>Coordinator</p>
                <div className="mt-4 flex items-center gap-3">
                  {group.coordinatorId?.profile?.avatar ? (
                    <img
                      src={group.coordinatorId.profile.avatar}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full border ${theme.accentSurface}`}>
                      <span className={`material-symbols-outlined text-lg ${theme.iconAccent}`}>person</span>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-medium ${theme.title}`}>
                      {group.coordinatorId?.profile?.displayName || "Unknown"}
                    </p>
                    <p className={`text-xs ${theme.warningText}`}>Group Leader</p>
                  </div>
                </div>
              </section>

              <section className={`rounded-[28px] border p-5 ${theme.surface}`}>
                <p className={`${studyGroupSectionEyebrow} ${theme.muted}`}>Joining Policy</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className={`material-symbols-outlined text-lg ${group.requireJoinApproval ? theme.warningText : theme.iconAccent}`}>
                    {group.requireJoinApproval ? "how_to_reg" : "door_open"}
                  </span>
                  <span className={`text-sm ${theme.text}`}>
                    {group.requireJoinApproval
                      ? "Requires coordinator approval"
                      : "Open - anyone can join"}
                  </span>
                </div>
              </section>

              {isCoordinator && pendingCount > 0 && (
                <button
                  onClick={() => setActiveTab("members")}
                  className={getButtonClassName({ variant: "danger", size: "md", isDark, className: "flex w-full justify-start px-4 text-left" })}
                >
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${theme.dangerText} bg-transparent`}>
                    {pendingCount}
                  </span>
                  <span className={`text-sm font-medium ${theme.dangerText}`}>Pending join requests</span>
                  <span className={`material-symbols-outlined ml-auto text-base ${theme.dangerText}`}>arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <MembersSection members={group.groupMembers} isCoordinator={isCoordinator} groupId={id} />
        )}

        {activeTab === "discussion" && isMember && (
          <div className={`overflow-hidden rounded-[28px] border ${theme.surface} min-h-[24rem] lg:h-[65vh]`}>
            <StudyGroupChatView chatId={group.chatId?._id || group.chatId} groupName={group.name} />
          </div>
        )}

        {activeTab === "resources" && isMember && (
          <ResourcesSection groupId={id} isCoordinator={isCoordinator} />
        )}

        {(activeTab === "discussion" || activeTab === "resources") && !isMember && (
          <div className={`rounded-[28px] border p-16 text-center ${theme.surface}`}>
            <span className={`material-symbols-outlined mb-4 block text-5xl ${theme.subtle}`}>lock</span>
            <h3 className={`text-xl font-semibold ${theme.title}`}>Members Only</h3>
            <p className={`mx-auto mt-2 max-w-lg text-sm ${theme.muted}`}>
              Join this group to access the {activeTab === "discussion" ? "group chat" : "shared resources"}.
            </p>
            <button
              onClick={handleJoinLeave}
              disabled={actionLoading || isPending}
              className={getButtonClassName({ variant: isPending ? "warning" : "primary", size: "md", isDark, className: "mt-6" })}
            >
              {isPending ? "Request Pending..." : "Join Group"}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal {...confirmState} onCancel={() => setConfirmState({ isOpen: false })} />
    </div>
  );
}
