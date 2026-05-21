import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Loader2, Sparkles, MapPin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import {
    addExperienceThunk,
    updateExperienceThunk,
    deleteExperienceThunk,
    improveExperienceThunk,
    clearAiSuggestion,
} from "../../redux/slices/profileSlice";
import ConfirmModal from "../common/ConfirmModal";
import IconButton from "../common/IconButton";
import { getButtonClassName } from "../common/Button";
import toast from "react-hot-toast";
import useHomeTheme from "../../hooks/useHomeTheme";

const TYPE_STYLES = {
    academic: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    internship: "bg-green-500/15 text-green-400 border-green-500/25",
    volunteer: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    part_time: "bg-info/10 text-info border-info/25",
    full_time: "bg-info/10 text-info border-info/25",
    freelance: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    other: "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

const EMPTY_FORM = {
    title: "",
    organization: "",
    type: "other",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    skills: "",
    location: "",
};

function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fieldClass(isDark) {
    return `w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${
        isDark
            ? "border border-border-dark bg-surface-dark text-text-primary-dark focus:border-primary"
            : "border border-border-light bg-surface-light text-text-primary-light focus:border-primary"
    }`;
}

function mutedLabel(isDark) {
    return isDark ? "text-text-secondary-dark" : "text-text-secondary-light";
}

function ExperienceForm({ initial = EMPTY_FORM, onSave, onCancel, isSaving, onAiImprove, aiLoading, aiSuggestion, onApplyAi }) {
    const isDark = useHomeTheme();
    const [form, setForm] = useState(initial);
    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.organization.trim() || !form.startDate) {
            toast.error("Title, organization, and start date are required");
            return;
        }
        const data = {
            ...form,
            skills: typeof form.skills === "string" ? form.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : form.skills,
            endDate: form.isCurrent ? null : form.endDate || null,
        };
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 rounded-xl border p-5 ${isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[["title", "Role / Title"], ["organization", "Organization"]].map(([key, label]) => (
                    <div key={key}>
                        <label className={`mb-1.5 block text-xs font-semibold ${mutedLabel(isDark)}`}>{label} *</label>
                        <input value={form[key]} onChange={(e) => set(key, e.target.value)} required className={fieldClass(isDark)} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${mutedLabel(isDark)}`}>Type</label>
                    <select value={form.type} onChange={(e) => set("type", e.target.value)} className={fieldClass(isDark)}>
                        {Object.keys(TYPE_STYLES).map((type) => (
                            <option key={type} value={type}>
                                {type.replace(/_/g, " ")}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${mutedLabel(isDark)}`}>Start Date *</label>
                    <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required className={fieldClass(isDark)} />
                </div>
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${mutedLabel(isDark)}`}>End Date</label>
                    <input
                        type="date"
                        value={form.endDate}
                        disabled={form.isCurrent}
                        onChange={(e) => set("endDate", e.target.value)}
                        className={`${fieldClass(isDark)} disabled:opacity-40`}
                    />
                    <label className="mt-1.5 flex cursor-pointer items-center gap-1.5">
                        <input type="checkbox" checked={form.isCurrent} onChange={(e) => set("isCurrent", e.target.checked)} className="accent-primary" />
                        <span className={`text-xs ${mutedLabel(isDark)}`}>Currently here</span>
                    </label>
                </div>
            </div>

            <div>
                <div className="mb-1.5 flex items-center justify-between">
                    <label className={`text-xs font-semibold ${mutedLabel(isDark)}`}>Description</label>
                    <button
                        type="button"
                        onClick={() => onAiImprove(form.description, form.title, form.organization)}
                        disabled={aiLoading || !form.description.trim()}
                        className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2 text-info hover:text-info" })}
                    >
                        {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        AI Improve
                    </button>
                </div>
                <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                    maxLength={600}
                    placeholder="Describe your responsibilities and achievements..."
                    className={`${fieldClass(isDark)} resize-none ${isDark ? "placeholder:text-text-secondary-dark" : "placeholder-slate-400"}`}
                />
                {aiSuggestion?.description && (
                    <div className={`mt-2 rounded-lg border p-3 ${isDark ? "border-info/25 bg-info/10" : "border-info/20 bg-info/5"}`}>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-info" : "text-info"}`}>{aiSuggestion.description}</p>
                        <button
                            type="button"
                            onClick={() => {
                                set("description", aiSuggestion.description);
                                onApplyAi();
                            }}
                            className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "mt-2 min-w-0 px-2 text-info hover:text-info" })}
                        >
                            Use this
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${mutedLabel(isDark)}`}>Skills (comma-separated)</label>
                    <input
                        value={typeof form.skills === "string" ? form.skills : form.skills?.join(", ")}
                        onChange={(e) => set("skills", e.target.value)}
                        placeholder="React, Node.js, Leadership..."
                        className={fieldClass(isDark)}
                    />
                </div>
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${mutedLabel(isDark)}`}>Location</label>
                    <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country or Remote" className={fieldClass(isDark)} />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
                >
                    Cancel
                </button>
                <button type="submit" disabled={isSaving} className={getButtonClassName({ variant: "primary", size: "md", isDark })}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save
                </button>
            </div>
        </form>
    );
}

