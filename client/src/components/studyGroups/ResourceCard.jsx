export default function ResourceCard({ resource, onDownload }) {
  const getFileIcon = (type) => {
    switch (type) {
      case "PDF":
        return "description";
      case "Document":
        return "article";
      case "Video":
        return "play_circle";
      case "Archive":
        return "folder_zip";
      default:
        return "insert_drive_file";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "PDF":
        return "text-red-400";
      case "Document":
        return "text-blue-400";
      case "Video":
        return "text-purple-400";
      case "Archive":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#0d1117] transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <span
          className={`material-symbols-outlined text-2xl ${getTypeColor(
            resource.type,
          )}`}
        >
          {getFileIcon(resource.type)}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#c9d1d9] truncate">
            {resource.name}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-xs text-[#8b949e]">
            <span>{resource.size}</span>
            <span>•</span>
            <span>By {resource.uploadedBy}</span>
            <span>•</span>
            <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <div className="text-sm font-medium text-[#c9d1d9]">
            {resource.downloads}
          </div>
          <div className="text-xs text-[#8b949e]">downloads</div>
        </div>
        <button
          onClick={() => onDownload(resource)}
          className="px-3 py-2 rounded bg-[#238636] text-white text-sm font-medium hover:bg-[#2ea043] transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">download</span>
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  );
}
