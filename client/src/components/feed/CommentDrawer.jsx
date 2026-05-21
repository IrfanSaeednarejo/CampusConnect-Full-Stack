import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Send,
  Loader2,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  clearActivePost,
  fetchComments,
  addComment,
  deleteComment,
} from "../../redux/slices/feedSlice";
import { getCommentReplies } from "../../api/postApi";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";
import Button, { getButtonClassName } from "../common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

function CommentRow({ comment, postId, depth = 0 }) {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const userId = useSelector((s) => s.auth.user?._id);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const author = comment.authorId || {};
  const isOwn =
    author._id === userId || author._id?.toString() === userId?.toString();

  const loadReplies = async () => {
    if (loadingReplies || replies.length > 0) {
      setShowReplies((v) => !v);
      return;
    }

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
      const result = await dispatch(
        addComment({ postId, body: replyText.trim(), parentId: comment._id })
      );
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

  const confirmDelete = async () => {
    setIsDeleting(true);
    await dispatch(deleteComment({ postId, commentId: comment._id }));
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  return (
    <div className={depth > 0 ? "border-l border-slate-800 pl-10" : ""}>
      <div className="flex gap-3 py-3">
        <img
          src={
            author.profile?.avatar ||
            `https://ui-avatars.com/api/?name=${author.profile?.displayName}&background=4f46e5&color=fff`
          }
          className="h-8 w-8 shrink-0 rounded-full border border-slate-700 object-cover"
          alt=""
        />
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-slate-800 px-4 py-3">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-xs font-semibold text-white">
                {author.profile?.displayName}
              </span>
              <span className="text-[10px] text-slate-500">
                {comment.createdAt
                  ? formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })
                  : ""}
              </span>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                comment.isDeleted ? "italic text-slate-600" : "text-slate-300"
              }`}
            >
              {comment.body}
            </p>
          </div>

          {!comment.isDeleted && (
            <div className="mt-1.5 flex items-center gap-3 pl-2">
              {depth === 0 && (
                <button
                  type="button"
                  onClick={() => setReplying((v) => !v)}
                  className={getButtonClassName({
                    variant: "ghost",
                    size: "sm",
                    isDark,
                    className:
                      "min-w-0 px-0 text-xs font-semibold text-slate-500 hover:text-green-400",
                  })}
                >
                  Reply
                </button>
              )}
              {isOwn && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className={getButtonClassName({
                    variant: "ghost",
                    size: "sm",
                    isDark,
                    className:
                      "min-w-0 px-0 text-xs font-semibold text-slate-500 hover:text-rose-400",
                  })}
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {comment.replyCount > 0 && depth === 0 && (
            <button
              type="button"
              onClick={loadReplies}
              className={getButtonClassName({
                variant: "ghost",
                size: "sm",
                isDark,
                className:
                  "mt-2 min-w-0 gap-1.5 px-2 text-xs font-semibold text-green-400 hover:text-green-300",
              })}
            >
              {loadingReplies ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    showReplies ? "rotate-180" : ""
                  }`}
                />
              )}
              {showReplies
                ? "Hide"
                : `View ${comment.replyCount} repl${
                    comment.replyCount === 1 ? "y" : "ies"
                  }`}
            </button>
          )}

          {replying && depth === 0 && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && submitReply()
                }
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-green-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={submitReply}
                disabled={submitting || !replyText.trim()}
                className={getButtonClassName({
                  variant: "primary",
                  size: "icon-sm",
                  isDark,
                  className: "px-3 py-2",
                  iconOnly: true,
                })}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          {showReplies &&
            replies.map((reply) => (
              <CommentRow
                key={reply._id}
                comment={reply}
                postId={postId}
                depth={1}
              />
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

export default function CommentDrawer() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const { activePostId, docs: feedDocs, comments: commentsMap } = useSelector(
    (s) => s.feed
  );
  const user = useSelector((s) => s.auth.user);

  const post = feedDocs.find((p) => p._id === activePostId);
  const commentData = commentsMap[activePostId] || {
    docs: [],
    pagination: {},
    loading: false,
  };

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!activePostId) return;
    dispatch(fetchComments({ postId: activePostId, page: 1 }));
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [activePostId, dispatch]);

  if (!activePostId) return null;

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const result = await dispatch(
        addComment({ postId: activePostId, body: body.trim() })
      );
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
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => dispatch(clearActivePost())}
      />

      <div className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-400" />
            <h2 className="text-sm font-bold text-white">
              Comments {post?.commentCount > 0 ? `(${post.commentCount})` : ""}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearActivePost())}
            className={getButtonClassName({
              variant: "ghost",
              size: "icon-sm",
              isDark,
              className: "rounded-lg shadow-none",
              iconOnly: true,
            })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {post && (
          <div className="shrink-0 border-b border-slate-800 bg-slate-900/50 px-5 py-3">
            <p className="line-clamp-2 text-xs text-slate-500">
              {post.body || "Media post"}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {commentData.loading && commentData.docs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          ) : commentData.docs.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-700" />
              <p className="text-sm text-slate-500">
                No comments yet. Be the first!
              </p>
            </div>
          ) : (
            <>
              {commentData.docs.map((comment) => (
                <CommentRow
                  key={comment._id}
                  comment={comment}
                  postId={activePostId}
                  depth={0}
                />
              ))}
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={commentData.loading}
                  className={getButtonClassName({
                    variant: "ghost",
                    size: "sm",
                    isDark,
                    className:
                      "w-full py-3 text-xs font-semibold text-green-400 hover:text-green-300",
                  })}
                >
                  {commentData.loading ? "Loading..." : "Load more comments"}
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 gap-3 border-t border-slate-800 bg-slate-950 px-5 py-4">
          <img
            src={
              user?.profile?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=4f46e5&color=fff`
            }
            className="h-8 w-8 shrink-0 rounded-full border border-slate-700 object-cover"
            alt=""
          />
          <div className="flex flex-1 gap-2">
            <textarea
              ref={inputRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-green-500 focus:outline-none"
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
              variant="primary"
              size="icon-sm"
              className="self-end px-3 py-2.5 font-semibold"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