function ExperienceCard({ entry, isOwner, onEdit, onDelete }) {
    const isDark = useHomeTheme();
    const [expanded, setExpanded] = useState(false);
    const duration = `${formatDate(entry.startDate)} - ${entry.isCurrent ? "Present" : formatDate(entry.endDate)}`;
    const skills = entry.skills || [];

    return (
        <div className="relative pb-6 pl-6 last:pb-0">
            <div className={`absolute bottom-0 left-0 top-1 w-px ${isDark ? "bg-border-dark" : "bg-border-light"}`} />
            <div className={`absolute left-[-4px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-primary ${isDark ? "border-background-dark" : "border-slate-50"}`} />

            <div
                className={`group rounded-xl border p-4 transition-colors ${
                    isDark
                        ? "border-border-dark bg-surface-dark hover:border-info/35"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                }`}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{entry.title}</h3>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${TYPE_STYLES[entry.type] || TYPE_STYLES.other}`}>
                                {entry.type?.replace(/_/g, " ")}
                            </span>
                        </div>
                        <p className={`text-xs font-medium ${isDark ? "text-info" : "text-info"}`}>{entry.organization}</p>
                        <div className={`mt-1.5 flex flex-wrap items-center gap-3 text-[11px] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {duration}
                            </span>
                            {entry.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {entry.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <IconButton icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => onEdit(entry)} title="Edit experience" variant="ghost" size="icon-sm" />
                            <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onDelete(entry._id)} title="Delete experience" variant="danger" size="icon-sm" />
                        </div>
                    )}
                </div>

                {entry.description && (
                    <div className="mt-3">
                        <p className={`text-xs leading-relaxed ${isDark ? "text-text-primary-dark" : "text-slate-700"} ${!expanded && entry.description.length > 200 ? "line-clamp-3" : ""}`}>
                            {entry.description}
                        </p>
                        {entry.description.length > 200 && (
                            <button onClick={() => setExpanded(!expanded)} className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "mt-1 min-w-0 px-2 text-info hover:text-info" })}>
                                {expanded ? (
                                    <>
                                        <ChevronUp className="h-3 w-3" />
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3" />
                                        Show more
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                            <span key={skill} className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${isDark ? "bg-container-dark text-text-secondary-dark" : "bg-slate-100 text-slate-600"}`}>
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ExperienceSection({ profile, isOwner }) {
    const isDark = useHomeTheme();
    const dispatch = useDispatch();
    const { sectionLoading, ai } = useSelector((state) => state.profile);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const experience = profile?.experience || [];

    const handleSaveNew = async (data) => {
        const result = await dispatch(addExperienceThunk(data));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Experience added");
            setAdding(false);
        } else {
            toast.error(result.payload || "Failed to add");
        }
    };

    const handleSaveEdit = async (data) => {
        const result = await dispatch(updateExperienceThunk({ id: editing._id, data }));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Updated");
            setEditing(null);
        } else {
            toast.error(result.payload || "Failed to update");
        }
    };

    const handleDelete = async () => {
        const result = await dispatch(deleteExperienceThunk(deleting));
        if (result.meta.requestStatus === "fulfilled") toast.success("Deleted");
        else toast.error(result.payload || "Failed to delete");
        setDeleting(null);
    };

    const handleAiImprove = (description, title, organization) => dispatch(improveExperienceThunk({ description, title, organization }));

    return (
        <div
            className={`rounded-2xl p-6 transition-colors ${
                isDark
                    ? "border border-[#30363d] bg-[#161b22]"
                    : "border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            }`}
        >
            <div className="mb-6 flex items-center justify-between">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Experience</h2>
                {isOwner && !adding && (
                    <button onClick={() => setAdding(true)} className={getButtonClassName({ variant: "success", size: "sm", isDark })}>
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </button>
                )}
            </div>

            {adding && (
                <div className="mb-6">
                    <ExperienceForm
                        onSave={handleSaveNew}
                        onCancel={() => setAdding(false)}
                        isSaving={sectionLoading.experience}
                        onAiImprove={handleAiImprove}
                        aiLoading={ai.generating}
                        aiSuggestion={ai.suggestion}
                        onApplyAi={() => dispatch(clearAiSuggestion())}
                    />
                </div>
            )}

            {editing && (
                <div className="mb-6">
                    <ExperienceForm
                        initial={{
                            ...editing,
                            skills: editing.skills?.join(", ") || "",
                            startDate: editing.startDate?.split("T")[0] || "",
                            endDate: editing.endDate?.split("T")[0] || "",
                        }}
                        onSave={handleSaveEdit}
                        onCancel={() => setEditing(null)}
                        isSaving={sectionLoading.experience}
                        onAiImprove={handleAiImprove}
                        aiLoading={ai.generating}
                        aiSuggestion={ai.suggestion}
                        onApplyAi={() => dispatch(clearAiSuggestion())}
                    />
                </div>
            )}

            {experience.length === 0 && !adding ? (
                <p className={`py-8 text-center text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                    {isOwner ? "Add your first experience to stand out!" : "No experience listed yet."}
                </p>
            ) : (
                <div className="space-y-0">
                    {experience.map((entry) => (
                        <ExperienceCard key={entry._id} entry={entry} isOwner={isOwner} onEdit={setEditing} onDelete={setDeleting} />
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleting}
                title="Delete Experience"
                message="Remove this experience entry? This cannot be undone."
                confirmText="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}
