import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Send, Loader2, MessageCircle, Trash2, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { clearActivePost, fetchComments, addComment, deleteComment } from "../../redux/slices/feedSlice";
import { getCommentReplies } from "../../api/postApi";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";

// ── Single comment row ────────────────────────────────────────────────────────
function CommentRow({ comment, postId, depth = 0 }) {
    const dispatch    = useDispatch();
    const userId      = useSelector((s) => s.auth.user?._id);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const author  = comment.authorId || {};
    const isOwn   = author._id === userId || author._id?.toString() === userId?.toString();

    const loadReplies = async () => {
        if (loadingReplies || replies.length > 0) { setShowReplies((v) => !v); return; }
        setLoadingReplies(true);
        try {
            const { data } = await getCommentReplies(postId, comment._id);
            setReplies(data.data?.docs || []);
            setShowReplies(true);
        } catch {
            toast.error("Failed to load replies");
        } finally {
            setLoadingReplies(false);
        }
    };

    const submitReply = async () => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            const result = await dispatch(addComment({ postId, body: replyText.trim(), parentId: comment._id }));
            if (result.meta.requestStatus === "fulfilled") {
                setReplies((r) => [result.payload.comment, ...r]);
                setShowReplies(true);
                setReplyText("");
                setReplying(false);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        await dispatch(deleteComment({ postId, commentId: comment._id }));
        setIsDeleting(false);
        setShowDeleteModal(false);
    };

    return (
        <div className={depth > 0 ? "pl-10 border-l border-slate-800" : ""}>
            <div className="flex gap-3 py-3">
                <img src={author.profile?.avatar || `https://ui-avatars.com/api/?name=${author.profile?.displayName}&background=4f46e5&color=fff`}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-800 rounded-2xl px-4 py-3">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-semibold text-white">{author.profile?.displayName}</span>
                            <span className="text-[10px] text-slate-500">
                                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ""}
                            </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${comment.isDeleted ? "text-slate-600 italic" : "text-slate-300"}`}>
                            {comment.body}
                        </p>
                    </div>

                    {!comment.isDeleted && (
                        <div className="flex items-center gap-3 mt-1.5 pl-2">
                            {depth === 0 && (
                                <button onClick={() => setReplying((v) => !v)} className="text-xs text-slate-500 hover:text-green-400 font-semibold transition-colors">
                                    Reply
                                </button>
                            )}
                            {isOwn && (
                                <button onClick={handleDelete} className="text-xs text-slate-500 hover:text-rose-400 font-semibold transition-colors">
                                    Delete
                                </button>
                            )}
                        </div>
                    )}

                    {/* Load replies toggle */}
                    {comment.replyCount > 0 && depth === 0 && (
                        <button onClick={loadReplies} className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 font-semibold mt-2 pl-2 transition-colors">
                            {loadingReplies
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <ChevronDown className={`w-3 h-3 transition-transform ${showReplies ? "rotate-180" : ""}`} />
                            }
                            {showReplies ? "Hide" : `View ${comment.replyCount} repl${comment.replyCount === 1 ? "y" : "ies"}`}
                        </button>
                    )}

                    {/* Reply input */}
                    {replying && depth === 0 && (
                        <div className="flex gap-2 mt-2">
                            <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitReply()}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                            />
                            <button onClick={submitReply} disabled={submitting || !replyText.trim()}
                                className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white rounded-xl transition-colors">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    )}

                    {/* Replies */}
                    {showReplies && replies.map((reply) => (
                        <CommentRow key={reply._id} comment={reply} postId={postId} depth={1} />
                    ))}
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action is permanent."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
export default function CommentDrawer() {
    const dispatch  = useDispatch();
    const { activePostId, docs: feedDocs, comments: commentsMap } = useSelector((s) => s.feed);
    const user = useSelector((s) => s.auth.user);

    const post        = feedDocs.find((p) => p._id === activePostId);
    const commentData = commentsMap[activePostId] || { docs: [], pagination: {}, loading: false };

    const [body,       setBody]       = useState("");
    const [submitting, setSubmitting] = useState(false);
    const inputRef    = useRef(null);

    // Load comments when drawer opens
    useEffect(() => {
        if (!activePostId) return;
        dispatch(fetchComments({ postId: activePostId, page: 1 }));
        setTimeout(() => inputRef.current?.focus(), 200);
    }, [activePostId]);

    if (!activePostId) return null;

    const handleSubmit = async () => {
        if (!body.trim()) return;
        setSubmitting(true);
        try {
            const result = await dispatch(addComment({ postId: activePostId, body: body.trim() }));
            if (result.meta.requestStatus === "fulfilled") {
                setBody("");
                toast.success("Comment added");
            } else {
                toast.error("Failed to add comment");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const loadMore = () => {
        const nextPage = (commentData.pagination?.page || 1) + 1;
        dispatch(fetchComments({ postId: activePostId, page: nextPage }));
    };

    const hasMore = commentData.pagination?.page < commentData.pagination?.pages;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => dispatch(clearActivePost())} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-400" />
                        <h2 className="font-bold text-white text-sm">
                            Comments {post?.commentCount > 0 ? `(${post.commentCount})` : ""}
                        </h2>
                    </div>
                    <button onClick={() => dispatch(clearActivePost())} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Original post preview */}
                {post && (
                    <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
                        <p className="text-xs text-slate-500 line-clamp-2">{post.body || "📷 Media post"}</p>
                    </div>
                )}

                {/* Comments list */}
                <div className="flex-1 overflow-y-auto px-5">
                    {commentData.loading && commentData.docs.length === 0 ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>
                    ) : commentData.docs.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No comments yet. Be the first!</p>
                        </div>
                    ) : (
                        <>
                            {commentData.docs.map((comment) => (
                                <CommentRow key={comment._id} comment={comment} postId={activePostId} depth={0} />
                            ))}
                            {hasMore && (
                                <button onClick={loadMore} disabled={commentData.loading}
                                    className="w-full py-3 text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">
                                    {commentData.loading ? "Loading..." : "Load more comments"}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Comment input */}
                <div className="flex gap-3 px-5 py-4 border-t border-slate-800 bg-slate-950 flex-shrink-0">
                    <img src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=4f46e5&color=fff`}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" />
                    <div className="flex-1 flex gap-2">
                        <textarea ref={inputRef} value={body} onChange={(e) => setBody(e.target.value)}
                            placeholder="Write a comment..."
                            rows={2}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500 resize-none transition-colors"
                        />
                        <button onClick={handleSubmit} disabled={submitting || !body.trim()}
                            className="px-3 self-end py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
