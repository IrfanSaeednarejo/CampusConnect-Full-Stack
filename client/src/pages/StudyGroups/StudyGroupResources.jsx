import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudyGroupById,
  fetchGroupResources,
  selectSelectedGroup,
  selectGroupResources,
  selectStudyGroupLoading,
} from "../../redux/slices/studyGroupSlice";
import { useFilterSort, useNavigation } from "../../hooks";
import PageHeader from "../../components/common/PageHeader";
import FilterBar from "../../components/studyGroups/FilterBar";
import ResourceCard from "../../components/studyGroups/ResourceCard";
import EmptyState from "../../components/common/EmptyState";

const CATEGORIES = [
  "all",
  "Lectures",
  "Practice",
  "Study Guides",
  "Tutorials",
  "Exams",
];

export default function StudyGroupResources() {
  const { goTo } = useNavigation();
  const dispatch = useDispatch();
  const { id } = useParams();

  const group = useSelector(selectSelectedGroup);
  const resources = useSelector(selectGroupResources(id));
  const loading = useSelector(selectStudyGroupLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudyGroupById(id));
      dispatch(fetchGroupResources(id));
    }
  }, [dispatch, id]);

  // Use filter hook
  const {
    data: filteredResources,
    filter: activeCategory,
    setFilter: setActiveCategory,
  } = useFilterSort(resources, {
    initialFilter: "all",
    filterKey: "category",
  });

  const totalDownloads = useMemo(
    () => resources.reduce((sum, r) => sum + (r.downloads || 0), 0),
    [resources]
  );

  const handleDownload = (resource) => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    } else {
      alert(`Downloading: ${resource.name || resource.title}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading resources...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <p className="text-text-secondary">Study group not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <PageHeader
        title="Study Resources"
        subtitle={group.name}
        icon="folder_open"
        backPath={`/study-groups/${id}`}
        action={
          <button className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">upload</span>
            Upload Resource
          </button>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <FilterBar
          filters={CATEGORIES.map((cat) => ({
            value: cat,
            label: cat === "all" ? "All Resources" : cat,
          }))}
          activeFilter={activeCategory}
          onFilterChange={setActiveCategory}
        />

        {/* Resources List */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {filteredResources.length === 0 ? (
            <EmptyState
              icon="folder_open"
              title="No resources found"
              description="Try changing your filter or upload a new resource."
            />
          ) : (
            <div className="divide-y divide-[#C7D2FE]">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource._id || resource.id}
                  resource={resource}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {resources.length}
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Resources</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {totalDownloads}
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Downloads</div>
          </div>
        </div>
      </main>
    </div>
  );
}
