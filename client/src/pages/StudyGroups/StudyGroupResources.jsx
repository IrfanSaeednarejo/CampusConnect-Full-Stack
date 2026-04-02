import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectStudyGroupById,
  selectGroupResources,
  setGroupResources,
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

  const group = useSelector(selectStudyGroupById(id));
  const resources = useSelector(selectGroupResources(id));

  useEffect(() => {
    if (resources.length === 0) {
      const mockResources = [
        {
          id: 1,
          name: "Week 1-5 Lecture Notes.pdf",
          type: "PDF",
          category: "Lectures",
          size: "2.4 MB",
          uploadedBy: "Sarah Johnson",
          uploadDate: "2024-02-10",
          downloads: 15,
        },
        {
          id: 2,
          name: "Practice Problems Set 1.pdf",
          type: "PDF",
          category: "Practice",
          size: "1.8 MB",
          uploadedBy: "Alex Chen",
          uploadDate: "2024-02-12",
          downloads: 12,
        },
        {
          id: 3,
          name: "Exam Tips and Strategies.docx",
          type: "Document",
          category: "Study Guides",
          size: "850 KB",
          uploadedBy: "Emma Wilson",
          uploadDate: "2024-02-14",
          downloads: 20,
        },
        {
          id: 4,
          name: "Pointers Tutorial Video.mp4",
          type: "Video",
          category: "Tutorials",
          size: "45 MB",
          uploadedBy: "Michael Brown",
          uploadDate: "2024-02-15",
          downloads: 8,
        },
        {
          id: 5,
          name: "Past Exam Papers 2020-2023.zip",
          type: "Archive",
          category: "Exams",
          size: "5.2 MB",
          uploadedBy: "Sarah Johnson",
          uploadDate: "2024-02-16",
          downloads: 25,
        },
      ];
      dispatch(setGroupResources({ groupId: id, resources: mockResources }));
    }
  }, [dispatch, id, resources.length]);

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
    () => resources.reduce((sum, r) => sum + r.downloads, 0),
    [resources]
  );

  const totalSize = useMemo(
    () =>
      (resources.reduce((sum, r) => sum + parseFloat(r.size), 0) / 1000).toFixed(
        1
      ),
    [resources]
  );

  const handleDownload = (resource) => {
    alert(`Downloading: ${resource.name}`);
    // Download logic here
  };

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
            <div className="divide-y divide-[#30363d]">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="bg-surface border border-border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {totalSize} MB
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Size</div>
          </div>
        </div>
      </main>
    </div>
  );
}
