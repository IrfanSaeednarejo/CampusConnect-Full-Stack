import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, X, ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import {
    addProjectThunk, updateProjectThunk, deleteProjectThunk,
} from "../../redux/slices/profileSlice";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";

const STATUS_STYLES = {
    ongoing:   "bg-green-500/15 text-green-400 border-green-500/25",
    completed: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    paused:    "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

// ── Project Detail Modal ───────────────────────────────────────────────────────
function ProjectDetailModal({ project, onClose }) {
    const [imgIdx, setImgIdx] = useState(0);
    const images = project.images || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Image carousel */}
                {images.length > 0 && (
                    <div className="relative h-64 bg-[#0d1117] overflow-hidden rounded-t-2xl">
                        <img src={images[imgIdx]} alt={`${project.title} ${imgIdx + 1}`}
                            className="w-full h-full object-cover" />
                        {images.length > 1 && (
                            <>
                                <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, i) => (
                                        <button key={i} onClick={() => setImgIdx(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold text-white">{project.title}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${STATUS_STYLES[project.status] || ""}`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-[#8b949e] text-sm mt-1">{project.description}</p>
                        </div>
                        <button onClick={onClose} className="text-[#8b949e] hover:text-white p-1 rounded-lg hover:bg-[#21262d] transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {project.details && (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-[#c9d1d9] text-sm leading-relaxed whitespace-pre-wrap">{project.details}</p>
                        </div>
                    )}

                    {project.techStack?.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-1">
                                <GitBranch className="w-3 h-3" /> Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {project.techStack.map((t) => (
                                    <span key={t} className="px-2.5 py-1 bg-[#21262d] text-[#c9d1d9] text-xs rounded-lg font-medium border border-[#30363d]">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-bold rounded-xl transition-all w-fit">
                            <ExternalLink className="w-4 h-4" /> View Project
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Project Form ──────────────────────────────────────────────────────────────
function ProjectForm({ initial = {}, onSave, onCancel, isSaving }) {
    const fileRef = useRef(null);
    const [form, setForm] = useState({
        title: "", description: "", details: "", link: "",
        status: "ongoing", featured: false,
        ...initial,
        techStack: initial.techStack?.join(", ") || "",
    });
    const [previewFiles, setPreviewFiles] = useState([]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 3);
        setPreviewFiles(files.map((f) => ({ file: f, url: URL.createObjectURL(f) })));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            toast.error("Title and description are required"); return;
        }
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (k === "techStack") {
                fd.append(k, JSON.stringify(v.split(",").map((t) => t.trim()).filter(Boolean)));
            } else {
                fd.append(k, v);
            }
        });
        previewFiles.forEach(({ file }) => fd.append("images", file));
        onSave(fd);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Title *</label>
                    <input value={form.title} onChange={(e) => set("title", e.target.value)} required
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors">
                        {["ongoing", "completed", "paused"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Short Description *</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} maxLength={400} required
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm resize-none focus:outline-none focus:border-green-500 transition-colors" />
            </div>

            <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Detailed Description</label>
                <textarea value={form.details} onChange={(e) => set("details", e.target.value)} rows={4} maxLength={3000}
                    placeholder="Full project details, challenges, learnings…"
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] placeholder-[#8b949e] text-sm resize-none focus:outline-none focus:border-green-500 transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Tech Stack (comma-separated)</label>
                    <input value={form.techStack} onChange={(e) => set("techStack", e.target.value)} placeholder="React, Node.js, MongoDB…"
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Project Link</label>
                    <input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://github.com/…"
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm focus:outline-none focus:border-green-500 transition-colors" />
                </div>
            </div>

            {/* Image upload */}
            <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">Images (max 3)</label>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
                <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white text-xs font-semibold rounded-lg border border-[#30363d] transition-all">
                    Upload Images
                </button>
                {previewFiles.length > 0 && (
                    <div className="flex gap-2 mt-2">
                        {previewFiles.map((p, i) => (
                            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-[#30363d]">
                                <img src={p.url} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 text-[#8b949e] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-xl text-sm font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                </button>
            </div>
        </form>
    );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function ProjectsSection({ profile, isOwner }) {
    const dispatch = useDispatch();
    const { sectionLoading } = useSelector((s) => s.profile);
    const [adding,   setAdding]   = useState(false);
    const [editing,  setEditing]  = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [viewing,  setViewing]  = useState(null);

    const projects = profile?.projects || [];

    const handleAdd  = async (fd) => {
        const r = await dispatch(addProjectThunk(fd));
        if (r.meta.requestStatus === "fulfilled") { toast.success("Project added"); setAdding(false); }
        else toast.error(r.payload || "Failed");
    };
    const handleEdit = async (fd) => {
        const r = await dispatch(updateProjectThunk({ id: editing._id, formData: fd }));
        if (r.meta.requestStatus === "fulfilled") { toast.success("Project updated"); setEditing(null); }
        else toast.error(r.payload || "Failed");
    };
    const handleDelete = async () => {
        await dispatch(deleteProjectThunk(deleting));
        toast.success("Project removed");
        setDeleting(null);
    };

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Projects</h2>
                {isOwner && !adding && (
                    <button onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                )}
            </div>

            {adding && <div className="mb-6"><ProjectForm onSave={handleAdd} onCancel={() => setAdding(false)} isSaving={sectionLoading.projects} /></div>}
            {editing && <div className="mb-6"><ProjectForm initial={editing} onSave={handleEdit} onCancel={() => setEditing(null)} isSaving={sectionLoading.projects} /></div>}

            {projects.length === 0 && !adding ? (
                <p className="text-center text-[#8b949e] text-sm py-8">
                    {isOwner ? "Showcase your projects!" : "No projects listed yet."}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((p) => (
                        <div key={p._id} onClick={() => setViewing(p)}
                            className="group bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff]/40 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/5">
                            {p.images?.[0] ? (
                                <div className="h-36 overflow-hidden">
                                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                            ) : (
                                <div className="h-20 bg-gradient-to-br from-[#1f3d6f]/40 to-[#2d1b69]/30 flex items-center justify-center">
                                    <GitBranch className="w-8 h-8 text-[#30363d]" />
                                </div>
                            )}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-white font-semibold text-sm truncate">{p.title}</h3>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border capitalize flex-shrink-0 ${STATUS_STYLES[p.status] || ""}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <p className="text-[#8b949e] text-xs mt-1 line-clamp-2">{p.description}</p>
                                    </div>
                                    {isOwner && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => setEditing(p)}
                                                className="p-1.5 text-[#8b949e] hover:text-white hover:bg-[#21262d] rounded-lg transition-all">
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setDeleting(p._id)}
                                                className="p-1.5 text-[#8b949e] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {p.techStack?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {p.techStack.slice(0, 4).map((t) => (
                                            <span key={t} className="px-1.5 py-0.5 bg-[#21262d] text-[#8b949e] text-[10px] rounded font-medium">{t}</span>
                                        ))}
                                        {p.techStack.length > 4 && <span className="text-[#8b949e] text-[10px]">+{p.techStack.length - 4}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewing && <ProjectDetailModal project={viewing} onClose={() => setViewing(null)} />}

            <ConfirmModal isOpen={!!deleting} title="Delete Project"
                message="Remove this project permanently?" confirmText="Delete" variant="danger"
                onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
        </div>
    );
}
