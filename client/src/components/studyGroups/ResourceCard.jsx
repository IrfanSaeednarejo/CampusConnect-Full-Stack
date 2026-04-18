export default function ResourceCard({ resource }) {
  const fileData = resource.fileId || {};
  const uploader = resource.uploadedBy?.profile?.displayName || "Unknown User";
  
  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) return "description";
    if (mimeType?.includes("image")) return "image";
    if (mimeType?.includes("word") || mimeType?.includes("text")) return "article";
    if (mimeType?.includes("zip") || mimeType?.includes("rar")) return "folder_zip";
    return "insert_drive_file";
  };

  const getTypeColor = (mimeType) => {
    if (mimeType?.includes("pdf")) return "text-red-400";
    if (mimeType?.includes("image")) return "text-green-400";
    if (mimeType?.includes("word") || mimeType?.includes("text")) return "text-blue-400";
    return "text-gray-400";
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = () => {
    if (fileData.fileUrl) {
      window.open(fileData.fileUrl, "_blank");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#1c2128] border border-[#30363d] rounded-lg hover:border-[#238636]/50 transition-all group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span
          className={`material-symbols-outlined text-3xl ${getTypeColor(
            fileData.mimeType,
          )}`}
        >
          {getFileIcon(fileData.mimeType)}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#c9d1d9] truncate group-hover:text-[#238636] transition-colors">
            {resource.title || fileData.fileName}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-[#8b949e] uppercase tracking-wider font-semibold">
            <span>{formatSize(fileData.fileSize)}</span>
            <span className="text-[#30363d]">•</span>
            <span>{uploader}</span>
            <span className="text-[#30363d]">•</span>
            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={handleDownload}
          className="p-2 rounded-lg bg-[#21262d] text-[#c9d1d9] hover:bg-[#238636] hover:text-white transition-all border border-[#30363d]"
          title="Download File"
        >
          <span className="material-symbols-outlined text-xl">download</span>
        </button>
      </div>
    </div>
  );
}
