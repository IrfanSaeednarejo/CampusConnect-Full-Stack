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
    User, GraduationCap, Link2, Tag, Shield, Bell, Trash2,
    Sparkles, Loader2, ArrowLeft, ChevronRight, Star,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Tab IDs ───────────────────────────────────────────────────────────────────
const TABS = [
    { id: "personal",  label: "Personal Info",   icon: User         },
    { id: "academic",  label: "Academic",         icon: GraduationCap},
    { id: "links",     label: "Social Links",     icon: Link2        },
    { id: "interests", label: "Interests",        icon: Tag          },
    { id: "privacy",   label: "Privacy",          icon: Shield       },
    { id: "account",   label: "Account",          icon: Bell         },
];

const SOCIAL_PROVIDERS = ["github", "linkedin", "twitter", "instagram", "portfolio", "other"];

// ── Shared form field ─────────────────────────────────────────────────────────
function Field({ label, children, hint }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-[10px] text-[#8b949e] mt-1">{hint}</p>}
        </div>
    );
}

function TextInput({ value, onChange, ...rest }) {
    return (
        <input value={value} onChange={onChange} {...rest}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
    );
}

function TextArea({ value, onChange, rows = 3, ...rest }) {
    return (
        <textarea value={value} onChange={onChange} rows={rows} {...rest}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-[#c9d1d9] placeholder-[#8b949e] text-sm resize-none focus:outline-none focus:border-green-500 transition-colors" />
    );
}

// ── Personal Info Tab ─────────────────────────────────────────────────────────
function PersonalTab({ user }) {
    const dispatch = useDispatch();
    const { ai }   = useSelector((s) => s.profile);
    const [form, setForm] = useState({
        firstName:   user?.profile?.firstName   || "",
        lastName:    user?.profile?.lastName    || "",
        displayName: user?.profile?.displayName || "",
        headline:    user?.profile?.headline    || "",
        bio:         user?.profile?.bio         || "",
        location:    user?.profile?.location    || "",
        phone:       user?.profile?.phone       || "",
    });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await dispatch(updateAccountThunk(form)).unwrap();
            toast.success("Profile updated!");
        } catch (e) { toast.error(e || "Failed"); }
        finally { setSaving(false); }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name">
                    <TextInput value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                </Field>
                <Field label="Last Name">
                    <TextInput value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                </Field>
            </div>

            <Field label="Display Name (@username)" hint="Unique, visible to others">
                <TextInput value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
            </Field>

            {/* Headline with AI */}
            <Field label="Headline">
                <div className="space-y-2">
                    <TextInput value={form.headline} onChange={(e) => set("headline", e.target.value)}
                        placeholder="e.g. CS Student · Fullstack Dev · Open Source" />
                    <button onClick={handleAiHeadline} disabled={ai.generating}
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors disabled:opacity-50">
                        {ai.generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Generate with AI
                    </button>
                    {ai.suggestion?.headline && (
                        <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded-xl">
                            <p className="text-violet-200 text-xs">{ai.suggestion.headline}</p>
                            <button onClick={() => { set("headline", ai.suggestion.headline); dispatch(clearAiSuggestion()); }}
                                className="mt-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                                ✓ Use this
                            </button>
                        </div>
                    )}
                </div>
            </Field>

            {/* Bio with AI */}
            <Field label="Bio" hint="Max 300 characters">
                <div className="space-y-2">
                    <TextArea value={form.bio} onChange={(e) => set("bio", e.target.value.slice(0, 300))}
                        placeholder="Tell your campus story…" />
                    <div className="flex items-center justify-between">
                        <button onClick={handleAiBio} disabled={ai.generating}
                            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors disabled:opacity-50">
                            {ai.generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generate bio with AI
                        </button>
                        <span className="text-[10px] text-[#8b949e]">{form.bio.length}/300</span>
                    </div>
                    {ai.suggestion?.bio && (
                        <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded-xl">
                            <p className="text-violet-200 text-xs leading-relaxed">{ai.suggestion.bio}</p>
                            <button onClick={() => { set("bio", ai.suggestion.bio.slice(0, 300)); dispatch(clearAiSuggestion()); }}
                                className="mt-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                                ✓ Use this
                            </button>
                        </div>
                    )}
                </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Location">
                    <TextInput value={form.location} onChange={(e) => set("location", e.target.value)}
                        placeholder="City, Country" />
                </Field>
                <Field label="Phone">
                    <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)}
                        placeholder="+92 300 0000000" />
                </Field>
            </div>

            <div className="flex justify-end pt-2">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                </button>
            </div>
        </div>
    );
}

