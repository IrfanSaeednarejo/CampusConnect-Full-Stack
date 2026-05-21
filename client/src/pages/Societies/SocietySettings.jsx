import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
import {
  updateSocietyThunk,
  deleteSocietyThunk,
  selectCurrentSociety,
  selectMySocieties,
} from "../../redux/slices/societySlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { getButtonClassName } from "../../components/common/Button";
import { cn, getSocietyTheme } from "./societyTheme";

const CATEGORIES = ["Technology", "Business", "Arts", "Sports", "Science", "Culture", "Community", "Other"];

function Toggle({ checked, onChange, label, description, theme }) {
  return (
    <div className={cn("flex items-center justify-between border-b py-4 last:border-b-0", theme.divider)}>
      <div>
        <p className={cn("text-sm font-medium", theme.text)}>{label}</p>
        {description && <p className={cn("mt-1 text-xs", theme.muted)}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

export default function SocietySettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const { societyId } = useOutletContext() ?? {};
  const mySocieties = useSelector(selectMySocieties);
  const storeCurrentSociety = useSelector(selectCurrentSociety);

  const society = storeCurrentSociety ?? mySocieties?.[0] ?? null;

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Technology",
    tag: "",
    requireApproval: true,
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const logoRef = useRef();
  const coverRef = useRef();

  useEffect(() => {
    if (!society) return;
    setForm({
      name: society.name ?? "",
      description: society.description ?? "",
      category: society.category ?? "Technology",
      tag: society.tag ?? "",
      requireApproval: society.requireApproval ?? true,
    });
    if (society.media?.logo) setLogoPreview(society.media.logo);
    if (society.media?.coverImage) setCoverPreview(society.media.coverImage);
  }, [society]);

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError("Society name is required.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("category", form.category);
    formData.append("tag", form.tag.trim());
    formData.append("requireApproval", form.requireApproval);
    if (logoFile) formData.append("logo", logoFile);
    if (coverFile) formData.append("cover", coverFile);

    try {
      await dispatch(updateSocietyThunk({ id: societyId ?? society?._id, formData })).unwrap();
      showSuccess("Settings saved!");
    } catch (error) {
      showError(error || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== society?.name) {
      showError("Society name doesn't match.");
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteSocietyThunk(societyId ?? society?._id)).unwrap();
      showSuccess("Society deleted.");
      navigate("/dashboard");
    } catch (error) {
      showError(error || "Failed to delete society.");
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: "tune" },
    { id: "media", label: "Media", icon: "image" },
    { id: "privacy", label: "Privacy", icon: "lock" },
    { id: "danger", label: "Danger", icon: "warning" },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>Settings</h1>
        <p className={cn("text-sm", theme.muted)}>Manage your society details, media, privacy, and lifecycle controls.</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-56 lg:shrink-0">
          <nav className={cn("rounded-3xl border p-2", theme.card)}>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={getButtonClassName({
                    variant: activeTab === tab.id ? (tab.id === "danger" ? "danger" : "primary") : (tab.id === "danger" ? "danger" : "secondary"),
                    size: "md",
                    isDark,
                    className: "w-full justify-start",
                  })}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="min-w-0 flex-1">
          {activeTab === "general" && (
            <div className={cn("rounded-3xl border p-6", theme.card)}>
              <h2 className={cn("text-xl font-semibold", theme.text)}>General Settings</h2>
              <div className="mt-6 space-y-5">
                {[
                  { label: "Society Name", field: "name", type: "text", placeholder: "Enter society name", required: true },
                  { label: "Tag / Slug", field: "tag", type: "text", placeholder: "short-tag (lowercase)" },
                ].map((input) => (
                  <div key={input.field}>
                    <label className={cn("mb-1.5 block text-sm", theme.muted)}>
                      {input.label}
                      {input.required && <span className="ml-0.5 text-danger">*</span>}
                    </label>
                    <input
                      type={input.type}
                      value={form[input.field]}
                      onChange={setField(input.field)}
                      placeholder={input.placeholder}
                      className={cn("w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", theme.field)}
                    />
                  </div>
                ))}

                <div>
                  <label className={cn("mb-1.5 block text-sm", theme.muted)}>Category</label>
                  <select
                    value={form.category}
                    onChange={setField("category")}
                    className={cn("w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", theme.field)}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={cn("mb-1.5 block text-sm", theme.muted)}>Description</label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={setField("description")}
                    placeholder="Describe your society..."
                    className={cn("w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", theme.field)}
                  />
                  <p className={cn("mt-1 text-right text-xs", theme.muted)}>{form.description.length}/500 chars</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={getButtonClassName({ variant: "primary", size: "md", isDark })}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className={cn("rounded-3xl border p-6", theme.card)}>
              <h2 className={cn("text-xl font-semibold", theme.text)}>Media & Branding</h2>
              <div className="mt-6 space-y-8">
                <div>
                  <label className={cn("mb-3 block text-sm", theme.muted)}>Society Logo</label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      onClick={() => logoRef.current?.click()}
                      className={cn("flex h-24 w-24 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed", theme.subtle)}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <span className={cn("material-symbols-outlined text-2xl", theme.muted)}>image</span>
                          <span className={cn("mt-1 text-[10px]", theme.muted)}>Upload</span>
                        </>
                      )}
                    </div>
                    <div className={cn("space-y-1 text-xs", theme.muted)}>
                      <p>Recommended: 200 x 200px</p>
                      <p>PNG, JPG · Max 2MB</p>
                      {logoPreview && (
                        <button
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}
                          className={getButtonClassName({ variant: "danger", size: "sm", isDark, className: "min-w-0 px-2" })}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </div>
                </div>

                <div>
                  <label className={cn("mb-3 block text-sm", theme.muted)}>Cover Image</label>
                  <div
                    onClick={() => coverRef.current?.click()}
                    className={cn("flex h-44 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed", theme.subtle)}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <span className={cn("material-symbols-outlined text-3xl", theme.muted)}>add_photo_alternate</span>
                        <span className={cn("mt-2 text-xs", theme.muted)}>Click to upload cover image</span>
                      </>
                    )}
                  </div>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  <p className={cn("mt-2 text-xs", theme.muted)}>Recommended: 1200 x 300px · PNG, JPG · Max 5MB</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={getButtonClassName({ variant: "primary", size: "md", isDark })}
                >
                  {saving ? "Saving..." : "Save Media"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className={cn("rounded-3xl border p-6", theme.card)}>
              <h2 className={cn("text-xl font-semibold", theme.text)}>Privacy & Join Settings</h2>
              <div className="mt-4">
                <Toggle
                  checked={form.requireApproval}
                  onChange={(value) => setForm((prev) => ({ ...prev, requireApproval: value }))}
                  label="Require Join Approval"
                  description="New members must be approved by a society moderator before joining."
                  theme={theme}
                />
              </div>
              <div className="mt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={getButtonClassName({ variant: "primary", size: "md", isDark })}
                >
                  {saving ? "Saving..." : "Save Privacy Settings"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="rounded-3xl border border-danger/20 bg-danger/5 p-6 dark:border-danger/30 dark:bg-danger/10">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-danger">
                <span className="material-symbols-outlined text-lg">warning</span>
                Danger Zone
              </h2>
              <p className={cn("mt-3 max-w-2xl text-sm leading-6", theme.muted)}>
                Permanently delete this society. This action cannot be undone, and all members, events, and announcements will be removed.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={getButtonClassName({ variant: "danger", size: "md", isDark, className: "mt-5" })}
              >
                Delete Society
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className={cn("w-full max-w-md rounded-3xl border p-6", theme.card)}>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-danger">
              <span className="material-symbols-outlined text-base">warning</span>
              Delete Society
            </h3>
            <p className={cn("mt-3 text-sm leading-6", theme.muted)}>
              This will permanently delete <span className={theme.text}>{society?.name}</span> and all of its data. Type the society name to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
              placeholder={society?.name}
              className={cn("mt-4 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors", theme.field)}
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className={getButtonClassName({ variant: "secondary", size: "md", isDark, className: "flex-1" })}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== society?.name || deleting}
                className={getButtonClassName({ variant: "danger", size: "md", isDark, className: "flex-1" })}
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
