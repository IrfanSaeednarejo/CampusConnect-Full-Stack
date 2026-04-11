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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeModal}
      />

      {/* Centered Modal */}
      <div className="relative w-full max-w-2xl bg-surface/95 backdrop-blur-xl max-h-full sm:max-h-[90vh] shadow-2xl border border-border/50 rounded-2xl flex flex-col animate-in zoom-in-95 duration-300 ease-out overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-surface/50">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Create New Society</h2>
            <p className="text-text-secondary text-sm mt-1">Start a new community on campus</p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section>
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span> Society Details
            </h3>

            <div className="space-y-5">
              <FormField
                label="Society Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Tech Innovators Club"
                required
                className="bg-background border-border"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Society Tag (Acronym)"
                  name="tag"
                  type="text"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="e.g. TIC"
                  required
                  className="bg-background border-border"
                />

                <FormField
                  label="Category"
                  name="category"
                  type="select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </FormField>
              </div>

              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your society's mission and activities"
                rows={4}
                required
                className="bg-background border-border resize-none"
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
                  className="bg-background border-border"
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
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[18px]">palette</span> Visual Identity
            </h3>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Choose an Icon Logo
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {LOGO_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: emoji })}
                    className={`p-2 text-2xl sm:text-3xl rounded-xl border transition-all hover:scale-110 ${formData.logo === emoji
                        ? "border-primary bg-primary/10 shadow-sm shadow-primary/20 scale-105"
                        : "border-border bg-background hover:border-primary/50"
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-6 mt-6 border-t border-border/50">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-text-secondary">visibility</span> Preview
              </h3>
              <div className="bg-background border border-border/50 rounded-xl p-5 shadow-inner">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center text-4xl shadow-sm">
                    {formData.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-text-primary font-bold text-lg truncate">
                      {formData.name || "Society Name"}
                    </h4>
                    <p className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/15 text-primary">
                      {formData.category}
                    </p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm line-clamp-2 italic">
                  {formData.description || "Society description will appear here..."}
                </p>
              </div>
            </div>
          </section>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/50 bg-surface/50 flex gap-3 justify-end rounded-b-2xl">
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2.5 border border-border text-text-secondary rounded-lg hover:bg-surface-hover hover:text-text-primary transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            )}
            {loading ? "Creating..." : "Create Society"}
          </button>
        </div>
      </div>
    </div>
  );
}
