import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Globe, Users, Building2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { repostPost, closeRepostComposer } from "../../redux/slices/feedSlice";
import toast from "react-hot-toast";

const VISIBILITY_OPTIONS = [
    { value: "public",      label: "Public",       icon: Globe },
    { value: "campus",      label: "Campus Only",  icon: Building2 },
    { value: "connections", label: "Connections",  icon: Users },
];

const MAX_CHARS = 500;

export default function RepostComposer() {
    const dispatch = useDispatch();
    const { composerLoading, repostOriginalPost: original } = useSelector((s) => s.feed);
    const user = useSelector((s) => s.auth.user);

    const [comment, setComment] = useState("");
    const [visibility, setVisibility] = useState("public");

    if (!original) return null;
    const author = original.authorId;

    const handleSubmit = async () => {
        const result = await dispatch(repostPost({ postId: original._id, comment: comment.trim() }));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Repost published!");
        } else {
            toast.error(result.payload || "Failed to repost");
        }
    };

    const charsLeft = MAX_CHARS - comment.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <img src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=22c55e&color=fff`}
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
                                        }`}>
                                        <Icon className="w-3 h-3" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => dispatch(closeRepostComposer())} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Text area */}
                    <div className="relative">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment to your repost (optional)..."
                            maxLength={MAX_CHARS}
                            rows={3}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <span className={`absolute bottom-3 right-3 text-xs font-mono ${charsLeft < 50 ? "text-amber-400" : "text-slate-600"}`}>
                            {charsLeft}
                        </span>
                    </div>

                    {/* Original Post Preview */}
                    <div className="border border-slate-700/70 rounded-xl p-4 bg-slate-800/40 pointer-events-none">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={author?.profile?.avatar || `https://ui-avatars.com/api/?name=${author?.profile?.displayName}&background=22c55e&color=fff`}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700" alt="" />
                            <span className="text-xs font-semibold text-slate-300">{author?.profile?.displayName}</span>
                            <span className="text-xs text-slate-600">·</span>
                            <span className="text-xs text-slate-500">{original.createdAt ? formatDistanceToNow(new Date(original.createdAt), { addSuffix: true }) : ""}</span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-3">{original.body}</p>
                        {original.media?.length > 0 && (
                            <img src={original.media[0].url} className="mt-2 w-full rounded-lg object-cover max-h-40" alt="" loading="lazy" />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 flex-shrink-0">
                    <button onClick={handleSubmit} disabled={composerLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 disabled:shadow-none">
                        {composerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {composerLoading ? "Publishing..." : "Repost"}
                    </button>
                </div>
            </div>
        </div>
    );
}
