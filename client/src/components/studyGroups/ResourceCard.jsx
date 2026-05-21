import useHomeTheme from "@/hooks/useHomeTheme";
import { getStudyGroupTheme } from "./studyGroupTheme";

export default function ResourceCard({ resource }) {
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);
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
    if (mimeType?.includes("pdf")) return isDark ? "text-red-400" : "text-rose-600";
    if (mimeType?.includes("image")) return isDark ? "text-green-400" : "text-emerald-600";
    if (mimeType?.includes("word") || mimeType?.includes("text")) return isDark ? "text-blue-400" : "text-sky-600";
    return isDark ? "text-gray-400" : "text-slate-500";
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleDownload = () => {
    if (fileData.fileUrl) {
      window.open(fileData.fileUrl, "_blank");
    }
  };

  return (
    <div className={`group flex items-center justify-between gap-4 p-4 transition ${theme.hoverSurface}`}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className={`material-symbols-outlined text-3xl ${getTypeColor(fileData.mimeType)}`}>
          {getFileIcon(fileData.mimeType)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-sm font-medium transition ${theme.title}`}>
            {resource.title || fileData.fileName}
          </h3>
          <div className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${theme.muted}`}>
            <span>{formatSize(fileData.fileSize)}</span>
            <span className={theme.subtle}>•</span>
            <span>{uploader}</span>
            <span className={theme.subtle}>•</span>
            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className={`rounded-xl border p-2 transition ${theme.buttonSecondary}`}
        title="Download File"
      >
        <span className="material-symbols-outlined text-xl">download</span>
      </button>
    </div>
  );
}
