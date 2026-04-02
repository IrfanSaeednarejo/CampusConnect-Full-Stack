import ResourceCard from "./ResourceCard";

export default function ResourcesSection({ resources }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary">Shared Resources</h2>
        <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">upload</span>
          Upload
        </button>
      </div>
      <div className="space-y-3">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
