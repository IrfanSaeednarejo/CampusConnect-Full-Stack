import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import { createSocietyThunk, selectSocietyLoading, selectSocietyError } from "@/redux/slices/societySlice";

const CATEGORIES = [
  "Technology",
  "Business",
  "Arts",
  "Sports",
  "Science",
  "Culture",
  "Other",
];

export default function CreateSociety() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectSocietyLoading);
  const error = useSelector(selectSocietyError);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Technology",
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    if (formData.logo) {
      data.append("logo", formData.logo);
    }

    const resultAction = await dispatch(createSocietyThunk(data));
    if (createSocietyThunk.fulfilled.match(resultAction)) {
      navigate("/society/dashboard");
    }
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
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

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

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-[#9eb7a9] mb-2">
                Society Logo
              </label>
              <div 
                className="w-32 h-32 rounded-lg border-2 border-dashed border-[#29382f] flex flex-col items-center justify-center bg-[#111714] cursor-pointer hover:border-[#1dc964]/50 transition-colors"
                onClick={() => document.getElementById('logo-upload').click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-[#9eb7a9]">image</span>
                    <span className="text-xs text-[#9eb7a9] mt-2">Upload Logo</span>
                  </>
                )}
              </div>
              <input 
                id="logo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
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
