import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MoreHorizontal, MessageCircle, Repeat2, Share2, Trash2, Flag, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { deletePost, openRepostComposer, setActivePost } from "../../redux/slices/feedSlice";
import ReactionPicker, { REACTIONS } from "./ReactionPicker";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../common/Button";

function RoleBadge({ roles = [] }) {
  if (roles.includes("super_admin") || roles.includes("campus_admin")) {
    return (
      <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-[rgb(var(--color-surface-muted)/1)]">
        Admin
      </span>
    );
  }
  if (roles.includes("mentor")) {
    return (
      <span className="rounded border border-info/20 bg-info/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-info">
        Mentor
      </span>
    );
  }
  if (roles.includes("society_head")) {
    return (
      <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-[rgb(var(--color-surface-muted)/1)]">
        Society Head
      </span>
    );
  }
  return null;
}

function MediaGrid({ media, isDark }) {
  const count = media.length;
  if (count === 0) return null;

  const gridClass = count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : count === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className={`grid ${gridClass} gap-1.5 rounded-xl overflow-hidden mt-3`}>
      {media.map((m, i) => (
        <div
          key={i}
          className={`${isDark ? "bg-slate-800" : "bg-slate-100"} ${count === 3 && i === 0 ? "col-span-2" : ""}`}
          style={{ aspectRatio: count === 1 ? "16/9" : "1" }}
        >
          <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function PollBlock({ poll, postId, isDark }) {
  const dispatch = useDispatch();
  const userId = useSelector((s) => s.auth.user?._id);

  const totalVotes = poll.options.reduce((sum, o) => sum + (o.voters?.length || 0), 0);
  const hasVoted = poll.options.some((o) => o.voters?.includes(userId));
  const isEnded = poll.endsAt && new Date() > new Date(poll.endsAt);

  const vote = (idx) => {
    if (hasVoted || isEnded) return;
    dispatch({ type: "feed/voteOnPoll/fulfilled", payload: { postId, poll } });
    import("../../api/postApi").then(({ voteOnPoll }) => voteOnPoll(postId, [idx]).catch(() => {}));
  };

  return (
    <div className="mt-3 space-y-2">
      {poll.options.map((opt, i) => {
        const votes = opt.voters?.length || 0;
        const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
        const voted = opt.voters?.includes(userId);

        return (
          <button
            key={i}
            onClick={() => vote(i)}
            disabled={hasVoted || isEnded}
            className={`group relative w-full overflow-hidden rounded-lg border text-left transition-colors disabled:cursor-default ${
              isDark ? "border-border-dark hover:border-info/50" : "border-border-light hover:border-info/40"
            }`}
          >
            <div className="absolute inset-0 bg-info/10 transition-all duration-500 ease-out" style={{ width: hasVoted ? `${pct}%` : "0%" }} />
            <div className="relative flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                {voted && <CheckCircle className="w-4 h-4 shrink-0 text-info" />}
                <span className={`text-sm ${voted ? "font-semibold text-info" : isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                  {opt.text}
                </span>
              </div>
              {hasVoted && <span className="font-mono text-xs text-text-secondary">{pct}%</span>}
            </div>
          </button>
        );
      })}
      <p className="pt-1 text-xs text-text-secondary">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        {poll.endsAt && <> · {isEnded ? "Ended" : `Ends ${formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true })}`}</>}
      </p>
    </div>
  );
}

function ReactionSummary({ reactions }) {
  if (!reactions?.length) return null;
  const counts = {};
  reactions.forEach((r) => {
    counts[r.type] = (counts[r.type] || 0) + 1;
  });
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

function RepostBanner({ original, isDark }) {
  const [expanded, setExpanded] = useState(false);

  if (!original) return null;
  const author = original.authorId;
  const BODY_LIMIT = 280;
  const bodyTruncated = original.body?.length > BODY_LIMIT && !expanded;
  const bodyDisplay = bodyTruncated ? original.body.substring(0, BODY_LIMIT) + "..." : original.body;

  return (
        <div className={`mt-3 rounded-xl border p-4 ${isDark ? "border-border-dark bg-background-dark/60" : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"}`}>
      <Link to={`/users/${author?._id}`} className="flex items-center gap-2 mb-2 group w-fit">
        <img
          src={author?.profile?.avatar || `https://ui-avatars.com/api/?name=${author?.profile?.displayName}&background=3730a3&color=fff`}
          className={`w-6 h-6 rounded-full object-cover border transition-colors ${isDark ? "border-slate-700 group-hover:border-green-500" : "border-slate-200 group-hover:border-emerald-400"}`}
          alt=""
        />
        <span className={`text-xs font-semibold transition-colors ${isDark ? "text-slate-300 group-hover:text-green-400" : "text-slate-700 group-hover:text-emerald-600"}`}>
          {author?.profile?.displayName}
        </span>
        <span className="text-xs text-slate-600">·</span>
        <span className="text-xs text-slate-500">
          {original.createdAt ? formatDistanceToNow(new Date(original.createdAt), { addSuffix: true }) : ""}
        </span>
      </Link>
      {bodyDisplay && (
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {bodyDisplay.split(/(#\w+|@\w+)/g).map((part, i) =>
            part.startsWith("#") ? (
              <Link key={i} to={`/feed/hashtag/${part.slice(1)}`} className="text-info hover:underline" onClick={(e) => e.stopPropagation()}>
                {part}
              </Link>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
          {bodyTruncated && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(true); }} className="ml-1 text-xs font-semibold text-info hover:underline">
              See more
            </button>
          )}
          {expanded && original.body?.length > BODY_LIMIT && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(false); }} className="ml-1 text-xs font-semibold text-info hover:underline">
              See less
            </button>
          )}
        </p>
      )}
      {original.media?.length > 0 && <img src={original.media[0].url} className="mt-2 w-full rounded-lg object-cover max-h-40" alt="" loading="lazy" />}
    </div>
  );
}

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const userId = useSelector((s) => s.auth.user?._id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const author = post.authorId || {};
  const myReaction =
    post.reactions?.find((r) => r.userId === userId || r.userId?.toString() === userId?.toString())?.type || null;
  const isOwn = author._id === userId || author._id?.toString() === userId?.toString();

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

  const handleRepost = () => {
    setMenuOpen(false);
    dispatch(openRepostComposer(post));
  };

  const handleShare = () => {
    const url = `${window.location.origin}/feed/post/${post._id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied!"));
  };

  return (
    <article className={`rounded-2xl border p-5 transition-colors ${isDark ? "border-border-dark bg-surface-dark hover:border-slate-500" : "border-border-light bg-surface-light hover:border-slate-300 shadow-md"}`}>
      <div className="flex items-start justify-between mb-4">
        <Link to={`/users/${author._id}`} className="flex items-center gap-3 group">
          <img
            src={author.profile?.avatar || `https://ui-avatars.com/api/?name=${author.profile?.displayName}&background=2563eb&color=fff`}
            alt={author.profile?.displayName}
            className={`h-10 w-10 rounded-full border-2 object-cover transition-colors ${isDark ? "border-border-dark group-hover:border-info" : "border-border-light group-hover:border-info/40"}`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isDark ? "text-text-primary-dark group-hover:text-info" : "text-text-primary-light group-hover:text-info"}`}>
                {author.profile?.displayName}
              </span>
              <RoleBadge roles={author.roles || []} />
            </div>
            <p className="text-xs text-text-secondary">
              {author.campusId?.name || ""}
              {author.campusId && " · "}
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
              {post.isEdited && <span className="ml-1 italic">(edited)</span>}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`rounded-lg p-1.5 transition-colors ${isDark ? "text-text-secondary-dark hover:bg-background-dark hover:text-text-primary-dark" : "text-text-secondary-light hover:bg-[rgb(var(--color-surface-muted-light)/1)] hover:text-text-primary-light"}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className={`absolute right-0 top-8 z-20 w-40 rounded-xl border py-1 shadow-lg ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
              {isOwn && (
                <button onClick={handleDelete} className={getButtonClassName({ variant: "danger", size: "sm", className: "w-full justify-start rounded-none border-none bg-transparent px-4 text-danger hover:bg-danger/10" })}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
              <button onClick={() => { setMenuOpen(false); toast("Report feature coming soon"); }} className={getButtonClassName({ variant: "ghost", size: "sm", className: "w-full justify-start rounded-none border-none bg-transparent px-4" })}>
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      {bodyDisplay && (
        <p className={`text-sm leading-relaxed whitespace-pre-wrap mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
          {bodyDisplay.split(/(#\w+|@\w+)/g).map((part, i) =>
            part.startsWith("#") ? (
              <Link key={i} to={`/feed/hashtag/${part.slice(1)}`} className="text-info hover:underline">
                {part}
              </Link>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
          {bodyTruncated && (
            <button onClick={() => setExpanded(true)} className="ml-1 text-xs font-semibold text-info hover:underline">
              See more
            </button>
          )}
          {expanded && post.body?.length > BODY_LIMIT && (
            <button onClick={() => setExpanded(false)} className="ml-1 text-xs font-semibold text-info hover:underline">
              See less
            </button>
          )}
        </p>
      )}

      {!post.isRepost && <MediaGrid media={post.media || []} isDark={isDark} />}
      {post.type === "poll" && post.poll && <PollBlock poll={post.poll} postId={post._id} isDark={isDark} />}
      {post.isRepost && post.repostOf && <RepostBanner original={post.repostOf} isDark={isDark} />}

      <div className="mt-4">
        <ReactionSummary reactions={post.reactions} />
      </div>

      <div className={`my-3 border-t ${isDark ? "border-border-dark" : "border-border-light"}`} />

      <div className="flex items-center gap-1">
        <ReactionPicker postId={post._id} currentReaction={myReaction} />

        <button
          onClick={() => dispatch(setActivePost(post._id))}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${isDark ? "text-text-secondary-dark hover:bg-background-dark hover:text-text-primary-dark" : "text-text-secondary-light hover:bg-[rgb(var(--color-surface-muted-light)/1)] hover:text-text-primary-light"}`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{post.commentCount > 0 ? `${post.commentCount}` : "Comment"}</span>
        </button>

        <button
          onClick={handleRepost}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${isDark ? "text-text-secondary-dark hover:bg-background-dark hover:text-info" : "text-text-secondary-light hover:bg-[rgb(var(--color-surface-muted-light)/1)] hover:text-info"}`}
        >
          <Repeat2 className="w-4 h-4" />
          <span className="hidden sm:inline">{post.repostCount > 0 ? `${post.repostCount}` : "Repost"}</span>
        </button>

        <button
          onClick={handleShare}
          className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${isDark ? "text-text-secondary-dark hover:bg-background-dark hover:text-info" : "text-text-secondary-light hover:bg-[rgb(var(--color-surface-muted-light)/1)] hover:text-info"}`}
        >
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
