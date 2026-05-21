import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  selectStudyGroupById,
  selectGroupResources,
  setGroupResources,
} from "../../redux/slices/studyGroupSlice";
import { useFilterSort, useNavigation } from "../../hooks";
import FilterBar from "../../components/studyGroups/FilterBar";
import ResourceCard from "../../components/studyGroups/ResourceCard";
import EmptyState from "../../components/common/EmptyState";
import {
  getStudyGroupTheme,
  studyGroupPageTitle,
} from "../../components/studyGroups/studyGroupTheme";

const CATEGORIES = ["all", "Lectures", "Practice", "Study Guides", "Tutorials", "Exams"];

export default function StudyGroupResources() {
  const { goTo } = useNavigation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

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

  const {
    data: filteredResources,
    filter: activeCategory,
    setFilter: setActiveCategory,
  } = useFilterSort(resources, {
    initialFilter: "all",
    filterKey: "category",
  });

  const totalDownloads = useMemo(
    () => resources.reduce((sum, resource) => sum + resource.downloads, 0),
    [resources]
  );

  const totalSize = useMemo(
    () => (resources.reduce((sum, resource) => sum + parseFloat(resource.size), 0) / 1000).toFixed(1),
    [resources]
  );

  const handleDownload = (resource) => {
    alert(`Downloading: ${resource.name}`);
  };

  if (!group) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme.page}`}>
        <p className={theme.muted}>Study group not found.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.page}`}>
      <div className={`border-b ${theme.hero}`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => goTo(`/study-groups/${id}`)}
            className={`mb-5 flex items-center gap-2 text-sm font-medium transition-colors ${theme.muted} ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to group
          </button>

          <div className={`rounded-[32px] border p-6 sm:p-8 ${theme.surface}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-3xl border ${theme.accentSurface}`}>
                  <span className={`material-symbols-outlined text-[26px] ${theme.iconAccent}`}>folder_open</span>
                </div>
                <div>
                  <h1 className={`${studyGroupPageTitle} ${theme.title}`}>Study Resources</h1>
                  <p className={`mt-2 text-sm sm:text-base ${theme.muted}`}>{group.name}</p>
                </div>
              </div>

              <button
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${theme.buttonPrimary}`}
              >
                <span className="material-symbols-outlined text-lg">upload</span>
                Upload Resource
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FilterBar
          filters={CATEGORIES.map((category) => ({
            value: category,
            label: category === "all" ? "All Resources" : category,
          }))}
          activeFilter={activeCategory}
          onFilterChange={setActiveCategory}
        />

        <div className={`rounded-[28px] border overflow-hidden ${theme.surface}`}>
          {filteredResources.length === 0 ? (
            <EmptyState
              icon="folder_open"
              title="No resources found"
              description="Try changing your filter or upload a new resource."
            />
          ) : (
            <div className={`divide-y ${theme.divider}`}>
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

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Resources", value: resources.length },
            { label: "Total Downloads", value: totalDownloads },
            { label: "Total Size", value: `${totalSize} MB` },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-[24px] border p-5 text-center ${theme.surface}`}>
              <div className={`text-3xl font-semibold ${theme.title}`}>{stat.value}</div>
              <div className={`mt-2 text-sm ${theme.muted}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
