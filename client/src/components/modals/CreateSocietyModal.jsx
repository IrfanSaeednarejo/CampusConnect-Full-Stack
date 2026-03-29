import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createNewSociety } from "../../redux/slices/societySlice";
import { useNavigate } from "react-router-dom";
import FormField from "@/components/common/FormField";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useAuth } from "@/contexts/AuthContext";
import { getAllCampuses } from "../../api/campusApi";

const CATEGORIES = [
  { label: "Academic", value: "academic" },
  { label: "Cultural", value: "cultural" },
  { label: "Sports", value: "sports" },
  { label: "Technology", value: "tech" },
  { label: "Social", value: "social" },
  { label: "Arts", value: "arts" },
  { label: "Professional", value: "professional" },
  { label: "Religious", value: "religious" },
  { label: "Volunteer", value: "volunteer" },
  { label: "Other", value: "other" },
];

const LOGO_OPTIONS = [
  "🚀", "💼", "🎤", "📚", "🎨", "⚽", "🔬", "🎭", "💻", "🌍",
];

export default function CreateSocietyModal({ closeModal }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [fetchingCampuses, setFetchingCampuses] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
    category: "tech",
    logo: "🚀",
    campusId: user?.campusId || user?.profile?.campusId || "",
  });

  // Fetch all available campuses on component mount
  React.useEffect(() => {
    const fetchCampuses = async () => {
      setFetchingCampuses(true);
      try {
        const response = await getAllCampuses();
        // Backend returns: { statusCode, data: { campuses: [], pagination: {} }, message, success }
        const campusesList = response.data?.campuses || response.data || response || [];
        setCampuses(Array.isArray(campusesList) ? campusesList : []);
        
        // If the user's campus is still missing after fetch,
        // and only one campus exists, default to it.
        if (!formData.campusId && Array.isArray(campusesList) && campusesList.length === 1) {
          setFormData(prev => ({ ...prev, campusId: campusesList[0]._id }));
        }
      } catch (err) {
        console.error("Failed to fetch campuses:", err);
        setCampuses([]);
      } finally {
        setFetchingCampuses(false);
      }
    };
    fetchCampuses();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) return;
    
    // Tag pre-validation
    const tag = formData.tag.trim();
    if (!tag) {
        showError("Society tag (acronym) is required.");
        return;
    }
    if (tag.length < 3) {
        showError("Tag must be at least 3 characters long (e.g., 'DSC').");
        return;
    }
    
    setLoading(true);
    try {
      // Ensure campusId is present
      if (!formData.campusId) {
        throw new Error("Campus selection is required to create a society.");
      }

      await dispatch(createNewSociety(formData)).unwrap();
      showSuccess("Society created successfully!");
      closeModal();
      navigate("/society/dashboard");
    } catch (err) {
      console.error("Failed to create society:", err);
      // Use the actual error message from the backend if available
      const errorMessage = typeof err === 'string' ? err : (err.message || 'Failed to create society');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={closeModal}
      />
      
      {/* Side-Drawer */}
      <div className="relative w-full max-w-xl bg-[#161b22] h-full shadow-2xl border-l border-[#30363d] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]/50">
          <div>
            <h2 className="text-xl font-bold text-white">Create New Society</h2>
            <p className="text-[#8b949e] text-sm">Start a new community on campus</p>
          </div>
          <button 
            onClick={closeModal}
            className="p-2 text-[#8b949e] hover:text-white rounded-full hover:bg-[#30363d] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section>
            <h3 className="text-[#1dc964] text-xs font-bold uppercase tracking-wider mb-4">Society Details</h3>
            
            <div className="space-y-5">
              <FormField
                label="Society Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Tech Innovators Club"
                required
                className="bg-[#0d1117] border-[#30363d]"
              />

              <FormField
                label="Society Tag (Acronym)"
                name="tag"
                type="text"
                value={formData.tag}
                onChange={handleChange}
                placeholder="e.g. TIC"
                required
                className="bg-[#0d1117] border-[#30363d]"
              />

              <FormField
                label="Category"
                name="category"
                type="select"
                value={formData.category}
                onChange={handleChange}
                required
                className="bg-[#0d1117] border-[#30363d]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </FormField>

              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your society's mission and activities"
                rows={4}
                required
                className="bg-[#0d1117] border-[#30363d] resize-none"
              />

              {/* Campus Selector - Only show if not automatically determined or multiple options exist */}
              {(!user?.campusId || campuses.length > 1) && (
                <FormField
                  label="Select Campus"
                  name="campusId"
                  type="select"
                  value={formData.campusId}
                  onChange={handleChange}
                  required
                  disabled={fetchingCampuses}
                  className="bg-[#0d1117] border-[#30363d]"
                >
                  <option value="">Select your university campus</option>
                  {campuses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </FormField>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[#1dc964] text-xs font-bold uppercase tracking-wider mb-4">Visual Identity</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#c9d1d9] mb-3">
                Choose an Icon Logo
              </label>
              <div className="grid grid-cols-5 gap-3">
                {LOGO_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: emoji })}
                    className={`p-3 text-3xl rounded-lg border transition-all hover:scale-110 ${
                      formData.logo === emoji
                        ? "border-[#1dc964] bg-[#1dc964]/20"
                        : "border-[#30363d] bg-[#0d1117] hover:border-[#1dc964]/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Preview */}
            <div className="pt-6 mt-6 border-t border-[#30363d]">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl">{formData.logo}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-lg truncate">
                      {formData.name || "Society Name"}
                    </h4>
                    <p className="text-[#8b949e] text-sm">
                      {formData.category}
                    </p>
                  </div>
                </div>
                <p className="text-[#c9d1d9] text-sm line-clamp-2">
                  {formData.description || "Society description will appear here..."}
                </p>
              </div>
            </div>
          </section>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#30363d] bg-[#0d1117]/50 flex gap-4">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-4 py-2 border border-[#30363d] text-white rounded-lg hover:bg-[#30363d] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="flex-[2] px-4 py-2 bg-[#1dc964] text-[#112118] rounded-lg hover:opacity-90 transition-opacity font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#112118] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-base">add_circle</span>
            )}
            {loading ? "Creating..." : "Create Society"}
          </button>
        </div>
      </div>
    </div>
  );
}
