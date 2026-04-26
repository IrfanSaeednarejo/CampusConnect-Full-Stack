import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Loader2, Trophy, Calendar, BadgeCheck } from "lucide-react";
import {
    addEventParticipationThunk,
    updateEventParticipationThunk,
    deleteEventParticipationThunk,
} from "../../redux/slices/profileSlice";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";

const ROLE_CONFIG = {
    participant: { label: "Participant", color: "bg-slate-500/15 text-slate-400 border-slate-500/25",    icon: "🎯" },
    winner:      { label: "Winner 🥇",  color: "bg-amber-500/15 text-amber-400 border-amber-500/25",   icon: "🥇" },
    runner_up:   { label: "Runner Up",  color: "bg-zinc-400/15 text-zinc-300 border-zinc-400/25",       icon: "🥈" },
    organizer:   { label: "Organizer",  color: "bg-blue-500/15 text-blue-400 border-blue-500/25",       icon: "📋" },
    judge:       { label: "Judge",      color: "bg-violet-500/15 text-violet-400 border-violet-500/25", icon: "⚖️" },
    volunteer:   { label: "Volunteer",  color: "bg-green-500/15 text-green-400 border-green-500/25",    icon: "🤝" },
    other:       { label: "Other",      color: "bg-slate-500/15 text-slate-400 border-slate-500/25",    icon: "📌" },
};

const EMPTY = { eventName: "", role: "participant", achievement: "", description: "", date: "" };

function EventParticipationForm({ initial = EMPTY, onSave, onCancel, isSaving }) {
    const [form, setForm] = useState(initial);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.eventName.trim()) { toast.error("Event name is required"); return; }
        onSave({ ...form, date: form.date || null });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Event Name *</label>
                    <input value={form.eventName} onChange={(e) => set("eventName", e.target.value)} required
                        placeholder="e.g. FAST Hackathon 2024"
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Role</label>
                    <select value={form.role} onChange={(e) => set("role", e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors">
                        {Object.entries(ROLE_CONFIG).map(([k, { label }]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Achievement</label>
                    <input value={form.achievement} onChange={(e) => set("achievement", e.target.value)}
                        placeholder="e.g. 1st Place, Best UI Award…"
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Date</label>
                    <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Description / Reflection</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} maxLength={600}
                    placeholder="What you learned, built, or contributed…"
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] placeholder-[#8b949e] text-sm resize-none focus:outline-none focus:border-green-500 transition-colors" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 text-[#8b949e] bg-[#21262d] hover:bg-[#30363d] rounded-xl text-sm font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                </button>
            </div>
        </form>
    );
}

function EventCard({ entry, isOwner, onEdit, onDelete }) {
    const cfg = ROLE_CONFIG[entry.role] || ROLE_CONFIG.other;
    return (
        <div className="group bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e]/40 rounded-xl p-4 transition-all">
            <div className="flex items-start justify-between gap-2">
                <div className="flex gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center text-lg flex-shrink-0">
                        {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3 className="text-white font-semibold text-sm truncate">{entry.eventName}</h3>
                            {entry.verified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" title="Verified platform event" />
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                                {cfg.label}
                            </span>
                            {entry.date && (
                                <span className="flex items-center gap-1 text-[#8b949e] text-[11px]">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </span>
                            )}
                        </div>
                        {entry.achievement && (
                            <p className="text-amber-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> {entry.achievement}
                            </p>
                        )}
                        {entry.description && (
                            <p className="text-[#8b949e] text-xs leading-relaxed mt-2 line-clamp-2">{entry.description}</p>
                        )}
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
        </div>
    );
}

export default function EventParticipationSection({ profile, isOwner }) {
    const dispatch = useDispatch();
    const { sectionLoading } = useSelector((s) => s.profile);
    const [adding,   setAdding]   = useState(false);
    const [editing,  setEditing]  = useState(null);
    const [deleting, setDeleting] = useState(null);

    const events = profile?.eventParticipation || [];

    const handleAdd  = async (data) => {
        const r = await dispatch(addEventParticipationThunk(data));
        if (r.meta.requestStatus === "fulfilled") { toast.success("Event added"); setAdding(false); }
        else toast.error(r.payload || "Failed");
    };
    const handleEdit = async (data) => {
        const r = await dispatch(updateEventParticipationThunk({ id: editing._id, data }));
        if (r.meta.requestStatus === "fulfilled") { toast.success("Updated"); setEditing(null); }
        else toast.error(r.payload || "Failed");
    };
    const handleDelete = async () => {
        await dispatch(deleteEventParticipationThunk(deleting));
        toast.success("Entry removed");
        setDeleting(null);
    };

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Event Participation</h2>
                {isOwner && !adding && (
                    <button onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                )}
            </div>

            {adding && <div className="mb-4"><EventParticipationForm onSave={handleAdd} onCancel={() => setAdding(false)} isSaving={sectionLoading.events} /></div>}
            {editing && (
                <div className="mb-4">
                    <EventParticipationForm
                        initial={{ ...editing, date: editing.date?.split("T")[0] || "" }}
                        onSave={handleEdit} onCancel={() => setEditing(null)} isSaving={sectionLoading.events}
                    />
                </div>
            )}

            {events.length === 0 && !adding ? (
                <p className="text-center text-[#8b949e] text-sm py-8">
                    {isOwner ? "Add events you've participated in!" : "No events listed yet."}
                </p>
            ) : (
                <div className="space-y-3">
                    {events.map((e) => (
                        <EventCard key={e._id} entry={e} isOwner={isOwner} onEdit={setEditing} onDelete={setDeleting} />
                    ))}
                </div>
            )}

            <ConfirmModal isOpen={!!deleting} title="Remove Entry"
                message="Remove this event participation entry?" confirmText="Remove" variant="danger"
                onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
        </div>
    );
}
