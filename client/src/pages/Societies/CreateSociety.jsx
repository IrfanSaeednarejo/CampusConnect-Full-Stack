import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";

const CATEGORIES = [
  "Technology",
  "Business",
  "Arts",
  "Sports",
  "Science",
  "Culture",
  "Other",
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Technology",
    logo: "🚀",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Society created successfully!");
    navigate("/society/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#111714] text-white">
      {/* Header */}
      <header className="bg-[#1a241e] border-b border-[#29382f] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/society/dashboard")}
              className="flex items-center gap-2 text-[#9eb7a9] hover:text-white transition-colors"
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
                <p className="text-sm text-[#9eb7a9]">
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
          className="bg-[#1a241e] border border-[#29382f] rounded-lg p-8"
        >
          <div className="space-y-6">
            {/* Society Name */}
            <FormField
              label="Society Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter society name"
              required
            />

            {/* Description */}
            <FormField
              label="Description"
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
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </FormField>

            {/* Logo Selection */}
            <div>
              <label className="block text-sm font-medium text-[#9eb7a9] mb-2">
                Choose Logo
              </label>
              <div className="grid grid-cols-5 gap-3">
                {LOGO_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: emoji })}
                    className={`p-4 text-4xl rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.logo === emoji
                        ? "border-[#1dc964] bg-[#1dc964]/20"
                        : "border-[#29382f] hover:border-[#1dc964]/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-6 border-t border-[#29382f]">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="bg-[#111714] border border-[#29382f] rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{formData.logo}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg">
                      {formData.name || "Society Name"}
                    </h4>
                    <p className="text-[#9eb7a9] text-sm">
                      {formData.category}
                    </p>
                  </div>
                </div>
                <p className="text-[#9eb7a9] text-sm">
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
                submitText="Create Society"
                submitVariant="primary"
                className=""
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
