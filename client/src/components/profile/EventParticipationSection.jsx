import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Loader2, Trophy, Calendar, BadgeCheck } from "lucide-react";
import {
    addEventParticipationThunk,
    updateEventParticipationThunk,
    deleteEventParticipationThunk,
} from "../../redux/slices/profileSlice";
import ConfirmModal from "../common/ConfirmModal";
import IconButton from "../common/IconButton";
import { getButtonClassName } from "../common/Button";
import toast from "react-hot-toast";
import useHomeTheme from "../../hooks/useHomeTheme";

const ROLE_CONFIG = {
    participant: { label: "Participant", color: "bg-slate-500/15 text-slate-400 border-slate-500/25", icon: "🎯" },
    winner: { label: "Winner 🥇", color: "bg-amber-500/15 text-amber-400 border-amber-500/25", icon: "🥇" },
    runner_up: { label: "Runner Up", color: "bg-zinc-400/15 text-zinc-300 border-zinc-400/25", icon: "🥈" },
    organizer: { label: "Organizer", color: "bg-blue-500/15 text-blue-400 border-blue-500/25", icon: "📋" },
    judge: { label: "Judge", color: "bg-sky-500/15 text-sky-400 border-sky-500/25", icon: "⚖️" },
    volunteer: { label: "Volunteer", color: "bg-green-500/15 text-green-400 border-green-500/25", icon: "🤝" },
    other: { label: "Other", color: "bg-slate-500/15 text-slate-400 border-slate-500/25", icon: "📌" },
};

const EMPTY = { eventName: "", role: "participant", achievement: "", description: "", date: "" };

function fieldClass(isDark) {
    return `w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${
        isDark
            ? "border border-[#30363d] bg-[#161b22] text-[#c9d1d9] focus:border-green-500"
            : "border border-slate-200 bg-white text-slate-900 focus:border-emerald-500"
    }`;
}

function EventParticipationForm({ initial = EMPTY, onSave, onCancel, isSaving }) {
    const isDark = useHomeTheme();
    const [form, setForm] = useState(initial);
    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.eventName.trim()) {
            toast.error("Event name is required");
            return;
        }
        onSave({ ...form, date: form.date || null });
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 rounded-xl border p-5 ${isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Event Name *</label>
                    <input value={form.eventName} onChange={(e) => set("eventName", e.target.value)} required placeholder="e.g. FAST Hackathon 2024" className={fieldClass(isDark)} />
                </div>
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Role</label>
                    <select value={form.role} onChange={(e) => set("role", e.target.value)} className={fieldClass(isDark)}>
                        {Object.entries(ROLE_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Achievement</label>
                    <input value={form.achievement} onChange={(e) => set("achievement", e.target.value)} placeholder="e.g. 1st Place, Best UI Award..." className={fieldClass(isDark)} />
                </div>
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Date</label>
                    <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={fieldClass(isDark)} />
                </div>
            </div>

            <div>
                <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Description / Reflection</label>
                <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                    maxLength={600}
                    placeholder="What you learned, built, or contributed..."
                    className={`${fieldClass(isDark)} resize-none ${isDark ? "placeholder-[#8b949e]" : "placeholder-slate-400"}`}
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className={getButtonClassName({ variant: "success", size: "md", isDark })}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save
                </button>
            </div>
        </form>
    );
}

function EventCard({ entry, isOwner, onEdit, onDelete }) {
    const isDark = useHomeTheme();
    const config = ROLE_CONFIG[entry.role] || ROLE_CONFIG.other;

    return (
        <div className={`group rounded-xl border p-4 transition-all ${isDark ? "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]/40" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border text-lg ${isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white"}`}>
                        {config.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <h3 className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{entry.eventName}</h3>
                            {entry.verified && <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" title="Verified platform event" />}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${config.color}`}>{config.label}</span>
                            {entry.date && (
                                <span className={`flex items-center gap-1 text-[11px] ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                                    <Calendar className="h-3 w-3" />
                                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </span>
                            )}
                        </div>
                        {entry.achievement && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-amber-400">
                                <Trophy className="h-3 w-3" />
                                {entry.achievement}
                            </p>
                        )}
                        {entry.description && <p className={`mt-2 line-clamp-2 text-xs leading-relaxed ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{entry.description}</p>}
                    </div>
                </div>

                {isOwner && (
                    <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <IconButton
                            onClick={() => onEdit(entry)}
                            title="Edit event participation"
                            variant="ghost"
                            size="icon-sm"
                            className={isDark ? "text-[#8b949e] hover:text-white" : "text-slate-500 hover:text-slate-900"}
                            icon={<Pencil className="h-3.5 w-3.5" />}
                        />
                        <IconButton
                            onClick={() => onDelete(entry._id)}
                            title="Delete event participation"
                            variant="danger"
                            size="icon-sm"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EventParticipationSection({ profile, isOwner }) {
    const isDark = useHomeTheme();
    const dispatch = useDispatch();
    const { sectionLoading } = useSelector((state) => state.profile);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const events = profile?.eventParticipation || [];

    const handleAdd = async (data) => {
        const result = await dispatch(addEventParticipationThunk(data));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Event added");
            setAdding(false);
        } else {
            toast.error(result.payload || "Failed");
        }
    };

    const handleEdit = async (data) => {
        const result = await dispatch(updateEventParticipationThunk({ id: editing._id, data }));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Updated");
            setEditing(null);
        } else {
            toast.error(result.payload || "Failed");
        }
    };

    const handleDelete = async () => {
        await dispatch(deleteEventParticipationThunk(deleting));
        toast.success("Entry removed");
        setDeleting(null);
    };

    return (
        <div className={`rounded-2xl p-6 transition-colors ${isDark ? "border border-[#30363d] bg-[#161b22]" : "border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"}`}>
            <div className="mb-6 flex items-center justify-between">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Event Participation</h2>
                {isOwner && !adding && (
                    <button
                        onClick={() => setAdding(true)}
                        className={getButtonClassName({ variant: "success", size: "sm", isDark })}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </button>
                )}
            </div>

            {adding && <div className="mb-4"><EventParticipationForm onSave={handleAdd} onCancel={() => setAdding(false)} isSaving={sectionLoading.events} /></div>}
            {editing && (
                <div className="mb-4">
                    <EventParticipationForm
                        initial={{ ...editing, date: editing.date?.split("T")[0] || "" }}
                        onSave={handleEdit}
                        onCancel={() => setEditing(null)}
                        isSaving={sectionLoading.events}
                    />
                </div>
            )}

            {events.length === 0 && !adding ? (
                <p className={`py-8 text-center text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                    {isOwner ? "Add events you've participated in!" : "No events listed yet."}
                </p>
            ) : (
                <div className="space-y-3">
                    {events.map((entry) => (
                        <EventCard key={entry._id} entry={entry} isOwner={isOwner} onEdit={setEditing} onDelete={setDeleting} />
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleting}
                title="Remove Entry"
                message="Remove this event participation entry?"
                confirmText="Remove"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