// ── Academic Tab ──────────────────────────────────────────────────────────────
function AcademicTab({ user }) {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        degree:             user?.academic?.degree             || "",
        department:         user?.academic?.department         || "",
        semester:           user?.academic?.semester           || "",
        enrollmentYear:     user?.academic?.enrollmentYear     || "",
        expectedGraduation: user?.academic?.expectedGraduation || "",
        studentId:          user?.academic?.studentId          || "",
    });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const clean = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
            await dispatch(updateAcademicThunk(clean)).unwrap();
            toast.success("Academic info updated!");
        } catch (e) { toast.error(e || "Failed"); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Degree">
                    <TextInput value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="e.g. BSc Computer Science" />
                </Field>
                <Field label="Department">
                    <TextInput value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Computer Science" />
                </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Field label="Semester">
                    <TextInput type="number" min="0" max="12" value={form.semester} onChange={(e) => set("semester", e.target.value)} />
                </Field>
                <Field label="Enrollment Year">
                    <TextInput type="number" min="2000" max="2100" value={form.enrollmentYear} onChange={(e) => set("enrollmentYear", e.target.value)} />
                </Field>
                <Field label="Graduation Year">
                    <TextInput type="number" min="2000" max="2100" value={form.expectedGraduation} onChange={(e) => set("expectedGraduation", e.target.value)} />
                </Field>
            </div>
            <Field label="Student ID" hint="Kept private">
                <TextInput value={form.studentId} onChange={(e) => set("studentId", e.target.value)} placeholder="e.g. 22F-1234" />
            </Field>
            <div className="flex justify-end pt-2">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                </button>
            </div>
        </div>
    );
}

// ── Social Links Tab ──────────────────────────────────────────────────────────
function LinksTab({ user }) {
    const dispatch = useDispatch();
    const existing = user?.socialLinks || [];
    const initMap  = Object.fromEntries(SOCIAL_PROVIDERS.map((p) => [p, existing.find((l) => l.provider === p)?.url || ""]));
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
        } catch (e) { toast.error(e || "Failed"); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">
            {SOCIAL_PROVIDERS.map((provider) => (
                <Field key={provider} label={provider.charAt(0).toUpperCase() + provider.slice(1)}>
                    <TextInput value={links[provider]}
                        onChange={(e) => setLinks((p) => ({ ...p, [provider]: e.target.value }))}
                        placeholder={`https://${provider}.com/yourhandle`} />
                </Field>
            ))}
            <div className="flex justify-end pt-2">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Links
                </button>
            </div>
        </div>
    );
}

// ── Interests Tab ─────────────────────────────────────────────────────────────
function InterestsTab({ user }) {
    const dispatch = useDispatch();
    const [raw, setRaw]   = useState((user?.interests || []).join(", "));
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const arr = raw.split(",").map((i) => i.trim().toLowerCase()).filter(Boolean);
            await dispatch(updateInterestsThunk(arr)).unwrap();
            toast.success("Interests updated!");
        } catch (e) { toast.error(e || "Failed"); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">
            <Field label="Interests & Skills" hint="Comma-separated, max 20. e.g. react, machine learning, public speaking">
                <TextArea value={raw} onChange={(e) => setRaw(e.target.value)} rows={4}
                    placeholder="react, python, ui design, leadership, data science…" />
            </Field>
            <div className="flex flex-wrap gap-1.5">
                {raw.split(",").map((i) => i.trim()).filter(Boolean).slice(0, 20).map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-[#1f6feb]/10 text-[#58a6ff] border border-[#1f6feb]/20 rounded-full text-xs font-medium capitalize">{tag}</span>
                ))}
            </div>
            <div className="flex justify-end pt-2">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Interests
                </button>
            </div>
        </div>
    );
}

