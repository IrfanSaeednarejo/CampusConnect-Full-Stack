import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  selectGroupResources,
  selectStudyGroupResourcesLoading,
  selectStudyGroupActionLoading,
  fetchResourcesThunk,
  addResourceThunk,
  removeResourceThunk,
} from "../../redux/slices/studyGroupSlice";
import { getStudyGroupTheme } from "./studyGroupTheme";

const FILE_ICONS = {
  pdf: { icon: "picture_as_pdf", color: "#f85149" },
  doc: { icon: "description", color: "#58a6ff" },
  docx: { icon: "description", color: "#58a6ff" },
  ppt: { icon: "slideshow", color: "#e3b341" },
  pptx: { icon: "slideshow", color: "#e3b341" },
  xls: { icon: "table_chart", color: "#238636" },
  xlsx: { icon: "table_chart", color: "#238636" },
  mp4: { icon: "videocam", color: "#a371f7" },
  mp3: { icon: "audio_file", color: "#a371f7" },
  zip: { icon: "folder_zip", color: "#e3b341" },
  default: { icon: "insert_drive_file", color: "#8b949e" },
};

function getFileIcon(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function formatSize(bytes) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourcesSection({ groupId, isCoordinator }) {
  const dispatch = useDispatch();
  const resources = useSelector(selectGroupResources);
  const loading = useSelector(selectStudyGroupResourcesLoading);
  const actionLoading = useSelector(selectStudyGroupActionLoading);
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

  useEffect(() => {
    if (groupId) dispatch(fetchResourcesThunk(groupId));
  }, [dispatch, groupId]);

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    setUploading(true);
    try {
      await dispatch(addResourceThunk({ id: groupId, formData })).unwrap();
      toast.success("Resource uploaded!");
    } catch (err) {
      toast.error(err || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (resourceId) => {
    if (!confirm("Remove this resource?")) return;
    try {
      await dispatch(removeResourceThunk({ groupId, resourceId })).unwrap();
      toast.success("Resource removed");
    } catch (err) {
      toast.error(err || "Failed to remove");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-5">
      {(isCoordinator || true) && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          className={`cursor-pointer rounded-[28px] border-2 border-dashed p-8 text-center transition ${
            dragging ? theme.accentSurface : `${theme.surface} ${isDark ? "hover:border-[#3fb950]/35" : "hover:border-slate-300"}`
          }`}
        >
          <span className={`material-symbols-outlined mb-3 block text-4xl ${dragging ? theme.iconAccent : theme.muted}`}>
            {uploading ? "hourglass_top" : "cloud_upload"}
          </span>
          <p className={`text-sm font-medium ${theme.title}`}>
            {uploading ? "Uploading..." : "Drop a file here or click to upload"}
          </p>
          <p className={`mt-1 text-xs ${theme.muted}`}>PDF, DOC, PPT, Video, ZIP and more (Max 30MB)</p>
          <input ref={fileInputRef} type="file" hidden onChange={(e) => handleUpload(e.target.files[0])} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className={`h-16 animate-pulse rounded-2xl border ${theme.surface}`} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className={`rounded-[28px] border p-12 text-center ${theme.surface}`}>
          <span className={`material-symbols-outlined mb-3 block text-5xl ${theme.subtle}`}>folder_open</span>
          <p className={`text-sm ${theme.muted}`}>No resources yet. Upload the first one!</p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-[28px] border ${theme.surface}`}>
          <div className={`flex items-center justify-between border-b p-4 ${theme.border}`}>
            <h3 className={`text-sm font-medium ${theme.title}`}>{resources.length} Resources</h3>
          </div>
          <div className={`divide-y ${theme.divider}`}>
            {resources.map((resource) => {
              const fileUrl = resource.fileId?.fileUrl || resource.url;
              const fileName = resource.fileId?.fileName || resource.fileName;
              const fileSize = resource.fileId?.fileSize || resource.fileSize;
              const { icon, color } = getFileIcon(resource.title || fileName || fileUrl);

              return (
                <div key={resource._id || resource.id} className={`group flex items-center gap-4 p-4 transition ${theme.hoverSurface}`}>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ color }}>
                      {icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${theme.title}`}>
                      {resource.title || fileName || "Unnamed Resource"}
                    </p>
                    <div className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${theme.muted}`}>
                      {fileSize && <span>{formatSize(fileSize)}</span>}
                      {resource.uploadedBy && (
                        <span>by {resource.uploadedBy?.profile?.displayName || "Member"}</span>
                      )}
                      {resource.createdAt && (
                        <span>
                          {new Date(resource.createdAt).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                    {fileUrl && (
                      <a
                        href={fileUrl.replace("/upload/", "/upload/fl_attachment/")}
                        target="_blank"
                        rel="noreferrer"
                        download={fileName}
                        className={`rounded-xl border p-2 transition ${theme.buttonSecondary}`}
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                      </a>
                    )}
                    {isCoordinator && (
                      <button
                        onClick={() => handleRemove(resource._id || resource.id)}
                        className={`rounded-xl border p-2 transition disabled:opacity-50 ${theme.buttonDanger}`}
                        disabled={actionLoading}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
