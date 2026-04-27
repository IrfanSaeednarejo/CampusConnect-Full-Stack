import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGroupResources, selectStudyGroupResourcesLoading, selectStudyGroupActionLoading,
  fetchResourcesThunk, addResourceThunk, removeResourceThunk,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { useRef, useState } from "react";

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
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourcesSection({ groupId, isCoordinator }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const resources = useSelector(selectGroupResources);
  const loading = useSelector(selectStudyGroupResourcesLoading);
  const actionLoading = useSelector(selectStudyGroupActionLoading);
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      {/* Upload Zone */}
      {(isCoordinator || true) && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${dragging ? "border-[#238636] bg-[#238636]/5" : "border-[#30363d] hover:border-[#238636]/40 hover:bg-[#238636]/3"}`}
        >
          <span className={`material-symbols-outlined text-4xl mb-3 block transition-colors ${dragging ? "text-[#238636]" : "text-[#8b949e]"}`}>
            {uploading ? "hourglass_top" : "cloud_upload"}
          </span>
          <p className="text-[#c9d1d9] font-bold text-sm">{uploading ? "Uploading…" : "Drop a file here or click to upload"}</p>
          <p className="text-[#8b949e] text-xs mt-1">PDF, DOC, PPT, Video, ZIP and more (Max 30MB)</p>
          <input ref={fileInputRef} type="file" hidden onChange={e => handleUpload(e.target.files[0])} />
        </div>
      )}

      {/* Resources List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-[#30363d] block mb-3">folder_open</span>
          <p className="text-[#8b949e] text-sm">No resources yet. Upload the first one!</p>
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
            <h3 className="text-white font-bold text-sm">{resources.length} Resources</h3>
          </div>
          <div className="divide-y divide-[#30363d]">
            {resources.map(r => {
              const fileUrl = r.fileId?.fileUrl || r.url;
              const fileName = r.fileId?.fileName || r.fileName;
              const fileSize = r.fileId?.fileSize || r.fileSize;
              const { icon, color } = getFileIcon(r.title || fileName || fileUrl);
              return (
                <div key={r._id || r.id} className="flex items-center gap-4 p-4 hover:bg-[#0d1117]/40 transition-colors group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#c9d1d9] text-sm font-medium truncate">{r.title || fileName || "Unnamed Resource"}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] mt-0.5">
                      {fileSize && <span>{formatSize(fileSize)}</span>}
                      {r.uploadedBy && <span>by {r.uploadedBy?.profile?.displayName || "Member"}</span>}
                      {r.createdAt && <span>{new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {fileUrl && (
                      <a href={fileUrl.replace("/upload/", "/upload/fl_attachment/")} target="_blank" rel="noreferrer" download={fileName}
                        className="p-1.5 rounded-lg bg-[#238636]/10 text-[#238636] hover:bg-[#238636]/20 transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </a>
                    )}
                    {isCoordinator && (
                      <button onClick={() => handleRemove(r._id || r.id)}
                        className="p-1.5 rounded-lg bg-[#f85149]/10 text-[#f85149] hover:bg-[#f85149]/20 transition-colors">
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
