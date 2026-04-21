import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllStudyGroups,
  fetchStudyGroups,
  selectStudyGroupLoading,
  selectStudyGroupError,
} from "../../redux/slices/studyGroupSlice";
import { useNavigation, useFilterSort } from "../../hooks";
import { useAuth } from "../../hooks/useAuth";
import GroupCard from "../../components/studyGroups/GroupCard";
import SortControls from "../../components/studyGroups/SortControls";
import CategoryFilter from "../../components/studyGroups/CategoryFilter";
import StatsCard from "../../components/studyGroups/StatsCard";
import PageHeader from "../../components/common/PageHeader";
import PageContent from "../../components/common/PageContent";

const CATEGORIES = [
  "all",
  "Computer Science",
  "Physics",
  "Mathematics",
  "Engineering",
  "Chemistry",
  "Psychology",
];

export default function StudyGroupsList() {
  const { goTo } = useNavigation();
  const dispatch = useDispatch();
  const { isAuthenticated, openAuth, user } = useAuth();
  
  const isAdmin = user?.roles?.includes("admin");

  const allGroups = useSelector(selectAllStudyGroups);
  const loading = useSelector(selectStudyGroupLoading);
  const error = useSelector(selectStudyGroupError);

  useEffect(() => {
    dispatch(fetchStudyGroups());
  }, [dispatch]);

  // Use filter and sort hook
  const {
    data: sortedGroups,
    filter,
    setFilter,
    sortBy,
    setSortBy,
  } = useFilterSort(allGroups, {
    initialFilter: "all",
    initialSortBy: "name",
    filterKey: "category",
  });

  const totalMembers = useMemo(
    () => allGroups.reduce((sum, g) => sum + (g.memberCount || 0), 0),
    [allGroups]
  );

  const averageMembers = useMemo(
    () => (allGroups.length > 0 ? Math.round(totalMembers / allGroups.length) : 0),
    [allGroups.length, totalMembers]
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title="Find a Study Group"
        subtitle="Team up with peers in your courses or interests"
        icon="groups"
        backPath="/dashboard"
        action={isAdmin ? (
          <button
            onClick={() => {
              if (!isAuthenticated) return openAuth();
              goTo("/study-groups/create");
            }}
            className="px-5 py-2.5 rounded-xl bg-[#238636] text-white text-sm font-bold hover:bg-[#2ea043] transition-all flex items-center gap-2 shadow-lg shadow-[#238636]/20"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Create Study Group
          </button>
        ) : null}
      />

      <PageContent>
        {/* Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#30363d]">
          <SortControls sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <CategoryFilter
            categories={CATEGORIES}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Study Groups Grid */}
        {sortedGroups.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#30363d] block mb-4">
              groups
            </span>
            <h3 className="text-xl font-semibold text-[#c9d1d9] mb-2">
              No study groups found
            </h3>
            <p className="text-[#8b949e]">
              Try changing your filters or create a new study group.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard value={allGroups.length} label="Total Groups" icon="groups" />
          <StatsCard
            value={totalMembers}
            label="Total Members"
            icon="person"
          />
          <StatsCard
            value={averageMembers}
            label="Avg Members/Group"
            icon="monitoring"
          />
        </div>
      </PageContent>
    </div>
  );
}
