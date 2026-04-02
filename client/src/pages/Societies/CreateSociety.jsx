import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createNewSociety } from "@/redux/slices/societySlice";
import { useNotification } from "@/contexts/NotificationContext";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";

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
  "🚀",
  "💼",
  "🎤",
  "📚",
  "🎨",
  "⚽",
  "🔬",
  "🎭",
  "💻",
  "🌍",
];

export default function CreateSociety() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
    category: "tech",
    logo: "🚀",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tag.trim()) return;

    setLoading(true);
    try {
      // Dispatch the action to create the society on the backend
      await dispatch(createNewSociety(formData)).unwrap();
      showSuccess("Society created successfully!");
      navigate("/society/dashboard");
    } catch (err) {
      console.error(err);
      showError(err?.message || "Failed to create society.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/society/dashboard")}
              className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                arrow_back
              </span>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-[#1dc964]">
                add_circle
              </span>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Create New Society
                </h1>
                <p className="text-sm text-text-secondary">
                  Start a new community on campus
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-lg p-8"
        >
          <div className="space-y-6">
            {/* Society Name */}
            <FormField
              label="Society Name *"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Computer Science Society"
              required
            />

            {/* Tag / Acronym */}
            <FormField
              label="Society Tag / Acronym (Unique) *"
              name="tag"
              type="text"
              value={formData.tag}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
              placeholder="e.g. CSS"
              required
            />

            {/* Description */}
            <FormField
              label="Description *"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your society's mission and activities"
              rows={5}
              required
            />

            {/* Category */}
            <FormField
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </FormField>

            {/* Logo Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Choose Emoji Icon
              </label>
              <div className="grid grid-cols-5 gap-3">
                {LOGO_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: emoji })}
                    className={`p-4 text-4xl rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.logo === emoji
                        ? "border-[#1dc964] bg-primary/20"
                        : "border-border hover:border-[#1dc964]/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{formData.logo}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg">
                      {formData.name || "Society Name"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-primary/20 text-[#1dc964] text-xs font-bold rounded">
                        {formData.tag?.toUpperCase() || "TAG"}
                      </span>
                      <p className="text-text-secondary text-sm">
                        {formData.category}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-text-secondary text-sm break-words line-clamp-2">
                  {formData.description ||
                    "Society description will appear here..."}
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-6">
              <FormActions
                onCancel={() => navigate("/society/dashboard")}
                onSubmit={handleSubmit}
                cancelText="Cancel"
                submitText={loading ? "Creating..." : "Create Society"}
                submitVariant="primary"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
