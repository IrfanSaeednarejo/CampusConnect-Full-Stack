import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStudyGroups,
  selectAllStudyGroups,
  selectStudyGroupLoading,
} from "../../redux/slices/studyGroupSlice";
import { useNavigation, useFilterSort } from "../../hooks";
import GroupCard from "../../components/studyGroups/GroupCard";
import SortControls from "../../components/studyGroups/SortControls";
import CategoryFilter from "../../components/studyGroups/CategoryFilter";
import StatsCard from "../../components/studyGroups/StatsCard";
import PageHeader from "../../components/common/PageHeader";

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

  const allGroups = useSelector(selectAllStudyGroups);
  const loading = useSelector(selectStudyGroupLoading);

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
    () => allGroups.reduce((sum, g) => sum + (g.memberCount || g.members?.length || 0), 0),
    [allGroups]
  );

  const averageMembers = useMemo(
    () => (allGroups.length > 0 ? Math.round(totalMembers / allGroups.length) : 0),
    [allGroups.length, totalMembers]
  );

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <PageHeader
        title="Find a Study Group"
        subtitle="Team up with peers in your courses or interests"
        icon="groups"
        backPath="/student/dashboard"
        sticky={true}
        action={
          <button
            onClick={() => goTo("/study-groups/create")}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Study Group
          </button>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
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
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#C7D2FE] block mb-4">
              groups
            </span>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No study groups found
            </h3>
            <p className="text-text-secondary">
              Try changing your filters or create a new study group.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGroups.map((group) => (
              <GroupCard key={group._id || group.id} group={group} />
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard value={allGroups.length} label="Total Groups" />
          <StatsCard
            value={totalMembers}
            label="Total Members"
          />
          <StatsCard
            value={averageMembers}
            label="Avg Members/Group"
          />
        </div>
      </main>
    </div>
  );
}
