import { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    X, Image, BarChart2, Globe, Users, Building2,
    Plus, Trash2, Loader2, Sparkles, Hash, AlertTriangle,
} from "lucide-react";
import { createPost, closeComposer,
    suggestHashtagsThunk, generatePollThunk, moderatePostThunk,
    clearAiHashtags, clearAiPollOptions, clearModerationResult,
} from "../../redux/slices/feedSlice";
import toast from "react-hot-toast";
import AiWritingPanel from "./AiWritingPanel";
import HashtagChips   from "./HashtagChips";
import ConfirmModal   from "../common/ConfirmModal";

const VISIBILITY_OPTIONS = [
    { value: "public",      label: "Public",       icon: Globe },
    { value: "campus",      label: "Campus Only",  icon: Building2 },
    { value: "connections", label: "Connections",  icon: Users },
];

const MAX_CHARS = 2000;

export default function PostComposer() {
    const dispatch = useDispatch();
    const { composerLoading } = useSelector((s) => s.feed);
    const { tagging, pollingGen, moderating,
            suggestions: { hashtags, pollOptions },
            moderationResult } = useSelector((s) => s.feed.ai);
    const user = useSelector((s) => s.auth.user);

    // ── Post state ────────────────────────────────────────────────────────────
    const [body,          setBody]         = useState("");
    const [images,        setImages]       = useState([]);
    const [visibility,    setVisibility]   = useState("campus");
    const [postType,      setPostType]     = useState("text");
    const [pollOpts,      setPollOpts]     = useState(["", ""]);
    const [pollEndsAt,    setPollEndsAt]   = useState("");
    const [pollMulti,     setPollMulti]    = useState(false);

    // ── AI panel state ────────────────────────────────────────────────────────
    const [aiPanelOpen,   setAiPanelOpen]  = useState(false);

    // ── Moderation confirm modal ───────────────────────────────────────────────
    const [modConfirm,    setModConfirm]   = useState(false);

    const fileRef = useRef(null);

    // ── Image handlers ────────────────────────────────────────────────────────
    const handleImageAdd = (e) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 4) { toast.error("Maximum 4 images per post"); return; }
        setImages((p) => [...p, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
        e.target.value = "";
    };
    const removeImage = (idx) => {
        URL.revokeObjectURL(images[idx].preview);
        setImages((p) => p.filter((_, i) => i !== idx));
    };

    // ── Poll handlers ─────────────────────────────────────────────────────────
    const addPollOption    = () => { if (pollOpts.length < 5) setPollOpts((p) => [...p, ""]); };
    const removePollOption = (idx) => { if (pollOpts.length > 2) setPollOpts((p) => p.filter((_, i) => i !== idx)); };
    const setPollOption    = (idx, val) => setPollOpts((p) => p.map((o, i) => (i === idx ? val : o)));

    // ── AI helpers ────────────────────────────────────────────────────────────
    const handleSuggestHashtags = () => {
        if (body.trim().length < 20) { toast.error("Write more before suggesting hashtags"); return; }
        dispatch(clearAiHashtags());
        dispatch(suggestHashtagsThunk(body.trim()))
            .unwrap()
            .catch((err) => toast.error(err || "Could not suggest hashtags"));
    };

    const handleInsertHashtag = useCallback((tag) => {
        setBody((prev) => {
            const separator = prev.endsWith(" ") || prev.endsWith("\n") || prev === "" ? "" : " ";
            return prev + separator + tag;
        });
    }, []);

    const handleGeneratePollOpts = () => {
        const question = body.trim() || pollOpts[0];
        if (!question) { toast.error("Enter a question first"); return; }
        dispatch(clearAiPollOptions());
        dispatch(generatePollThunk(question))
            .unwrap()
            .then((res) => {
                const opts = res?.options || [];
                if (opts.length) setPollOpts(opts.map((o) => o.slice(0, 100)));
            })
            .catch((err) => toast.error(err || "Could not generate poll options"));
    };

    // ── Submit flow (with moderation gate) ───────────────────────────────────
    const buildFormData = () => {
        const fd = new FormData();
        fd.append("body",       body.trim());
        fd.append("type",       postType);
        fd.append("visibility", visibility);
        images.forEach((img) => fd.append("images", img.file));
        if (postType === "poll") {
            fd.append("poll", JSON.stringify({
                options:       pollOpts.map((o) => ({ text: o.trim() })),
                endsAt:        pollEndsAt || null,
                allowMultiple: pollMulti,
            }));
        }
        return fd;
    };

    const doPost = async () => {
        const result = await dispatch(createPost(buildFormData()));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Post published!");
            resetForm();
            dispatch(clearModerationResult());
        } else {
            toast.error(result.payload || "Failed to publish post");
        }
    };

    const handleSubmit = async () => {
        if (!body.trim() && images.length === 0 && postType !== "poll") {
            toast.error("Write something before posting"); return;
        }
        if (postType === "poll" && pollOpts.some((o) => !o.trim())) {
            toast.error("All poll options must have text"); return;
        }

        // Run moderation on text posts with content
        if (body.trim().length > 10) {
            const res = await dispatch(moderatePostThunk(body.trim()));
            const modResult = res.payload;
            if (modResult && !modResult.safe && modResult.score > 50) {
                setModConfirm(true);
                return;
            }
        }

        await doPost();
    };

    const resetForm = () => {
        setBody(""); setImages([]); setPostType("text");
        setPollOpts(["", ""]); setPollEndsAt(""); setPollMulti(false);
        setAiPanelOpen(false);
        dispatch(clearAiHashtags()); dispatch(clearAiPollOptions());
    };

    const charsLeft = MAX_CHARS - body.length;
    const canSubmit = !composerLoading && !moderating && (body.trim() || images.length > 0 || postType === "poll");

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=4f46e5&color=fff`}
                                alt={user?.profile?.displayName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"
                            />
                            <div>
                                <p className="font-semibold text-white text-sm">{user?.profile?.displayName}</p>
                                {/* Visibility Selector */}
                                <div className="flex items-center gap-1 mt-0.5">
                                    {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon }) => (
                                        <button key={value} onClick={() => setVisibility(value)}
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                                                visibility === value
                                                    ? "bg-green-600 text-white"
                                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                            }`}
                                        >
                                            <Icon className="w-3 h-3" />{label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => dispatch(closeComposer())} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                        {/* Post type toggle */}
                        <div className="flex gap-2">
                            {["text", "poll"].map((t) => (
                                <button key={t} onClick={() => setPostType(t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        postType === t
                                            ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                    }`}
                                >
                                    {t === "text" ? "📝 Post" : "📊 Poll"}
                                </button>
                            ))}
                        </div>

                        {/* AI Writing Panel (toggle) */}
                        {aiPanelOpen ? (
                            <AiWritingPanel
                                currentBody={body}
                                onApply={(newBody) => setBody(newBody)}
                                onClose={() => setAiPanelOpen(false)}
                            />
                        ) : (
                            <button
                                onClick={() => setAiPanelOpen(true)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-500/40 rounded-xl text-violet-300 text-xs font-semibold transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                                ✨ AI Writing Assistant — draft or improve your post
                            </button>
                        )}

                        {/* Text area */}
                        <div className="relative">
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder={postType === "poll" ? "Ask your campus a question..." : "What's on your mind?"}
                                maxLength={MAX_CHARS}
                                rows={postType === "poll" ? 3 : 5}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
                            />
                            <span className={`absolute bottom-3 right-3 text-xs font-mono ${charsLeft < 100 ? "text-amber-400" : "text-slate-600"}`}>
                                {charsLeft}
                            </span>
                        </div>

                        {/* AI Hashtag Chips */}
                        <HashtagChips hashtags={hashtags} onSelect={handleInsertHashtag} />

                        {/* Image grid preview */}
                        {images.length > 0 && (
                            <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                                {images.map((img, i) => (
                                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-800">
                                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                        <button onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Poll builder */}
                        {postType === "poll" && (
                            <div className="space-y-3 bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Poll Options</p>
                                    {/* AI generate poll options */}
                                    <button
                                        onClick={handleGeneratePollOpts}
                                        disabled={pollingGen}
                                        className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold disabled:opacity-50 transition-colors"
                                    >
                                        {pollingGen ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        AI Generate
                                    </button>
                                </div>
                                {pollOpts.map((opt, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input value={opt} onChange={(e) => setPollOption(i, e.target.value)}
                                            placeholder={`Option ${i + 1}`} maxLength={100}
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                                        />
                                        {i >= 2 && (
                                            <button onClick={() => removePollOption(i)} className="text-slate-500 hover:text-rose-400 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {pollOpts.length < 5 && (
                                    <button onClick={addPollOption}
                                        className="flex items-center gap-1.5 text-green-400 hover:text-green-300 text-xs font-semibold transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add option
                                    </button>
                                )}
                                <div className="flex gap-4 items-center pt-2 border-t border-slate-700">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-slate-500">End date (optional)</label>
                                        <input type="datetime-local" value={pollEndsAt} onChange={(e) => setPollEndsAt(e.target.value)}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-green-500"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                                        <input type="checkbox" checked={pollMulti} onChange={(e) => setPollMulti(e.target.checked)}
                                            className="accent-green-600 w-4 h-4" />
                                        <span className="text-xs text-slate-400">Allow multiple selections</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-3 px-6 py-4 border-t border-slate-800 flex-shrink-0">
                        {/* Moderation warning */}
                        {moderationResult && !moderationResult.safe && (
                            <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-xs">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span><strong>AI flagged this content.</strong> {moderationResult.reason} You can still post or edit.</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {postType === "text" && (
                                    <>
                                        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageAdd} />
                                        <button onClick={() => fileRef.current?.click()}
                                            disabled={images.length >= 4}
                                            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-green-400 hover:bg-slate-800 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                            <Image className="w-4 h-4" />
                                            <span className="text-xs">Photo {images.length > 0 ? `(${images.length}/4)` : ""}</span>
                                        </button>
                                    </>
                                )}
                                {/* Hashtag suggest button */}
                                {postType === "text" && (
                                    <button
                                        onClick={handleSuggestHashtags}
                                        disabled={tagging || body.trim().length < 20}
                                        title="AI Hashtag Suggestions"
                                        className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {tagging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                                        <span className="text-xs">Hashtags</span>
                                    </button>
                                )}
                            </div>

                            <button onClick={handleSubmit} disabled={!canSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 disabled:shadow-none">
                                {(composerLoading || moderating) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {composerLoading ? "Publishing..." : moderating ? "Checking…" : "Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Moderation Confirm Modal */}
            <ConfirmModal
                isOpen={modConfirm}
                title="Content Flagged by AI"
                message={`Our AI flagged this content as potentially sensitive${moderationResult?.reason ? `: "${moderationResult.reason}"` : ""}. You can still post it, or go back and make edits.`}
                confirmText="Post Anyway"
                variant="warning"
                onConfirm={async () => { setModConfirm(false); await doPost(); }}
                onCancel={() => { setModConfirm(false); dispatch(clearModerationResult()); }}
            />
        </>
    );
}
