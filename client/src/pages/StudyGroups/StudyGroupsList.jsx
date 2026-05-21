import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  selectAllStudyGroups,
  fetchStudyGroups,
  fetchMyStudyGroups,
  selectStudyGroupLoading,
  selectStudyGroupError,
  selectMyStudyGroups,
  selectStudyGroupPagination,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import {
  getStudyGroupTheme,
  studyGroupCardTitle,
  studyGroupPageTitle,
  studyGroupSectionEyebrow,
} from "../../components/studyGroups/studyGroupTheme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function GroupCard({ group, onNavigate, theme, isDark }) {
  const memberPct = group.maxMembers
    ? Math.round((group.memberCount / group.maxMembers) * 100)
    : 0;
  const isFull = group.maxMembers ? group.memberCount >= group.maxMembers : false;

  return (
    <div
      onClick={() => onNavigate(`/study-groups/${group._id}`)}
      className={`group flex cursor-pointer flex-col gap-4 rounded-[28px] border p-5 transition duration-200 hover:-translate-y-0.5 ${theme.surface} ${
        isDark ? "hover:border-primary/35 hover:bg-surface-muted-dark" : "hover:border-slate-300 hover:bg-surface-muted-light"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${theme.accentSurface}`}>
          <span className={`text-sm font-semibold uppercase ${theme.iconAccent}`}>
            {group.name?.substring(0, 2) || "??"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`${studyGroupCardTitle} truncate ${theme.title}`}>{group.name}</h3>
            {group.isPrivate && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${theme.dangerSurface} ${theme.dangerText}`}>
                <span className="material-symbols-outlined text-[11px]">lock</span>
                Private
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm ${theme.muted}`}>{group.subject || "General Study"}</p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
            isFull
              ? `${theme.dangerSurface} ${theme.dangerText}`
              : `${theme.accentSurface} ${theme.iconAccent}`
          }`}
        >
          {isFull ? "Full" : "Open"}
        </span>
      </div>

      {group.description && (
        <p className={`line-clamp-2 text-sm leading-6 ${theme.muted}`}>{group.description}</p>
      )}

      {group.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {group.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                isDark
                  ? "border-info/25 bg-info/10 text-info"
                  : "border-sky-200 bg-sky-50 text-sky-700"
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {group.schedule?.length > 0 && (
        <div className={`flex items-center gap-2 text-sm ${theme.muted}`}>
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>
            {group.schedule.map((slot) => DAYS[slot.day]).join(", ")} - {group.schedule[0]?.startTime}
          </span>
        </div>
      )}

      <div className={`mt-auto flex items-center justify-between border-t pt-4 ${theme.border}`}>
        <div className={`flex items-center gap-2 text-sm ${theme.muted}`}>
          <span className="material-symbols-outlined text-base">group</span>
          <span>
            {group.memberCount}/{group.maxMembers} members
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-16 overflow-hidden rounded-full ${isDark ? "bg-border-dark" : "bg-slate-200"}`}>
            <div
              className={`h-full rounded-full ${isFull ? "bg-danger" : isDark ? "bg-primary" : "bg-slate-900"}`}
              style={{ width: `${Math.min(memberPct, 100)}%` }}
            />
          </div>
          <span className={`text-xs ${theme.muted}`}>{memberPct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function StudyGroupsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

  const allGroups = useSelector(selectAllStudyGroups);
  const myGroups = useSelector(selectMyStudyGroups);
  const loading = useSelector(selectStudyGroupLoading);
  const error = useSelector(selectStudyGroupError);
  const pagination = useSelector(selectStudyGroupPagination);

  const isAdmin = user?.roles?.includes("admin");

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchStudyGroups());
    if (isAuthenticated) {
      dispatch(fetchMyStudyGroups());
    }
  }, [dispatch, isAuthenticated]);

  const subjects = useMemo(() => {
    const all = allGroups.map((group) => group.subject).filter(Boolean);
    return ["all", ...new Set(all)];
  }, [allGroups]);

  const displayGroups = useMemo(() => {
    let base = tab === "mine" ? myGroups : allGroups;

    if (search.trim()) {
      const query = search.toLowerCase();
      base = base.filter(
        (group) =>
          group.name?.toLowerCase().includes(query) ||
          group.subject?.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query) ||
          group.tags?.some((tag) => tag.includes(query))
      );
    }

    if (subjectFilter !== "all") {
      base = base.filter((group) => group.subject === subjectFilter);
    }

    return base;
  }, [tab, allGroups, myGroups, search, subjectFilter]);

  const stats = useMemo(
    () => ({
      total: allGroups.length,
      totalMembers: allGroups.reduce((sum, group) => sum + (group.memberCount || 0), 0),
      open: allGroups.filter((group) => !group.isFull && group.memberCount < group.maxMembers).length,
    }),
    [allGroups]
  );

  return (
    <div className={`min-h-screen ${theme.page}`}>
      <div className={`border-b ${theme.hero}`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className={`rounded-[32px] border p-6 sm:p-8 ${theme.surface}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${theme.surfaceMuted} ${theme.muted}`}>
                  Peer learning hub
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-3xl border ${theme.accentSurface}`}>
                    <span className={`material-symbols-outlined text-[26px] ${theme.iconAccent}`}>groups</span>
                  </div>
                  <div>
                    <h1 className={`${studyGroupPageTitle} ${theme.title}`}>Study Groups</h1>
                    <p className={`mt-2 max-w-2xl text-sm sm:text-base ${theme.muted}`}>
                      Explore collaborative circles, find members working on the same material, and stay on top of shared schedules and resources.
                    </p>
                  </div>
                </div>
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => navigate("/study-groups/create")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${theme.buttonPrimary}`}
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  {isAdmin ? "Create Group" : "Request a Group"}
                </button>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Active Groups", value: stats.total, icon: "groups" },
                { label: "Total Members", value: stats.totalMembers, icon: "person" },
                { label: "Open to Join", value: stats.open, icon: "door_open" },
                { label: "My Groups", value: myGroups.length, icon: "bookmark" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-[24px] border p-4 ${theme.surfaceMuted}`}>
                  <div className="flex items-center justify-between">
                    <span className={`material-symbols-outlined text-xl ${theme.iconAccent}`}>{stat.icon}</span>
                    <p className={`${studyGroupSectionEyebrow} ${theme.muted}`}>{stat.label}</p>
                  </div>
                  <p className={`mt-4 text-2xl font-semibold ${theme.title}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`mb-6 rounded-[28px] border p-4 sm:p-5 ${theme.surface}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className={`inline-flex w-fit rounded-2xl border p-1 ${theme.surfaceMuted}`}>
              {[
                ["all", "All Groups"],
                ["mine", "My Groups"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    tab === key ? theme.tabActive : theme.tabIdle
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:w-[520px]">
              <div className="relative flex-1">
                <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base ${theme.muted}`}>
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search groups by name, topic, or tag"
                  className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm transition focus:outline-none ${theme.input}`}
                />
              </div>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className={`rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input} sm:w-48`}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === "all" ? "All Subjects" : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && displayGroups.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`h-56 animate-pulse rounded-[28px] border ${theme.surface}`} />
            ))}
          </div>
        ) : error ? (
          <div className={`rounded-[28px] border p-12 text-center ${theme.dangerSurface}`}>
            <span className={`material-symbols-outlined mb-3 block text-5xl ${theme.dangerText}`}>error</span>
            <p className={`text-sm font-medium ${theme.dangerText}`}>{error}</p>
          </div>
        ) : displayGroups.length === 0 ? (
          <div className={`rounded-[28px] border p-12 text-center ${theme.surface}`}>
            <span className={`material-symbols-outlined mb-4 block text-6xl ${theme.subtle}`}>groups</span>
            <h3 className={`text-xl font-semibold ${theme.title}`}>No study groups found</h3>
            <p className={`mx-auto mt-2 max-w-md text-sm ${theme.muted}`}>
              {tab === "mine"
                ? "You have not joined any study groups yet."
                : "Try adjusting your search or start a new group for your campus."}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/study-groups/create")}
                className={`mt-6 rounded-2xl px-5 py-3 text-sm font-medium transition ${theme.buttonPrimary}`}
              >
                {isAdmin ? "Create Group" : "Request a Group"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {displayGroups.map((group) => (
              <GroupCard
                key={group._id || group.id}
                group={group}
                onNavigate={navigate}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <p className={`mt-8 text-center text-sm ${theme.muted}`}>
            Showing {displayGroups.length} of {pagination.total} groups
          </p>
        )}
      </div>
    </div>
  );
}
