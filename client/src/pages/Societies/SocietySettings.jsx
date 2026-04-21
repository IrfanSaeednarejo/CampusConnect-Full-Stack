import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSocietyThunk,
  deleteSocietyThunk,
  selectCurrentSociety,
  selectMySocieties,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";

const CATEGORIES = [
  "Technology","Business","Arts","Sports","Science","Culture","Community","Other",
];

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
      <div>
        <p className="text-slate-200 text-sm font-medium">{label}</p>
        {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-emerald-600" : "bg-slate-700"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function SocietySettings() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { societyId } = useOutletContext() ?? {};
  const mySocieties = useSelector(selectMySocieties);
  const storeCurrentSociety = useSelector(selectCurrentSociety);
  const loading   = useSelector(selectSocietyLoading);

  const society = storeCurrentSociety ?? mySocieties?.[0] ?? null;

  const [activeTab, setActiveTab]       = useState("general");
  const [saving,    setSaving]          = useState(false);
  const [deleting,  setDeleting]        = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm]    = useState("");

  const [form, setForm] = useState({
    name: "", description: "", category: "Technology", tag: "",
    requireApproval: true,
  });

  const [logoFile,        setLogoFile]        = useState(null);
  const [logoPreview,     setLogoPreview]      = useState(null);
  const [coverFile,       setCoverFile]        = useState(null);
  const [coverPreview,    setCoverPreview]     = useState(null);
  const logoRef  = useRef();
  const coverRef = useRef();

  // Populate form from society
  useEffect(() => {
    if (society) {
      setForm({
        name:            society.name            ?? "",
        description:     society.description     ?? "",
        category:        society.category        ?? "Technology",
        tag:             society.tag             ?? "",
        requireApproval: society.requireApproval ?? true,
      });
      if (society.media?.logo)       setLogoPreview(society.media.logo);
      if (society.media?.coverImage) setCoverPreview(society.media.coverImage);
    }
  }, [society]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleLogoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };
  const handleCoverChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showError("Society name is required."); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append("name",            form.name.trim());
    fd.append("description",     form.description.trim());
    fd.append("category",        form.category);
    fd.append("tag",             form.tag.trim());
    fd.append("requireApproval", form.requireApproval);
    if (logoFile)  fd.append("logo",  logoFile);
    if (coverFile) fd.append("cover", coverFile);
    try {
      await dispatch(updateSocietyThunk({ id: societyId ?? society?._id, formData: fd })).unwrap();
      showSuccess("Settings saved!");
    } catch (err) {
      showError(err || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== society?.name) { showError("Society name doesn't match."); return; }
    setDeleting(true);
    try {
      await dispatch(deleteSocietyThunk(societyId ?? society?._id)).unwrap();
      showSuccess("Society deleted.");
      navigate("/dashboard");
    } catch (err) {
      showError(err || "Failed to delete society.");
    } finally {
      setDeleting(false);
    }
  };

  const TABS = [
    { id: "general",  label: "General",  icon: "tune" },
    { id: "media",    label: "Media",    icon: "image" },
    { id: "privacy",  label: "Privacy",  icon: "lock" },
    { id: "danger",   label: "Danger",   icon: "warning" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-100 text-2xl font-bold">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your society preferences</p>
      </div>

      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="lg:w-44 shrink-0">
          <nav className="space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === t.id
                    ? (t.id === "danger"
                        ? "bg-red-500/15 text-red-400 border border-red-500/25"
                        : "bg-slate-700/70 text-slate-100 border border-slate-600/50")
                    : (t.id === "danger"
                        ? "text-red-500/60 hover:text-red-400 hover:bg-red-500/10"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── General ── */}
          {activeTab === "general" && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
              <h2 className="text-slate-200 font-semibold">General Settings</h2>

              {[
                { label: "Society Name", field: "name", type: "text", placeholder: "Enter society name", required: true },
                { label: "Tag / Slug",   field: "tag",  type: "text", placeholder: "short-tag (lowercase)" },
              ].map(({ label, field, type, placeholder, required }) => (
                <div key={field}>
                  <label className="block text-slate-400 text-sm mb-1.5">
                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={set(field)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={set("category")}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-slate-500 transition-colors"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Description</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Describe your society…"
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 transition-colors resize-none"
                />
                <p className="text-slate-600 text-xs mt-1 text-right">{form.description.length}/500 chars</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm rounded-xl border border-slate-600 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* ── Media ── */}
          {activeTab === "media" && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
              <h2 className="text-slate-200 font-semibold">Media & Branding</h2>

              {/* Logo */}
              <div>
                <label className="block text-slate-400 text-sm mb-3">Society Logo</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => logoRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition-colors bg-slate-900/50 overflow-hidden"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-slate-600 text-2xl">image</span>
                        <span className="text-slate-600 text-[10px] mt-1">Upload</span>
                      </>
                    )}
                  </div>
                  <div className="text-slate-500 text-xs space-y-1">
                    <p>Recommended: 200×200px</p>
                    <p>PNG, JPG · Max 2MB</p>
                    {logoPreview && (
                      <button
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >Remove</button>
                    )}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
              </div>

              {/* Cover */}
              <div>
                <label className="block text-slate-400 text-sm mb-3">Cover Image</label>
                <div
                  onClick={() => coverRef.current?.click()}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition-colors bg-slate-900/50 overflow-hidden relative"
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-slate-600 text-3xl">add_photo_alternate</span>
                      <span className="text-slate-600 text-xs mt-2">Click to upload cover image</span>
                    </>
                  )}
                </div>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                <p className="text-slate-600 text-xs mt-1">Recommended: 1200×300px · PNG, JPG · Max 5MB</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm rounded-xl border border-slate-600 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Media"}
              </button>
            </div>
          )}

          {/* ── Privacy ── */}
          {activeTab === "privacy" && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-0">
              <h2 className="text-slate-200 font-semibold mb-4">Privacy & Join Settings</h2>
              <Toggle
                checked={form.requireApproval}
                onChange={v => setForm(p => ({ ...p, requireApproval: v }))}
                label="Require Join Approval"
                description="New members must be approved by a society moderator before joining"
              />
              <div className="pt-4 mt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm rounded-xl border border-slate-600 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Privacy Settings"}
                </button>
              </div>
            </div>
          )}

          {/* ── Danger ── */}
          {activeTab === "danger" && (
            <div className="bg-red-500/5 border border-red-500/25 rounded-xl p-6 space-y-4">
              <h2 className="text-red-400 font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">warning</span>
                Danger Zone
              </h2>
              <p className="text-slate-400 text-sm">
                Permanently delete this society. This action cannot be undone.
                All members, events, and announcements will be removed.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-red-600/20 hover:bg-red-500/30 text-red-400 font-semibold text-sm rounded-xl border border-red-500/30 transition-colors"
              >
                Delete Society
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-slate-200 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">warning</span>
              Delete Society
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              This will permanently delete <span className="text-slate-200 font-semibold">{society?.name}</span> and all its data.
              Type the society name to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={society?.name}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm mb-4 focus:outline-none focus:border-red-500/50 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== society?.name || deleting}
                className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold rounded-xl border border-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
