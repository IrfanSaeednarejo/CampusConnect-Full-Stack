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
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Button, { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getSocietyTheme } from "./societyTheme";

const CATEGORIES = ["Technology", "Business", "Arts", "Sports", "Science", "Culture", "Community", "Other"];

export default function EditSociety() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);

  const society = useSelector(selectCurrentSociety);
  const loading = useSelector(selectSocietyLoading);
  const error = useSelector(selectSocietyError);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Technology",
    requireApproval: true,
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSocietyById(id));
    return () => {
      dispatch(clearCurrentSociety());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (society && society._id === id) {
      setFormData({
        name: society.name || "",
        description: society.description || "",
        category: society.category || "Technology",
        requireApproval: society.requireApproval ?? true,
      });
      if (society.media?.logo) setLogoPreview(society.media.logo);
      if (society.media?.coverImage) setCoverPreview(society.media.coverImage);
    }
  }, [society, id]);

  const set = (field) => (event) => setFormData((previous) => ({ ...previous, [field]: event.target.value }));

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      showError("Name and description are required.");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("requireApproval", formData.requireApproval);
    if (logo) fd.append("logo", logo);
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

  if (loading) {
    return (
      <div className={cn("flex min-h-screen flex-col", theme.page)}>
        <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-8 animate-pulse">
          <div className={cn("h-8 w-1/2 rounded", theme.card)} />
          <div className={cn("h-64 rounded-[24px] border", theme.card)} />
        </div>
      </div>
    );
  }

  if (error || (!loading && !society)) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center p-8", theme.page)}>
        <Card padding="p-12" isDark={isDark}>
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
    <div className={cn("flex min-h-screen flex-col", theme.page)}>
      <PageHeader
        title="Edit Society"
        subtitle="Update your society's information"
        icon="edit"
        backPath={`/societies/${id}`}
        isDark={isDark}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
          <form onSubmit={handleSubmit} className={cn("space-y-6 rounded-[24px] border p-6", theme.card)}>
            {error && <div className={cn("rounded-2xl border p-3 text-sm", theme.error)}>{error}</div>}

            <div>
              <label className={cn("mb-1 block text-sm font-medium", theme.text)}>
                Society Name <span className="text-danger">*</span>
              </label>
              <input
                id="edit-society-name"
                type="text"
                value={formData.name}
                onChange={set("name")}
                required
                maxLength={100}
                className={cn("w-full rounded-2xl border px-3 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
              />
            </div>

            <div>
              <label className={cn("mb-1 block text-sm font-medium", theme.text)}>Category</label>
              <select
                id="edit-society-category"
                value={formData.category}
                onChange={set("category")}
                className={cn("w-full rounded-2xl border px-3 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={cn("mb-1 block text-sm font-medium", theme.text)}>
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="edit-society-description"
                value={formData.description}
                onChange={set("description")}
                required
                rows={5}
                maxLength={500}
                className={cn("w-full resize-none rounded-2xl border px-3 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
              />
              <p className={cn("mt-1 text-right text-xs", theme.muted)}>{formData.description.length}/500</p>
            </div>

            <div className={cn("flex items-center justify-between border-t py-3", theme.divider)}>
              <div>
                <label className={cn("text-sm font-medium", theme.text)}>Require Join Approval</label>
                <p className={cn("mt-0.5 text-xs", theme.muted)}>
                  New members must be approved before joining
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    requireApproval: !previous.requireApproval,
                  }))
                }
                className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  formData.requireApproval ? "bg-primary" : isDark ? "bg-container-dark" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    formData.requireApproval ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className={cn("mb-2 block text-sm font-medium", theme.text)}>Cover Image</label>
              <div
                onClick={() => document.getElementById("edit-cover-upload").click()}
                className={cn(
                  "flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
                  isDark ? "border-border-dark bg-background-dark hover:border-primary/50" : "border-border-light bg-slate-50 hover:border-slate-400"
                )}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <span className={cn("material-symbols-outlined text-2xl", theme.muted)}>add_photo_alternate</span>
                    <span className={cn("mt-1 text-xs", theme.muted)}>Upload cover image</span>
                  </>
                )}
              </div>
              <input id="edit-cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              <p className={cn("mt-1 text-xs", theme.muted)}>Recommended: 1200x300px - PNG, JPG - Max 5MB</p>
            </div>

            <div>
              <label className={cn("mb-2 block text-sm font-medium", theme.text)}>Logo</label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => document.getElementById("edit-logo-upload").click()}
                  className={cn(
                    "flex h-20 w-20 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
                    isDark ? "border-border-dark bg-background-dark hover:border-primary/50" : "border-border-light bg-slate-50 hover:border-slate-400"
                  )}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <span className={cn("material-symbols-outlined text-2xl", theme.muted)}>image</span>
                      <span className={cn("mt-1 text-xs", theme.muted)}>Change</span>
                    </>
                  )}
                </div>
                <p className={cn("text-xs", theme.muted)}>PNG, JPG - Max 2 MB</p>
                <input
                  id="edit-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/societies/${id}`)}
                className={getButtonClassName({ variant: "secondary", size: "md", isDark, className: "flex-1" })}
              >
                Cancel
              </button>
              <button
                id="edit-society-submit"
                type="submit"
                disabled={saving}
                className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "flex-1" })}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
