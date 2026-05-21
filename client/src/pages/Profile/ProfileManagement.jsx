import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  updateAccountThunk,
  updateAcademicThunk,
  updateSocialLinksThunk,
  updateInterestsThunk,
  updatePreferencesThunk,
} from "../../redux/slices/authSlice";
import {
  generateBioThunk,
  generateHeadlineThunk,
  clearAiSuggestion,
} from "../../redux/slices/profileSlice";
import {
  User,
  GraduationCap,
  Link2,
  Tag,
  Shield,
  Bell,
  Trash2,
  Sparkles,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import useHomeTheme from "../../hooks/useHomeTheme";

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "academic", label: "Academic", icon: GraduationCap },
  { id: "links", label: "Social Links", icon: Link2 },
  { id: "interests", label: "Interests", icon: Tag },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "account", label: "Account", icon: Bell },
];

const SOCIAL_PROVIDERS = ["github", "linkedin", "twitter", "instagram", "portfolio", "other"];

function getTheme(isDark) {
  return {
    page: isDark ? "bg-[#0d1117] text-[#c9d1d9]" : "bg-slate-50 text-slate-900",
    header: isDark ? "bg-[#0d1117]/95 border-[#21262d]" : "bg-white/95 border-slate-200 shadow-sm",
    sidebar: isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-sm",
    panel: isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
    subtle: isDark ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-200",
    input: isDark
      ? "bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] focus:border-green-500"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400",
    title: isDark ? "text-white" : "text-slate-900",
    text: isDark ? "text-[#c9d1d9]" : "text-slate-700",
    muted: isDark ? "text-[#8b949e]" : "text-slate-500",
    primaryButton: isDark ? "bg-green-600 hover:bg-green-500" : "bg-slate-900 hover:bg-slate-800",
    secondaryButton: isDark
      ? "bg-[#21262d] text-white hover:bg-[#30363d] border-[#30363d]"
      : "bg-white text-slate-900 hover:bg-slate-50 border-slate-200",
    activeTab: isDark
      ? "bg-green-600/15 text-green-400 border border-green-600/25"
      : "bg-slate-900 text-white border border-slate-900",
    inactiveTab: isDark
      ? "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  };
}

function Field({ label, children, hint, isDark }) {
  return (
    <div>
      <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{label}</label>
      {children}
      {hint && <p className={`mt-1 text-[10px] ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, isDark, ...rest }) {
  return (
    <input
      value={value}
      onChange={onChange}
      {...rest}
      className={`w-full rounded-xl border px-3 py-2.5 text-sm transition-colors focus:outline-none ${
        isDark
          ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] placeholder-[#8b949e] focus:border-green-500"
          : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
      }`}
    />
  );
}

function TextArea({ value, onChange, rows = 3, isDark, ...rest }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      {...rest}
      className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm transition-colors focus:outline-none ${
        isDark
          ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] placeholder-[#8b949e] focus:border-green-500"
          : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"
      }`}
    />
  );
}

function SaveButton({ saving, children, isDark, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 ${isDark ? "bg-green-600 hover:bg-green-500" : "bg-slate-900 hover:bg-slate-800"}`}
    >
      {saving && <Loader2 className="h-4 w-4 animate-spin" />} {children}
    </button>
  );
}

function PersonalTab({ user, isDark }) {
  const dispatch = useDispatch();
  const { ai } = useSelector((s) => s.profile);
  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    displayName: user?.profile?.displayName || "",
    headline: user?.profile?.headline || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    phone: user?.profile?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateAccountThunk(form)).unwrap();
      toast.success("Profile updated!");
    } catch (e) {
      toast.error(e || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAiBio = () => {
    const ctx = { displayName: form.displayName, ...user?.academic, interests: user?.interests };
    dispatch(generateBioThunk(ctx));
  };

  const handleAiHeadline = () => {
    const ctx = { ...user?.academic, experience: user?.experience, interests: user?.interests };
    dispatch(generateHeadlineThunk(ctx));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="First Name" isDark={isDark}>
          <TextInput value={form.firstName} onChange={(e) => set("firstName", e.target.value)} isDark={isDark} />
        </Field>
        <Field label="Last Name" isDark={isDark}>
          <TextInput value={form.lastName} onChange={(e) => set("lastName", e.target.value)} isDark={isDark} />
        </Field>
      </div>

      <Field label="Display Name (@username)" hint="Unique, visible to others" isDark={isDark}>
        <TextInput value={form.displayName} onChange={(e) => set("displayName", e.target.value)} isDark={isDark} />
      </Field>

      <Field label="Headline" isDark={isDark}>
        <div className="space-y-2">
          <TextInput
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="e.g. CS Student · Fullstack Dev · Open Source"
            isDark={isDark}
          />
          <button
            onClick={handleAiHeadline}
            disabled={ai.generating}
            className="flex items-center gap-1.5 text-xs font-semibold text-info transition-colors hover:text-blue-400 disabled:opacity-50"
          >
            {ai.generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Generate with AI
          </button>
          {ai.suggestion?.headline && (
            <div className={`rounded-xl border p-3 ${isDark ? "border-info/25 bg-info/10" : "border-blue-200 bg-blue-50"}`}>
              <p className={`text-xs ${isDark ? "text-blue-200" : "text-blue-700"}`}>{ai.suggestion.headline}</p>
              <button
                onClick={() => {
                  set("headline", ai.suggestion.headline);
                  dispatch(clearAiSuggestion());
                }}
                className="mt-1.5 text-xs font-bold text-info transition-colors hover:text-blue-400"
              >
                ✓ Use this
              </button>
            </div>
          )}
        </div>
      </Field>

      <Field label="Bio" hint="Max 300 characters" isDark={isDark}>
        <div className="space-y-2">
          <TextArea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value.slice(0, 300))}
            placeholder="Tell your campus story..."
            isDark={isDark}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleAiBio}
              disabled={ai.generating}
              className="flex items-center gap-1.5 text-xs font-semibold text-info transition-colors hover:text-blue-400 disabled:opacity-50"
            >
              {ai.generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Generate bio with AI
            </button>
            <span className={`text-[10px] ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{form.bio.length}/300</span>
          </div>
          {ai.suggestion?.bio && (
            <div className={`rounded-xl border p-3 ${isDark ? "border-info/25 bg-info/10" : "border-blue-200 bg-blue-50"}`}>
              <p className={`text-xs leading-relaxed ${isDark ? "text-blue-200" : "text-blue-700"}`}>{ai.suggestion.bio}</p>
              <button
                onClick={() => {
                  set("bio", ai.suggestion.bio.slice(0, 300));
                  dispatch(clearAiSuggestion());
                }}
                className="mt-1.5 text-xs font-bold text-info transition-colors hover:text-blue-400"
              >
                ✓ Use this
              </button>
            </div>
          )}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Location" isDark={isDark}>
          <TextInput value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" isDark={isDark} />
        </Field>
        <Field label="Phone" isDark={isDark}>
          <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 300 0000000" isDark={isDark} />
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton saving={saving} isDark={isDark} onClick={handleSave}>Save Changes</SaveButton>
      </div>
    </div>
  );
}

function AcademicTab({ user, isDark }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    degree: user?.academic?.degree || "",
    department: user?.academic?.department || "",
    semester: user?.academic?.semester || "",
    enrollmentYear: user?.academic?.enrollmentYear || "",
    expectedGraduation: user?.academic?.expectedGraduation || "",
    studentId: user?.academic?.studentId || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      await dispatch(updateAcademicThunk(clean)).unwrap();
      toast.success("Academic info updated!");
    } catch (e) {
      toast.error(e || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Degree" isDark={isDark}>
          <TextInput value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="e.g. BSc Computer Science" isDark={isDark} />
        </Field>
        <Field label="Department" isDark={isDark}>
          <TextInput value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Computer Science" isDark={isDark} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Semester" isDark={isDark}>
          <TextInput type="number" min="0" max="12" value={form.semester} onChange={(e) => set("semester", e.target.value)} isDark={isDark} />
        </Field>
        <Field label="Enrollment Year" isDark={isDark}>
          <TextInput type="number" min="2000" max="2100" value={form.enrollmentYear} onChange={(e) => set("enrollmentYear", e.target.value)} isDark={isDark} />
        </Field>
        <Field label="Graduation Year" isDark={isDark}>
          <TextInput type="number" min="2000" max="2100" value={form.expectedGraduation} onChange={(e) => set("expectedGraduation", e.target.value)} isDark={isDark} />
        </Field>
      </div>
      <Field label="Student ID" hint="Kept private" isDark={isDark}>
        <TextInput value={form.studentId} onChange={(e) => set("studentId", e.target.value)} placeholder="e.g. 22F-1234" isDark={isDark} />
      </Field>
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 ${isDark ? "bg-green-600 hover:bg-green-500" : "bg-slate-900 hover:bg-slate-800"}`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
        </button>
      </div>
    </div>
  );
}

function LinksTab({ user, isDark }) {
  const dispatch = useDispatch();
  const existing = user?.socialLinks || [];
  const initMap = Object.fromEntries(SOCIAL_PROVIDERS.map((p) => [p, existing.find((l) => l.provider === p)?.url || ""]));
  const [links, setLinks] = useState(initMap);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(links)
        .filter(([, url]) => url.trim())
        .map(([provider, url]) => ({ provider, url: url.trim() }));
      await dispatch(updateSocialLinksThunk(payload)).unwrap();
      toast.success("Links updated!");
    } catch (e) {
      toast.error(e || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {SOCIAL_PROVIDERS.map((provider) => (
        <Field key={provider} label={provider.charAt(0).toUpperCase() + provider.slice(1)} isDark={isDark}>
          <TextInput
            value={links[provider]}
            onChange={(e) => setLinks((p) => ({ ...p, [provider]: e.target.value }))}
            placeholder={`https://${provider}.com/yourhandle`}
            isDark={isDark}
          />
        </Field>
      ))}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 ${isDark ? "bg-green-600 hover:bg-green-500" : "bg-slate-900 hover:bg-slate-800"}`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Links
        </button>
      </div>
    </div>
  );
}

function InterestsTab({ user, isDark }) {
  const dispatch = useDispatch();
  const [raw, setRaw] = useState((user?.interests || []).join(", "));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const arr = raw
        .split(",")
        .map((i) => i.trim().toLowerCase())
        .filter(Boolean);
      await dispatch(updateInterestsThunk(arr)).unwrap();
      toast.success("Interests updated!");
    } catch (e) {
      toast.error(e || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Interests & Skills" hint="Comma-separated, max 20. e.g. react, machine learning, public speaking" isDark={isDark}>
        <TextArea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          placeholder="react, python, ui design, leadership, data science..."
          isDark={isDark}
        />
      </Field>
      <div className="flex flex-wrap gap-1.5">
        {raw
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
          .slice(0, 20)
          .map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                isDark
                  ? "border border-[#1f6feb]/20 bg-[#1f6feb]/10 text-[#58a6ff]"
                  : "border border-sky-200 bg-sky-50 text-sky-700"
              }`}
            >
              {tag}
            </span>
          ))}
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 ${isDark ? "bg-green-600 hover:bg-green-500" : "bg-slate-900 hover:bg-slate-800"}`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Interests
        </button>
      </div>
    </div>
  );
}

function PrivacyTab({ user, isDark }) {
  const dispatch = useDispatch();
  const priv = user?.preferences?.privacy || {};
  const [settings, setSettings] = useState({
    profileVisibility: priv.profileVisibility || "campus",
    showEmail: priv.showEmail ?? false,
    showPhone: priv.showPhone ?? false,
    showExperience: priv.showExperience ?? true,
    showProjects: priv.showProjects ?? true,
    showEventHistory: priv.showEventHistory ?? true,
    showAchievements: priv.showAchievements ?? true,
    showActivity: priv.showActivity ?? true,
  });
  const [saving, setSaving] = useState(false);
  const toggle = (k) => setSettings((p) => ({ ...p, [k]: !p[k] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updatePreferencesThunk({ privacy: settings })).unwrap();
      toast.success("Privacy settings updated!");
    } catch (e) {
      toast.error(e || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const BoolRow = ({ label, k, hint }) => (
    <div className={`flex items-center justify-between border-b py-3 last:border-0 ${isDark ? "border-[#21262d]" : "border-slate-200"}`}>
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-[#c9d1d9]" : "text-slate-900"}`}>{label}</p>
        {hint && <p className={`mt-0.5 text-xs ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{hint}</p>}
      </div>
      <button
        onClick={() => toggle(k)}
        className={`relative h-5 w-10 rounded-full transition-colors ${settings[k] ? (isDark ? "bg-green-600" : "bg-slate-900") : isDark ? "bg-[#30363d]" : "bg-slate-200"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${settings[k] ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <Field label="Profile Visibility" isDark={isDark}>
        <select
          value={settings.profileVisibility}
          onChange={(e) => setSettings((p) => ({ ...p, profileVisibility: e.target.value }))}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm transition-colors focus:outline-none ${
            isDark
              ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] focus:border-green-500"
              : "border-slate-200 bg-white text-slate-900 focus:border-slate-400"
          }`}
        >
          <option value="public">Public — anyone on the internet</option>
          <option value="campus">Campus — logged-in users only</option>
          <option value="connections">Connections — only your connections</option>
        </select>
      </Field>

      <div className={`rounded-xl border p-4 ${isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"}`}>
        <h3 className={`mb-3 text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Section Visibility</h3>
        <BoolRow label="Experience" k="showExperience" />
        <BoolRow label="Projects" k="showProjects" />
        <BoolRow label="Event History" k="showEventHistory" />
        <BoolRow label="Achievements" k="showAchievements" />
        <BoolRow label="Activity Feed" k="showActivity" />
        <BoolRow label="Show Email" k="showEmail" hint="Show email on public profile" />
        <BoolRow label="Show Phone" k="showPhone" hint="Show phone on public profile" />
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 ${isDark ? "bg-green-600 hover:bg-green-500" : "bg-slate-900 hover:bg-slate-800"}`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Privacy
        </button>
      </div>
    </div>
  );
}

function AccountTab({ isDark }) {
  const navigate = useNavigate();
  const links = [
    { label: "Account Settings", sub: "Email, password, sessions", path: "/profile/account-settings", icon: User },
    { label: "Notification Preferences", sub: "Customize how you're notified", path: "/profile/notification-preferences", icon: Bell },
    { label: "Become a Mentor", sub: "Share expertise with students", path: "/mentors/become", icon: Star },
    { label: "Delete Account", sub: "Permanently remove your account", path: "/profile/delete-account", icon: Trash2, danger: true },
  ];

  return (
    <div className="space-y-3">
      {links.map(({ label, sub, path, icon: Icon, danger }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`group flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all ${
            danger
              ? isDark
                ? "border-[#30363d] bg-[#0d1117] hover:border-rose-500/50"
                : "border-rose-200 bg-rose-50 hover:border-rose-300"
              : isDark
                ? "border-[#30363d] bg-[#0d1117] hover:border-green-500/40"
                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon className={`h-4 w-4 ${danger ? "text-rose-500" : isDark ? "text-[#8b949e]" : "text-slate-500"}`} />
            <div>
              <p className={`text-sm font-semibold ${danger ? "text-rose-500" : isDark ? "text-white" : "text-slate-900"}`}>{label}</p>
              <p className={`mt-0.5 text-xs ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{sub}</p>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 shrink-0 ${isDark ? "text-[#8b949e]" : "text-slate-400"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProfileManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const isDark = useHomeTheme();
  const theme = getTheme(isDark);

  const current = TABS.find((t) => t.id === activeTab);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.page}`}>
      <div className={`sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md ${theme.header}`}>
        <button
          onClick={() => navigate("/profile/view")}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isDark ? "text-[#8b949e] hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          <ArrowLeft className="h-4 w-4" /> Profile
        </button>
        <span className={isDark ? "text-[#30363d]" : "text-slate-300"}>/</span>
        <span className={`text-sm font-semibold ${theme.title}`}>Manage Profile</span>
      </div>

      <div className="mx-auto flex max-w-4xl gap-6 px-4 py-6">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className={`sticky top-20 space-y-1 rounded-2xl border p-2 ${theme.sidebar}`}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${activeTab === id ? theme.activeTab : theme.inactiveTab}`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="mb-4 w-full md:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className={`w-full rounded-xl border px-3 py-2.5 text-sm transition-colors focus:outline-none ${theme.input}`}
          >
            {TABS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0 flex-1">
          <div className={`rounded-2xl border p-6 ${theme.panel}`}>
            <h2 className={`mb-6 flex items-center gap-2 text-lg font-bold ${theme.title}`}>
              {current && <current.icon className="h-5 w-5 text-green-400" />}
              {current?.label}
            </h2>

            {activeTab === "personal" && <PersonalTab user={user} isDark={isDark} />}
            {activeTab === "academic" && <AcademicTab user={user} isDark={isDark} />}
            {activeTab === "links" && <LinksTab user={user} isDark={isDark} />}
            {activeTab === "interests" && <InterestsTab user={user} isDark={isDark} />}
            {activeTab === "privacy" && <PrivacyTab user={user} isDark={isDark} />}
            {activeTab === "account" && <AccountTab isDark={isDark} />}
          </div>
        </div>
      </div>
    </div>
  );
}