// ── Privacy Tab ───────────────────────────────────────────────────────────────
function PrivacyTab({ user }) {
    const dispatch = useDispatch();
    const priv = user?.preferences?.privacy || {};
    const [settings, setSettings] = useState({
        profileVisibility: priv.profileVisibility || "campus",
        showEmail:        priv.showEmail        ?? false,
        showPhone:        priv.showPhone        ?? false,
        showExperience:   priv.showExperience   ?? true,
        showProjects:     priv.showProjects     ?? true,
        showEventHistory: priv.showEventHistory ?? true,
        showAchievements: priv.showAchievements ?? true,
        showActivity:     priv.showActivity     ?? true,
    });
    const [saving, setSaving] = useState(false);
    const toggle = (k) => setSettings((p) => ({ ...p, [k]: !p[k] }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await dispatch(updatePreferencesThunk({ privacy: settings })).unwrap();
            toast.success("Privacy settings updated!");
        } catch (e) { toast.error(e || "Failed"); }
        finally { setSaving(false); }
    };

    const BoolRow = ({ label, k, hint }) => (
        <div className="flex items-center justify-between py-3 border-b border-[#21262d] last:border-0">
            <div>
                <p className="text-[#c9d1d9] text-sm font-medium">{label}</p>
                {hint && <p className="text-[#8b949e] text-xs mt-0.5">{hint}</p>}
            </div>
            <button onClick={() => toggle(k)}
                className={`relative w-10 h-5 rounded-full transition-colors ${settings[k] ? "bg-green-600" : "bg-[#30363d]"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[k] ? "translate-x-5" : "translate-x-0"}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-5">
            <Field label="Profile Visibility">
                <select value={settings.profileVisibility}
                    onChange={(e) => setSettings((p) => ({ ...p, profileVisibility: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors">
                    <option value="public">Public — anyone on the internet</option>
                    <option value="campus">Campus — logged-in users only</option>
                    <option value="connections">Connections — only your connections</option>
                </select>
            </Field>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">Section Visibility</h3>
                <BoolRow label="Experience"       k="showExperience"   />
                <BoolRow label="Projects"         k="showProjects"     />
                <BoolRow label="Event History"    k="showEventHistory" />
                <BoolRow label="Achievements"     k="showAchievements" />
                <BoolRow label="Activity Feed"    k="showActivity"     />
                <BoolRow label="Show Email"       k="showEmail"        hint="Show email on public profile" />
                <BoolRow label="Show Phone"       k="showPhone"        hint="Show phone on public profile" />
            </div>

            <div className="flex justify-end pt-2">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Privacy
                </button>
            </div>
        </div>
    );
}

// ── Account Quick-Links Tab ───────────────────────────────────────────────────
function AccountTab() {
    const navigate = useNavigate();
    const links = [
        { label: "Account Settings",       sub: "Email, password, sessions",     path: "/profile/account-settings",         icon: User   },
        { label: "Notification Preferences",sub: "Customize how you're notified", path: "/profile/notification-preferences", icon: Bell   },
        { label: "Become a Mentor",        sub: "Share expertise with students",  path: "/mentors/become",                   icon: Star   },
        { label: "Delete Account",         sub: "Permanently remove your account",path: "/profile/delete-account",          icon: Trash2, danger: true },
    ];
    return (
        <div className="space-y-3">
            {links.map(({ label, sub, path, icon: Icon, danger }) => (
                <button key={path} onClick={() => navigate(path)}
                    className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border transition-all text-left ${
                        danger
                            ? "bg-[#0d1117] border-[#30363d] hover:border-rose-500/50 group"
                            : "bg-[#0d1117] border-[#30363d] hover:border-green-500/40"
                    }`}>
                    <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${danger ? "text-rose-500 group-hover:text-rose-400" : "text-[#8b949e]"}`} />
                        <div>
                            <p className={`text-sm font-semibold ${danger ? "text-rose-500 group-hover:text-rose-400" : "text-white"}`}>{label}</p>
                            <p className="text-[#8b949e] text-xs mt-0.5">{sub}</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8b949e] flex-shrink-0" />
                </button>
            ))}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfileManagement() {
    const navigate    = useNavigate();
    const { user }    = useAuth();
    const [activeTab, setActiveTab] = useState("personal");

    const current = TABS.find((t) => t.id === activeTab);

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#21262d] px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate("/profile/view")}
                    className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Profile
                </button>
                <span className="text-[#30363d]">/</span>
                <span className="text-white text-sm font-semibold">Manage Profile</span>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
                {/* Sidebar nav */}
                <aside className="w-48 flex-shrink-0 hidden md:block">
                    <nav className="space-y-1 sticky top-20">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                                    activeTab === id
                                        ? "bg-green-600/15 text-green-400 border border-green-600/25"
                                        : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                                }`}>
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Mobile tab selector */}
                <div className="md:hidden w-full mb-4">
                    <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition-colors">
                        {TABS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
                    </select>
                </div>

                {/* Content panel */}
                <div className="flex-1 min-w-0">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                            {current && <current.icon className="w-5 h-5 text-green-400" />}
                            {current?.label}
                        </h2>
                        {activeTab === "personal"  && <PersonalTab  user={user} />}
                        {activeTab === "academic"  && <AcademicTab  user={user} />}
                        {activeTab === "links"     && <LinksTab     user={user} />}
                        {activeTab === "interests" && <InterestsTab user={user} />}
                        {activeTab === "privacy"   && <PrivacyTab   user={user} />}
                        {activeTab === "account"   && <AccountTab />}
                    </div>
                </div>
            </div>
        </div>
    );
}
