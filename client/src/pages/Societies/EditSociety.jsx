import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectSocietyById, updateSociety } from "../../redux/slices/societySlice";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

const CATEGORIES = [
  "Technology",
  "Business",
  "Arts",
  "Sports",
  "Science",
  "Culture",
  "STEM",
  "Community",
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
  "⚡",
  "🤖",
  "📷",
  "🎯",
  "🌟",
];

export default function EditSociety() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const societyId = Number(id);
  const society = useSelector(selectSocietyById(societyId));
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Technology",
    logo: "🚀",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (society) {
      setFormData({
        name: society.name || "",
        description: society.description || "",
        category: society.category || "Technology",
        logo: society.logo || "🚀",
      });
    }
  }, [society]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);

    dispatch(
      updateSociety({
        id: societyId,
        ...formData,
      })
    );

    setTimeout(() => {
      alert("Society updated successfully!");
      setLoading(false);
      navigate(`/societies/${societyId}`);
    }, 600);
  };

  const handleCancel = () => {
    navigate("/society/dashboard");
  };

  if (!society) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
        <div className="flex items-center justify-center h-screen">
          <Card padding="p-12">
            <EmptyState
              icon="error"
              title="Society not found"
              description="The society you're trying to edit doesn't exist"
              action={
                <Button onClick={() => navigate("/society/dashboard")} variant="primary">
                  Back to Dashboard
                </Button>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-[#111714] text-white">
      {/* Header */}
      <SocietyPageHeader
        title="Edit Society"
        subtitle="Update your society information"
        icon="edit"
        backPath="/society/dashboard"
      />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Card padding="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              rows={6}
              required
              helpText={`${formData.description.length}/500 characters`}
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
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </FormField>

            {/* Logo Selection */}
            <div>
              <label className="block text-sm font-medium text-[#e6edf3] mb-3">
                Choose Logo
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                {LOGO_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: emoji })}
                    className={`aspect-square p-3 text-3xl rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.logo === emoji
                        ? "border-[#238636] bg-[#238636]/20 scale-105"
                        : "border-[#30363d] hover:border-[#238636]/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-6 border-t border-[#30363d]">
              <label className="block text-sm font-medium text-[#e6edf3] mb-3">
                Preview
              </label>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-[#238636]/20 flex items-center justify-center text-3xl">
                    {formData.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {formData.name || "Society Name"}
                    </h3>
                    <span className="px-2 py-1 bg-[#238636]/20 text-[#238636] text-xs rounded-full font-medium">
                      {formData.category}
                    </span>
                  </div>
                </div>
                <p className="text-[#8b949e] text-sm">
                  {formData.description || "Society description will appear here..."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <FormActions
              submitText="Save Changes"
              cancelText="Cancel"
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </form>
        </Card>
      </main>
    </div>
  );
}
