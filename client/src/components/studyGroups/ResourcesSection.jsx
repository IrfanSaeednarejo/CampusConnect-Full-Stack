import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { addResourceThunk, selectStudyGroupActionLoading } from "../../redux/slices/studyGroupSlice";
import { useNotification } from "../../contexts/NotificationContext";
import ResourceCard from "./ResourceCard";

export default function ResourcesSection({ resources }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useNotification();
  const isUploading = useSelector(selectStudyGroupActionLoading);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resource", file);
    formData.append("title", file.name);

    try {
      await dispatch(addResourceThunk({ id, formData })).unwrap();
      showSuccess("Resource uploaded successfully!");
    } catch (err) {
      showError(err || "Failed to upload resource");
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#c9d1d9]">Shared Resources</h2>
          <p className="text-xs text-[#8b949e] mt-1">Files shared by members of this group</p>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.png"
        />
        
        <button 
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
          className="px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-bold hover:bg-[#2ea043] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg">
            {isUploading ? "sync" : "upload"}
          </span>
          {isUploading ? "Uploading..." : "Upload Resource"}
        </button>
      </div>

      <div className="space-y-3">
        {resources.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-[#30363d] rounded-lg text-center">
            <span className="material-symbols-outlined text-4xl text-[#30363d] mb-2">file_present</span>
            <p className="text-[#8b949e] text-sm italic">No resources shared yet</p>
          </div>
        ) : (
          resources.map((resource) => (
            <ResourceCard key={resource._id || resource.id} resource={resource} />
          ))
        )}
      </div>
    </div>
  );
}
