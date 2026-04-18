import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllStudyGroups,
  fetchStudyGroups,
  selectStudyGroupLoading,
  selectStudyGroupError,
} from "../../redux/slices/studyGroupSlice";
import { useNavigation, useFilterSort } from "../../hooks";
import GroupCard from "../../components/studyGroups/GroupCard";
import SortControls from "../../components/studyGroups/SortControls";
import CategoryFilter from "../../components/studyGroups/CategoryFilter";
import StatsCard from "../../components/studyGroups/StatsCard";

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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => goTo("/student/dashboard")}
                className="flex items-center gap-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  arrow_back
                </span>
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-[#238636]">
                  groups
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-[#c9d1d9]">
                    Find a Study Group
                  </h1>
                  <p className="text-sm text-[#8b949e]">
                    Team up with peers in your courses or interests
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => goTo("/study-groups/create")}
              className="px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-bold hover:bg-[#2ea043] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Create Study Group
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
