import ResourceCard from "./ResourceCard";

export default function ResourcesSection({ resources }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#c9d1d9]">Shared Resources</h2>
        <button className="px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-bold hover:bg-[#2ea043] transition-colors flex items-center gap-2">
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
