import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, X, ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import { addProjectThunk, updateProjectThunk, deleteProjectThunk } from "../../redux/slices/profileSlice";
import ConfirmModal from "../common/ConfirmModal";
import IconButton from "../common/IconButton";
import { getButtonClassName } from "../common/Button";
import toast from "react-hot-toast";
import useHomeTheme from "../../hooks/useHomeTheme";

const STATUS_STYLES = {
    ongoing: "bg-green-500/15 text-green-400 border-green-500/25",
    completed: "bg-info/10 text-info border-info/25",
    paused: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

function inputClass(isDark) {
    return `w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${
        isDark
            ? "border border-border-dark bg-surface-dark text-text-primary-dark focus:border-primary"
            : "border border-border-light bg-surface-light text-text-primary-light focus:border-primary"
    }`;
}

function ProjectDetailModal({ project, onClose }) {
    const isDark = useHomeTheme();
    const [imgIdx, setImgIdx] = useState(0);
    const images = project.images || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
                {images.length > 0 && (
                    <div className={`relative h-64 overflow-hidden rounded-t-2xl ${isDark ? "bg-background-dark" : "bg-slate-100"}`}>
                        <img src={images[imgIdx]} alt={`${project.title} ${imgIdx + 1}`} className="h-full w-full object-cover" />
                        {images.length > 1 && (
                            <>
                                <IconButton
                                    icon={<ChevronLeft className="h-4 w-4" />}
                                    onClick={() => setImgIdx((idx) => (idx - 1 + images.length) % images.length)}
                                    title="Previous image"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 border-white/20 bg-black/60 text-white hover:border-white/30 hover:bg-black/75 hover:text-white"
                                />
                                <IconButton
                                    icon={<ChevronRight className="h-4 w-4" />}
                                    onClick={() => setImgIdx((idx) => (idx + 1) % images.length)}
                                    title="Next image"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 border-white/20 bg-black/60 text-white hover:border-white/30 hover:bg-black/75 hover:text-white"
                                />
                                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setImgIdx(idx)}
                                            className={`h-2 w-2 rounded-full transition-all ${idx === imgIdx ? "bg-white" : "bg-white/40"}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{project.title}</h2>
                                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLES[project.status] || ""}`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className={`mt-1 text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{project.description}</p>
                        </div>
                        <IconButton icon={<X className="h-5 w-5" />} onClick={onClose} title="Close" variant="ghost" size="icon-sm" />
                    </div>

                    {project.details && <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isDark ? "text-text-primary-dark" : "text-slate-700"}`}>{project.details}</p>}

                    {project.techStack?.length > 0 && (
                        <div>
                            <h3 className={`mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                                <GitBranch className="h-3 w-3" />
                                Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {project.techStack.map((tech) => (
                                    <span key={tech} className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${isDark ? "border-border-dark bg-container-dark text-text-primary-dark" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "w-fit no-underline" })}
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Project
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProjectForm({ initial = {}, onSave, onCancel, isSaving }) {
    const isDark = useHomeTheme();
    const fileRef = useRef(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        details: "",
        link: "",
        status: "ongoing",
        featured: false,
        ...initial,
        techStack: initial.techStack?.join(", ") || "",
    });
    const [previewFiles, setPreviewFiles] = useState([]);
    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 3);
        setPreviewFiles(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            toast.error("Title and description are required");
            return;
        }
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (key === "techStack") {
                formData.append(key, JSON.stringify(value.split(",").map((item) => item.trim()).filter(Boolean)));
            } else {
                formData.append(key, value);
            }
        });
        previewFiles.forEach(({ file }) => formData.append("images", file));
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 rounded-xl border p-5 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-slate-50"}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Title *</label>
                    <input value={form.title} onChange={(e) => set("title", e.target.value)} required className={inputClass(isDark)} />
                </div>
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass(isDark)}>
                        {["ongoing", "completed", "paused"].map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Short Description *</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} maxLength={400} required className={`${inputClass(isDark)} resize-none`} />
            </div>

            <div>
                <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Detailed Description</label>
                <textarea
                    value={form.details}
                    onChange={(e) => set("details", e.target.value)}
                    rows={4}
                    maxLength={3000}
                    placeholder="Full project details, challenges, learnings..."
                    className={`${inputClass(isDark)} resize-none ${isDark ? "placeholder:text-text-secondary-dark" : "placeholder-slate-400"}`}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Tech Stack (comma-separated)</label>
                    <input value={form.techStack} onChange={(e) => set("techStack", e.target.value)} placeholder="React, Node.js, MongoDB..." className={inputClass(isDark)} />
                </div>
                <div>
                    <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Project Link</label>
                    <input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://github.com/..." className={inputClass(isDark)} />
                </div>
            </div>

            <div>
                <label className={`mb-1.5 block text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Images (max 3)</label>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={getButtonClassName({ variant: "secondary", size: "sm", isDark })}
                >
                    Upload Images
                </button>
                {previewFiles.length > 0 && (
                    <div className="mt-2 flex gap-2">
                        {previewFiles.map((preview, idx) => (
                            <div key={idx} className={`h-16 w-16 overflow-hidden rounded-lg border ${isDark ? "border-border-dark" : "border-border-light"}`}>
                                <img src={preview.url} alt="" className="h-full w-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
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

export default function ProjectsSection({ profile, isOwner }) {
    const isDark = useHomeTheme();
    const dispatch = useDispatch();
    const { sectionLoading } = useSelector((state) => state.profile);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [viewing, setViewing] = useState(null);

    const projects = profile?.projects || [];

    const handleAdd = async (formData) => {
        const result = await dispatch(addProjectThunk(formData));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Project added");
            setAdding(false);
        } else {
            toast.error(result.payload || "Failed");
        }
    };

    const handleEdit = async (formData) => {
        const result = await dispatch(updateProjectThunk({ id: editing._id, formData }));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Project updated");
            setEditing(null);
        } else {
            toast.error(result.payload || "Failed");
        }
    };

    const handleDelete = async () => {
        await dispatch(deleteProjectThunk(deleting));
        toast.success("Project removed");
        setDeleting(null);
    };

    return (
        <div
            className={`rounded-2xl p-6 transition-colors ${
                isDark
                    ? "border border-border-dark bg-surface-dark"
                    : "border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            }`}
        >
            <div className="mb-6 flex items-center justify-between">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Projects</h2>
                {isOwner && !adding && (
                    <button onClick={() => setAdding(true)} className={getButtonClassName({ variant: "primary", size: "sm", isDark })}>
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </button>
                )}
            </div>

            {adding && <div className="mb-6"><ProjectForm onSave={handleAdd} onCancel={() => setAdding(false)} isSaving={sectionLoading.projects} /></div>}
            {editing && <div className="mb-6"><ProjectForm initial={editing} onSave={handleEdit} onCancel={() => setEditing(null)} isSaving={sectionLoading.projects} /></div>}

            {projects.length === 0 && !adding ? (
                <p className={`py-8 text-center text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    {isOwner ? "Showcase your projects!" : "No projects listed yet."}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            onClick={() => setViewing(project)}
                            className={`group cursor-pointer overflow-hidden rounded-xl border transition-all ${
                                isDark
                                    ? "border-border-dark bg-background-dark hover:border-info/40 hover:shadow-lg hover:shadow-blue-500/5"
                                    : "border-slate-200 bg-slate-50 hover:border-sky-200 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
                            }`}
                        >
                            {project.images?.[0] ? (
                                <div className="h-36 overflow-hidden">
                                    <img src={project.images[0]} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                </div>
                            ) : (
                                <div className={`flex h-20 items-center justify-center ${isDark ? "bg-container-dark" : "bg-slate-100"}`}>
                                    <GitBranch className={`h-8 w-8 ${isDark ? "text-border-dark" : "text-slate-300"}`} />
                                </div>
                            )}

                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{project.title}</h3>
                                            <span className={`flex-shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLES[project.status] || ""}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <p className={`mt-1 line-clamp-2 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{project.description}</p>
                                    </div>

                                    {isOwner && (
                                        <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                            <IconButton icon={<Pencil className="h-3 w-3" />} onClick={() => setEditing(project)} title="Edit project" variant="ghost" size="icon-sm" />
                                            <IconButton icon={<Trash2 className="h-3 w-3" />} onClick={() => setDeleting(project._id)} title="Delete project" variant="danger" size="icon-sm" />
                                        </div>
                                    )}
                                </div>

                                {project.techStack?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {project.techStack.slice(0, 4).map((tech) => (
                                            <span key={tech} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-container-dark text-text-secondary-dark" : "border border-slate-200 bg-white text-slate-500"}`}>
                                                {tech}
                                            </span>
                                        ))}
                                        {project.techStack.length > 4 && <span className={`text-[10px] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>+{project.techStack.length - 4}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewing && <ProjectDetailModal project={viewing} onClose={() => setViewing(null)} />}

            <ConfirmModal
                isOpen={!!deleting}
                title="Delete Project"
                message="Remove this project permanently?"
                confirmText="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}
