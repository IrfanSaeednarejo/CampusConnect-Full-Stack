import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MoreHorizontal, MessageCircle, Repeat2, Share2, Trash2, Flag, Edit3, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { deletePost, openRepostComposer, setActivePost } from "../../redux/slices/feedSlice";
import ReactionPicker, { REACTIONS } from "./ReactionPicker";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";

// ── Role Badge ────────────────────────────────────────────────────────────────
function RoleBadge({ roles = [] }) {
    if (roles.includes("super_admin") || roles.includes("campus_admin")) return (
        <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded uppercase tracking-wider">Admin</span>
    );
    if (roles.includes("mentor")) return (
        <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold rounded uppercase tracking-wider">🎓 Mentor</span>
    );
    if (roles.includes("society_head")) return (
        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded uppercase tracking-wider">Society Head</span>
    );
    return null;
}

// ── Media Grid ────────────────────────────────────────────────────────────────
function MediaGrid({ media }) {
    const count = media.length;
    if (count === 0) return null;

    const gridClass = count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : count === 3 ? "grid-cols-3" : "grid-cols-2";

    return (
        <div className={`grid ${gridClass} gap-1.5 rounded-xl overflow-hidden mt-3`}>
            {media.map((m, i) => (
                <div key={i} className={`bg-slate-800 ${count === 3 && i === 0 ? "col-span-2" : ""}`} style={{ aspectRatio: count === 1 ? "16/9" : "1" }}>
                    <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
            ))}
        </div>
    );
}

// ── Poll Block ────────────────────────────────────────────────────────────────
function PollBlock({ poll, postId }) {
    const dispatch = useDispatch();
    const userId   = useSelector((s) => s.auth.user?._id);

    const totalVotes = poll.options.reduce((sum, o) => sum + (o.voters?.length || 0), 0);
    const hasVoted   = poll.options.some((o) => o.voters?.includes(userId));
    const isEnded    = poll.endsAt && new Date() > new Date(poll.endsAt);

    const vote = (idx) => {
        if (hasVoted || isEnded) return;
        dispatch({ type: "feed/voteOnPoll/fulfilled", payload: { postId, poll } }); // optimistic
        import("../../api/postApi").then(({ voteOnPoll }) =>
            voteOnPoll(postId, [idx]).catch(() => {})
        );
    };

    return (
        <div className="mt-3 space-y-2">
            {poll.options.map((opt, i) => {
                const votes   = opt.voters?.length || 0;
                const pct     = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                const voted   = opt.voters?.includes(userId);

                return (
                    <button key={i} onClick={() => vote(i)} disabled={hasVoted || isEnded}
                        className="w-full text-left relative overflow-hidden rounded-lg border border-slate-700 hover:border-green-500 disabled:cursor-default transition-colors group">
                        <div className="absolute inset-0 bg-green-500/10 transition-all duration-500 ease-out" style={{ width: hasVoted ? `${pct}%` : "0%" }} />
                        <div className="relative flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                {voted && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                                <span className={`text-sm ${voted ? "text-green-300 font-semibold" : "text-slate-300"}`}>{opt.text}</span>
                            </div>
                            {hasVoted && <span className="text-xs text-slate-500 font-mono">{pct}%</span>}
                        </div>
                    </button>
                );
            })}
            <p className="text-xs text-slate-500 pt-1">
                {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                {poll.endsAt && (
                    <> · {isEnded ? "Ended" : `Ends ${formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true })}`}</>
                )}
            </p>
        </div>
    );
}

// ── Reaction Summary ──────────────────────────────────────────────────────────
function ReactionSummary({ reactions }) {
    if (!reactions?.length) return null;
    const counts = {};
    reactions.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const total = reactions.length;
    const emojis = top.map(([type]) => REACTIONS.find((r) => r.type === type)?.emoji);

    return (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <span>{emojis.join("")}</span>
            <span>{total}</span>
        </div>
    );
}

// ── Repost Banner ─────────────────────────────────────────────────────────────
function RepostBanner({ original }) {
    const [expanded, setExpanded] = useState(false);

    if (!original) return null;
    const author = original.authorId;
    
    const BODY_LIMIT = 280;
    const bodyTruncated = original.body?.length > BODY_LIMIT && !expanded;
    const bodyDisplay = bodyTruncated ? original.body.substring(0, BODY_LIMIT) + "..." : original.body;

    return (
        <div className="mt-3 border border-slate-700/70 rounded-xl p-4 bg-slate-800/40">
            <Link to={`/users/${author?._id}`} className="flex items-center gap-2 mb-2 group w-fit">
                <img src={author?.profile?.avatar || `https://ui-avatars.com/api/?name=${author?.profile?.displayName}&background=3730a3&color=fff`}
                    className="w-6 h-6 rounded-full object-cover border border-slate-700 group-hover:border-green-500 transition-colors" alt="" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-green-400 transition-colors">{author?.profile?.displayName}</span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-slate-500">{original.createdAt ? formatDistanceToNow(new Date(original.createdAt), { addSuffix: true }) : ""}</span>
            </Link>
            {bodyDisplay && (
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {bodyDisplay.split(/(#\w+|@\w+)/g).map((part, i) =>
                        part.startsWith("#") ? (
                            <Link key={i} to={`/feed/hashtag/${part.slice(1)}`} className="text-green-400 hover:underline" onClick={(e) => e.stopPropagation()}>{part}</Link>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                    {bodyTruncated && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(true); }} className="text-green-400 hover:underline ml-1 text-xs font-semibold">See more</button>
                    )}
                    {expanded && original.body?.length > BODY_LIMIT && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(false); }} className="text-green-400 hover:underline ml-1 text-xs font-semibold">See less</button>
                    )}
                </p>
            )}
            {original.media?.length > 0 && (
                <img src={original.media[0].url} className="mt-2 w-full rounded-lg object-cover max-h-40" alt="" loading="lazy" />
            )}
        </div>
    );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
