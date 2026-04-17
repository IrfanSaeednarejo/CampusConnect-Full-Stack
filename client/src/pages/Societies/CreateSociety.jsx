import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSocietyThunk, selectSocietyLoading, selectSocietyError } from "../../redux/slices/societySlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

const CATEGORIES = ["Technology", "Business", "Arts", "Science", "Sports", "Culture", "Other"];

export default function CreateSociety() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  const loading = useSelector(selectSocietyLoading);
  const error   = useSelector(selectSocietyError);

  const [formData, setFormData] = useState({
    name: "", description: "", category: "Technology",
  });
  const [logo,        setLogo]        = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      showError("Name and description are required.");
      return;
    }
    const fd = new FormData();
    fd.append("name",        formData.name);
    fd.append("description", formData.description);
    fd.append("category",    formData.category);
    if (logo) fd.append("logo", logo);

    try {
      await dispatch(createSocietyThunk(fd)).unwrap();
      showSuccess("Society created! Awaiting admin approval.");
      navigate("/society/manage");
    } catch (err) {
      showError(err || "Failed to create society.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title="Create Society"
        subtitle="Start a new community on your campus"
        icon="add_circle"
        backPath="/societies/browse"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Info banner */}
        <div className="mb-6 p-4 bg-[#1f6feb]/10 border border-[#1f6feb]/30 rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-[#58a6ff] mt-0.5">info</span>
          <p className="text-sm text-[#8b949e]">
            After submitting, your society will be reviewed by an admin before becoming active.
            You'll receive a notification once approved.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-6"
        >
          {error && (
            <div className="p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg text-[#f85149] text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
              Society Name <span className="text-[#f85149]">*</span>
            </label>
            <input
              id="society-name"
              type="text"
              value={formData.name}
              onChange={set("name")}
              placeholder="e.g. IEEE Student Chapter"
              required
              maxLength={100}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636] transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Category</label>
            <select
              id="society-category"
              value={formData.category}
              onChange={set("category")}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] focus:outline-none focus:border-[#238636] transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
              Description <span className="text-[#f85149]">*</span>
            </label>
            <textarea
              id="society-description"
              value={formData.description}
              onChange={set("description")}
              placeholder="Describe your society's mission, goals, and activities…"
              required
              rows={5}
              maxLength={500}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636] transition-colors resize-none"
            />
            <p className="text-xs text-[#8b949e] mt-1 text-right">{formData.description.length}/500</p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Society Logo</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => document.getElementById("logo-upload").click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-[#30363d] flex flex-col items-center justify-center cursor-pointer hover:border-[#238636] transition-colors bg-[#0d1117] overflow-hidden"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[#8b949e] text-2xl">image</span>
                    <span className="text-[#8b949e] text-xs mt-1">Upload</span>
                  </>
                )}
              </div>
              <div className="text-xs text-[#8b949e]">
                <p>PNG, JPG or WebP</p>
                <p>Max 2 MB · Square recommended</p>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/societies/browse")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              id="create-society-submit"
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Creating…" : "Create Society"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
