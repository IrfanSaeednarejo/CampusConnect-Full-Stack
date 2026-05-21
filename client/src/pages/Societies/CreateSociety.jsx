import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createSocietyThunk,
  selectSocietyLoading,
  selectSocietyError,
} from "../../redux/slices/societySlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import PageHeader from "../../components/common/PageHeader";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getSocietyTheme } from "./societyTheme";

const CATEGORIES = ["Technology", "Business", "Arts", "Science", "Sports", "Culture", "Other"];

export default function CreateSociety() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);

  const loading = useSelector(selectSocietyLoading);
  const error = useSelector(selectSocietyError);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Technology",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const set = (field) => (event) => setFormData((previous) => ({ ...previous, [field]: event.target.value }));

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      showError("Name and description are required.");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
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
    <div className={cn("flex min-h-screen flex-col", theme.page)}>
      <PageHeader
        title="Create Society"
        subtitle="Start a new community on your campus"
        icon="add_circle"
        backPath="/societies/browse"
        isDark={isDark}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
          <div className={cn("mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm", theme.info)}>
            <span className="material-symbols-outlined mt-0.5 text-info">info</span>
            <p>
              After submitting, your society will be reviewed by an admin before becoming active.
              You'll receive a notification once approved.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={cn("space-y-6 rounded-[24px] border p-6", theme.card)}>
            {error && <div className={cn("rounded-2xl border p-3 text-sm", theme.error)}>{error}</div>}

            <div>
              <label className={cn("mb-1 block text-sm font-medium", theme.text)}>
                Society Name <span className="text-danger">*</span>
              </label>
              <input
                id="society-name"
                type="text"
                value={formData.name}
                onChange={set("name")}
                placeholder="e.g. IEEE Student Chapter"
                required
                maxLength={100}
                className={cn("w-full rounded-2xl border px-3 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
              />
            </div>

            <div>
              <label className={cn("mb-1 block text-sm font-medium", theme.text)}>Category</label>
              <select
                id="society-category"
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
                id="society-description"
                value={formData.description}
                onChange={set("description")}
                placeholder="Describe your society's mission, goals, and activities..."
                required
                rows={5}
                maxLength={500}
                className={cn("w-full resize-none rounded-2xl border px-3 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
              />
              <p className={cn("mt-1 text-right text-xs", theme.muted)}>{formData.description.length}/500</p>
            </div>

            <div>
              <label className={cn("mb-2 block text-sm font-medium", theme.text)}>Society Logo</label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => document.getElementById("logo-upload").click()}
                  className={cn(
                    "flex h-20 w-20 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
                    isDark ? "border-border-dark bg-background-dark hover:border-primary/50" : "border-border-light bg-slate-50 hover:border-slate-400"
                  )}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <span className={cn("material-symbols-outlined text-2xl", theme.muted)}>image</span>
                      <span className={cn("mt-1 text-xs", theme.muted)}>Upload</span>
                    </>
                  )}
                </div>
                <div className={cn("text-xs", theme.muted)}>
                  <p>PNG, JPG or WebP</p>
                  <p>Max 2 MB - Square recommended</p>
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

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/societies/browse")}
                className={getButtonClassName({ variant: "secondary", size: "md", isDark, className: "flex-1" })}
              >
                Cancel
              </button>
              <button
                id="create-society-submit"
                type="submit"
                disabled={loading}
                className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "flex-1" })}
              >
                {loading ? "Creating..." : "Create Society"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