export default function PostCard({ post }) {
    const dispatch  = useDispatch();
    const userId    = useSelector((s) => s.auth.user?._id);
    const [menuOpen, setMenuOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const author   = post.authorId || {};
    const isOwn    = author._id === userId || author._id?.toString() === userId?.toString();
    const myReaction = post.reactions?.find((r) => r.userId === userId || r.userId?.toString() === userId?.toString())?.type || null;

    const BODY_LIMIT = 280;
    const bodyTruncated = post.body?.length > BODY_LIMIT && !expanded;
    const bodyDisplay = bodyTruncated ? post.body.substring(0, BODY_LIMIT) + "..." : post.body;

    const handleDelete = () => {
        setMenuOpen(false);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const r = await dispatch(deletePost(post._id));
        if (r.meta.requestStatus === "fulfilled") toast.success("Post deleted");
        else toast.error("Failed to delete post");
        setIsDeleting(false);
        setShowDeleteModal(false);
    };

    const handleRepost = async () => {
        setMenuOpen(false);
        dispatch(openRepostComposer(post));
    };

    const handleShare = () => {
        const url = `${window.location.origin}/feed/post/${post._id}`;
        navigator.clipboard.writeText(url).then(() => toast.success("Link copied!"));
    };

    return (
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors">

            {/* Author header */}
            <div className="flex items-start justify-between mb-4">
                <Link to={`/users/${author._id}`} className="flex items-center gap-3 group">
                    <img src={author.profile?.avatar || `https://ui-avatars.com/api/?name=${author.profile?.displayName}&background=4f46e5&color=fff`}
                        alt={author.profile?.displayName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-green-500 transition-colors"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white group-hover:text-green-300 transition-colors">
                                {author.profile?.displayName}
                            </span>
                            <RoleBadge roles={author.roles || []} />
                        </div>
                        <p className="text-xs text-slate-500">
                            {author.campusId?.name || ""}
                            {author.campusId && " · "}
                            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
                            {post.isEdited && <span className="ml-1 italic">(edited)</span>}
                        </p>
                    </div>
                </Link>

                {/* Menu */}
                <div className="relative">
                    <button onClick={() => setMenuOpen((v) => !v)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-8 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 py-1 w-40">
                            {isOwn && (
                                <button onClick={handleDelete}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-400 hover:bg-slate-800 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            )}
                            <button onClick={() => { setMenuOpen(false); toast("Report feature coming soon"); }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 transition-colors">
                                <Flag className="w-3.5 h-3.5" /> Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            {bodyDisplay && (
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-2">
                    {bodyDisplay.split(/(#\w+|@\w+)/g).map((part, i) =>
                        part.startsWith("#") ? (
                            <Link key={i} to={`/feed/hashtag/${part.slice(1)}`} className="text-green-400 hover:underline">{part}</Link>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                    {bodyTruncated && (
                        <button onClick={() => setExpanded(true)} className="text-green-400 hover:underline ml-1 text-xs font-semibold">See more</button>
                    )}
                    {expanded && post.body?.length > BODY_LIMIT && (
                        <button onClick={() => setExpanded(false)} className="text-green-400 hover:underline ml-1 text-xs font-semibold">See less</button>
                    )}
                </p>
            )}

            {/* Media */}
            {!post.isRepost && <MediaGrid media={post.media || []} />}

            {/* Poll */}
            {post.type === "poll" && post.poll && <PollBlock poll={post.poll} postId={post._id} />}

            {/* Repost original */}
            {post.isRepost && post.repostOf && <RepostBanner original={post.repostOf} />}

            {/* Reaction summary */}
            <div className="mt-4">
                <ReactionSummary reactions={post.reactions} />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800 my-3" />

            {/* Action bar */}
            <div className="flex items-center gap-1">
                <ReactionPicker postId={post._id} currentReaction={myReaction} />

                <button onClick={() => dispatch(setActivePost(post._id))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold transition-all">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">{post.commentCount > 0 ? `${post.commentCount}` : "Comment"}</span>
                </button>

                <button onClick={handleRepost}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-emerald-400 hover:bg-slate-800 font-semibold transition-all">
                    <Repeat2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{post.repostCount > 0 ? `${post.repostCount}` : "Repost"}</span>
                </button>

                <button onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-green-400 hover:bg-slate-800 font-semibold transition-all ml-auto">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action is permanent and cannot be undone."
                confirmText="Delete Post"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                variant="danger"
                loading={isDeleting}
            />
        </article>
    );
}
