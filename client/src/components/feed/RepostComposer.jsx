import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Globe, Users, Building2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { repostPost, closeRepostComposer } from "../../redux/slices/feedSlice";
import toast from "react-hot-toast";
import Button, { getButtonClassName } from "../common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe },
  { value: "campus", label: "Campus Only", icon: Building2 },
  { value: "connections", label: "Connections", icon: Users },
];

const MAX_CHARS = 500;

export default function RepostComposer() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const { composerLoading, repostOriginalPost: original } = useSelector(
    (s) => s.feed
  );
  const user = useSelector((s) => s.auth.user);

  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState("public");

  if (!original) return null;
  const author = original.authorId;

  const handleSubmit = async () => {
    const result = await dispatch(
      repostPost({ postId: original._id, comment: comment.trim() })
    );
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Repost published!");
    } else {
      toast.error(result.payload || "Failed to repost");
    }
  };

  const charsLeft = MAX_CHARS - comment.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.profile?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=22c55e&color=fff`
              }
              alt={user?.profile?.displayName}
              className="h-10 w-10 rounded-full border-2 border-slate-700 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white">
                {user?.profile?.displayName}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVisibility(value)}
                    className={getButtonClassName({
                      variant: visibility === value ? "primary" : "ghost",
                      size: "sm",
                      isDark,
                      className:
                        "h-7 min-w-0 gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold shadow-none",
                    })}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(closeRepostComposer())}
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

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment to your repost (optional)..."
              maxLength={MAX_CHARS}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-green-500 focus:outline-none"
            />
            <span
              className={`absolute bottom-3 right-3 text-xs font-mono ${
                charsLeft < 50 ? "text-amber-400" : "text-slate-600"
              }`}
            >
              {charsLeft}
            </span>
          </div>

          <div className="pointer-events-none rounded-xl border border-slate-700/70 bg-slate-800/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <img
                src={
                  author?.profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${author?.profile?.displayName}&background=22c55e&color=fff`
                }
                className="h-6 w-6 rounded-full border border-slate-700 object-cover"
                alt=""
              />
              <span className="text-xs font-semibold text-slate-300">
                {author?.profile?.displayName}
              </span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">
                {original.createdAt
                  ? formatDistanceToNow(new Date(original.createdAt), {
                      addSuffix: true,
                    })
                  : ""}
              </span>
            </div>
            <p className="line-clamp-3 text-sm text-slate-400">
              {original.body}
            </p>
            {original.media?.length > 0 && (
              <img
                src={original.media[0].url}
                className="mt-2 max-h-40 w-full rounded-lg object-cover"
                alt=""
                loading="lazy"
              />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end border-t border-slate-800 px-6 py-4">
          <Button
            onClick={handleSubmit}
            disabled={composerLoading}
            variant="primary"
            size="md"
            className="px-6 py-2.5 font-bold"
          >
            {composerLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {composerLoading ? "Publishing..." : "Repost"}
          </Button>
        </div>
      </div>
    </div>
  );
}
