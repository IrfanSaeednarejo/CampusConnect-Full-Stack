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
import toast from "react-hot-toast";

const TYPE_STYLES = {
    academic:    "bg-blue-500/15 text-blue-400 border-blue-500/25",
    internship:  "bg-green-500/15 text-green-400 border-green-500/25",
    volunteer:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
    part_time:   "bg-violet-500/15 text-violet-400 border-violet-500/25",
    full_time:   "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
    freelance:   "bg-rose-500/15 text-rose-400 border-rose-500/25",
    other:       "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

const EMPTY_FORM = {
    title: "", organization: "", type: "other",
    startDate: "", endDate: "", isCurrent: false,
    description: "", skills: "", location: "",
};

function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function ExperienceForm({ initial = EMPTY_FORM, onSave, onCancel, isSaving, onAiImprove, aiLoading, aiSuggestion, onApplyAi }) {
    const [form, setForm] = useState(initial);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.organization.trim() || !form.startDate) {
            toast.error("Title, organization, and start date are required");
            return;
        }
        const data = {
            ...form,
            skills: typeof form.skills === "string"
                ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : form.skills,
            endDate: form.isCurrent ? null : form.endDate || null,
        };
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[["title", "Role / Title"], ["organization", "Organization"]].map(([k, label]) => (
                    <div key={k}>
                        <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{label} *</label>
                        <input value={form[k]} onChange={(e) => set(k, e.target.value)} required
                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Type</label>
                    <select value={form.type} onChange={(e) => set("type", e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors">
                        {Object.keys(TYPE_STYLES).map((t) => (
                            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Start Date *</label>
                    <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">End Date</label>
                    <input type="date" value={form.endDate} disabled={form.isCurrent} onChange={(e) => set("endDate", e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 disabled:opacity-40 transition-colors" />
                    <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                        <input type="checkbox" checked={form.isCurrent} onChange={(e) => set("isCurrent", e.target.checked)} className="accent-green-600" />
                        <span className="text-xs text-[#8b949e]">Currently here</span>
                    </label>
                </div>
            </div>

            {/* Description with AI improve */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#8b949e]">Description</label>
                    <button type="button" onClick={() => onAiImprove(form.description, form.title, form.organization)}
                        disabled={aiLoading || !form.description.trim()}
                        className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold disabled:opacity-40 transition-colors">
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI Improve
                    </button>
                </div>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} maxLength={600}
                    placeholder="Describe your responsibilities and achievements..."
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] placeholder-[#8b949e] text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
                />
                {aiSuggestion?.description && (
                    <div className="mt-2 p-3 bg-violet-500/10 border border-violet-500/25 rounded-lg">
                        <p className="text-violet-200 text-xs leading-relaxed">{aiSuggestion.description}</p>
                        <button type="button" onClick={() => { set("description", aiSuggestion.description); onApplyAi(); }}
                            className="mt-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                            ✓ Use this
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Skills (comma-separated)</label>
                    <input value={typeof form.skills === "string" ? form.skills : form.skills?.join(", ")}
                        onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, Leadership…"
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Location</label>
                    <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country or Remote"
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 text-[#8b949e] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-xl text-sm font-semibold transition-all">
                    Cancel
                </button>
                <button type="submit" disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save
                </button>
            </div>
        </form>
    );
}

function ExperienceCard({ entry, isOwner, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const duration = `${formatDate(entry.startDate)} — ${entry.isCurrent ? "Present" : formatDate(entry.endDate)}`;
    const skills = entry.skills || [];

    return (
        <div className="relative pl-6 pb-6 last:pb-0">
            {/* Timeline line */}
            <div className="absolute left-0 top-1 bottom-0 w-px bg-[#30363d]" />
            <div className="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-green-600 border-2 border-[#0d1117]" />

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-[#8b949e]/50 transition-colors group">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-sm">{entry.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${TYPE_STYLES[entry.type] || TYPE_STYLES.other}`}>
                                {entry.type?.replace(/_/g, " ")}
                            </span>
                        </div>
                        <p className="text-[#58a6ff] text-xs font-medium">{entry.organization}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[#8b949e] text-[11px]">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{duration}</span>
                            {entry.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.location}</span>}
                        </div>
                    </div>
                    {isOwner && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={() => onEdit(entry)} className="p-1.5 text-[#8b949e] hover:text-white hover:bg-[#21262d] rounded-lg transition-all">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDelete(entry._id)} className="p-1.5 text-[#8b949e] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {entry.description && (
                    <div className="mt-3">
                        <p className={`text-[#c9d1d9] text-xs leading-relaxed ${!expanded && entry.description.length > 200 ? "line-clamp-3" : ""}`}>
                            {entry.description}
                        </p>
                        {entry.description.length > 200 && (
                            <button onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1 text-[#58a6ff] text-[11px] mt-1 font-semibold hover:text-[#79c0ff] transition-colors">
                                {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show more</>}
                            </button>
                        )}
                    </div>
                )}

                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] text-[10px] rounded-md font-medium">{s}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ExperienceSection({ profile, isOwner }) {
    const dispatch = useDispatch();
    const { sectionLoading, ai } = useSelector((s) => s.profile);
    const [adding,   setAdding]   = useState(false);
    const [editing,  setEditing]  = useState(null);
    const [deleting, setDeleting] = useState(null);

    const experience = profile?.experience || [];

    const handleSaveNew = async (data) => {
        const r = await dispatch(addExperienceThunk(data));
        if (r.meta.requestStatus === "fulfilled") { toast.success("Experience added"); setAdding(false); }
        else toast.error(r.payload || "Failed to add");
    };

    const handleSaveEdit = async (data) => {
        const r = await dispatch(updateExperienceThunk({ id: editing._id, data }));
        if (r.meta.requestStatus === "fulfilled") { toast.success("Updated"); setEditing(null); }
        else toast.error(r.payload || "Failed to update");
    };

    const handleDelete = async () => {
        const r = await dispatch(deleteExperienceThunk(deleting));
        if (r.meta.requestStatus === "fulfilled") toast.success("Deleted");
        else toast.error(r.payload || "Failed to delete");
        setDeleting(null);
    };

    const handleAiImprove = (desc, title, org) =>
        dispatch(improveExperienceThunk({ description: desc, title, organization: org }));

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Experience</h2>
                {isOwner && !adding && (
                    <button onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                )}
            </div>

            {/* Add form */}
            {adding && (
                <div className="mb-6">
                    <ExperienceForm
                        onSave={handleSaveNew} onCancel={() => setAdding(false)}
                        isSaving={sectionLoading.experience}
                        onAiImprove={handleAiImprove} aiLoading={ai.generating}
                        aiSuggestion={ai.suggestion} onApplyAi={() => dispatch(clearAiSuggestion())}
                    />
                </div>
            )}

            {/* Edit form */}
            {editing && (
                <div className="mb-6">
                    <ExperienceForm
                        initial={{ ...editing, skills: editing.skills?.join(", ") || "", startDate: editing.startDate?.split("T")[0] || "", endDate: editing.endDate?.split("T")[0] || "" }}
                        onSave={handleSaveEdit} onCancel={() => setEditing(null)}
                        isSaving={sectionLoading.experience}
                        onAiImprove={handleAiImprove} aiLoading={ai.generating}
                        aiSuggestion={ai.suggestion} onApplyAi={() => dispatch(clearAiSuggestion())}
                    />
                </div>
            )}

            {/* Experience list */}
            {experience.length === 0 && !adding ? (
                <p className="text-center text-[#8b949e] text-sm py-8">
                    {isOwner ? "Add your first experience to stand out!" : "No experience listed yet."}
                </p>
            ) : (
                <div className="space-y-0">
                    {experience.map((e) => (
                        <ExperienceCard key={e._id} entry={e} isOwner={isOwner}
                            onEdit={setEditing} onDelete={setDeleting} />
                    ))}
                </div>
            )}

            <ConfirmModal isOpen={!!deleting} title="Delete Experience"
                message="Remove this experience entry? This cannot be undone."
                confirmText="Delete" variant="danger"
                onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
        </div>
    );
}
