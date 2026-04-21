import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSocietyById,
  updateSocietyThunk,
  selectCurrentSociety,
  selectSocietyLoading,
  selectSocietyError,
  clearCurrentSociety,
} from "../../redux/slices/societySlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";

const CATEGORIES = [
  "Technology", "Business", "Arts", "Sports",
  "Science", "Culture", "Community", "Other",
];

export default function EditSociety() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  const society = useSelector(selectCurrentSociety);
  const loading = useSelector(selectSocietyLoading);
  const error   = useSelector(selectSocietyError);

  const [formData, setFormData] = useState({
    name: "", description: "", category: "Technology", requireApproval: true,
  });
  const [logo,        setLogo]        = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile,   setCoverFile]   = useState(null);
  const [coverPreview,setCoverPreview]= useState(null);
  const [saving,      setSaving]      = useState(false);

  // Fetch the society if not already in redux
  useEffect(() => {
    dispatch(fetchSocietyById(id));
    return () => { dispatch(clearCurrentSociety()); };
  }, [dispatch, id]);

  // Populate form once society loads
  useEffect(() => {
    if (society && society._id === id) {
      setFormData({
        name:            society.name            || "",
        description:     society.description     || "",
        category:        society.category        || "Technology",
        requireApproval: society.requireApproval ?? true,
      });
      if (society.media?.logo)       setLogoPreview(society.media.logo);
      if (society.media?.coverImage) setCoverPreview(society.media.coverImage);
    }
  }, [society, id]);

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      showError("Name and description are required.");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("name",            formData.name);
    fd.append("description",     formData.description);
    fd.append("category",        formData.category);
    fd.append("requireApproval", formData.requireApproval);
    if (logo)      fd.append("logo",  logo);
    if (coverFile) fd.append("cover", coverFile);

    try {
      await dispatch(updateSocietyThunk({ id, formData: fd })).unwrap();
      showSuccess("Society updated successfully!");
      navigate(`/societies/${id}`);
    } catch (err) {
      showError(err || "Failed to update society.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d1117]">
        <div className="max-w-2xl mx-auto px-4 py-8 w-full space-y-4 animate-pulse">
          <div className="h-8 bg-[#161b22] rounded w-1/2" />
          <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (error || (!loading && !society)) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d1117] items-center justify-center p-8">
        <Card padding="p-12">
          <EmptyState
            icon="error"
            title="Society not found"
            description={error || "Could not load society data."}
            action={
              <Button onClick={() => navigate("/societies")} variant="primary">
                Back to Societies
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title="Edit Society"
        subtitle="Update your society's information"
        icon="edit"
        backPath={`/societies/${id}`}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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
              id="edit-society-name"
              type="text"
              value={formData.name}
              onChange={set("name")}
              required
              maxLength={100}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636] transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Category</label>
            <select
              id="edit-society-category"
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
              id="edit-society-description"
              value={formData.description}
              onChange={set("description")}
              required
              rows={5}
              maxLength={500}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636] transition-colors resize-none"
            />
            <p className="text-xs text-[#8b949e] mt-1 text-right">{formData.description.length}/500</p>
          </div>

          {/* requireApproval Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-[#30363d]">
            <div>
              <label className="text-sm font-medium text-[#c9d1d9]">Require Join Approval</label>
              <p className="text-xs text-[#8b949e] mt-0.5">New members must be approved before joining</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, requireApproval: !p.requireApproval }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.requireApproval ? "bg-[#238636]" : "bg-[#30363d]"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.requireApproval ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Cover Image</label>
            <div
              onClick={() => document.getElementById("edit-cover-upload").click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-[#30363d] flex flex-col items-center justify-center cursor-pointer hover:border-[#238636] transition-colors bg-[#0d1117] overflow-hidden"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#8b949e] text-2xl">add_photo_alternate</span>
                  <span className="text-[#8b949e] text-xs mt-1">Upload cover image</span>
                </>
              )}
            </div>
            <input id="edit-cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            <p className="text-xs text-[#8b949e] mt-1">Recommended: 1200×300px · PNG, JPG · Max 5MB</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Logo</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => document.getElementById("edit-logo-upload").click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-[#30363d] flex flex-col items-center justify-center cursor-pointer hover:border-[#238636] transition-colors bg-[#0d1117] overflow-hidden"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[#8b949e] text-2xl">image</span>
                    <span className="text-[#8b949e] text-xs mt-1">Change</span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#8b949e]">PNG, JPG · Max 2 MB</p>
              <input
                id="edit-logo-upload"
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
              onClick={() => navigate(`/societies/${id}`)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              id="edit-society-submit"
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
