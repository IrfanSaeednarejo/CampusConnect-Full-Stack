import { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Image,
  Globe,
  Users,
  Building2,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Hash,
  AlertTriangle,
} from "lucide-react";
import {
  createPost,
  closeComposer,
  suggestHashtagsThunk,
  generatePollThunk,
  moderatePostThunk,
  clearAiHashtags,
  clearAiPollOptions,
  clearModerationResult,
} from "../../redux/slices/feedSlice";
import toast from "react-hot-toast";
import AiWritingPanel from "./AiWritingPanel";
import HashtagChips from "./HashtagChips";
import ConfirmModal from "../common/ConfirmModal";
import Button, { getButtonClassName } from "../common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe },
  { value: "campus", label: "Campus Only", icon: Building2 },
  { value: "connections", label: "Connections", icon: Users },
];

const MAX_CHARS = 2000;

export default function PostComposer() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const { composerLoading } = useSelector((s) => s.feed);
  const {
    tagging,
    pollingGen,
    moderating,
    suggestions: { hashtags },
    moderationResult,
  } = useSelector((s) => s.feed.ai);
  const user = useSelector((s) => s.auth.user);

  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [visibility, setVisibility] = useState("campus");
  const [postType, setPostType] = useState("text");
  const [pollOpts, setPollOpts] = useState(["", ""]);
  const [pollEndsAt, setPollEndsAt] = useState("");
  const [pollMulti, setPollMulti] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [modConfirm, setModConfirm] = useState(false);

  const fileRef = useRef(null);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      toast.error("Maximum 4 images per post");
      return;
    }

    setImages((p) => [
      ...p,
      ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(images[idx].preview);
    setImages((p) => p.filter((_, i) => i !== idx));
  };

  const addPollOption = () => {
    if (pollOpts.length < 5) setPollOpts((p) => [...p, ""]);
  };

  const removePollOption = (idx) => {
    if (pollOpts.length > 2) {
      setPollOpts((p) => p.filter((_, i) => i !== idx));
    }
  };

  const setPollOption = (idx, val) => {
    setPollOpts((p) => p.map((o, i) => (i === idx ? val : o)));
  };

  const handleSuggestHashtags = () => {
    if (body.trim().length < 20) {
      toast.error("Write more before suggesting hashtags");
      return;
    }

    dispatch(clearAiHashtags());
    dispatch(suggestHashtagsThunk(body.trim()))
      .unwrap()
      .catch((err) => toast.error(err || "Could not suggest hashtags"));
  };

  const handleInsertHashtag = useCallback((tag) => {
    setBody((prev) => {
      const separator =
        prev.endsWith(" ") || prev.endsWith("\n") || prev === "" ? "" : " ";
      return prev + separator + tag;
    });
  }, []);

  const handleGeneratePollOpts = () => {
    const question = body.trim() || pollOpts[0];
    if (!question) {
      toast.error("Enter a question first");
      return;
    }

    dispatch(clearAiPollOptions());
    dispatch(generatePollThunk(question))
      .unwrap()
      .then((res) => {
        const opts = res?.options || [];
        if (opts.length) setPollOpts(opts.map((o) => o.slice(0, 100)));
      })
      .catch((err) => toast.error(err || "Could not generate poll options"));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("body", body.trim());
    fd.append("type", postType);
    fd.append("visibility", visibility);
    images.forEach((img) => fd.append("images", img.file));

    if (postType === "poll") {
      fd.append(
        "poll",
        JSON.stringify({
          options: pollOpts.map((o) => ({ text: o.trim() })),
          endsAt: pollEndsAt || null,
          allowMultiple: pollMulti,
        })
      );
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
      toast.error("Write something before posting");
      return;
    }

    if (postType === "poll" && pollOpts.some((o) => !o.trim())) {
      toast.error("All poll options must have text");
      return;
    }

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
    setBody("");
    setImages([]);
    setPostType("text");
    setPollOpts(["", ""]);
    setPollEndsAt("");
    setPollMulti(false);
    setAiPanelOpen(false);
    dispatch(clearAiHashtags());
    dispatch(clearAiPollOptions());
  };

  const charsLeft = MAX_CHARS - body.length;
  const canSubmit =
    !composerLoading &&
    !moderating &&
    (body.trim() || images.length > 0 || postType === "poll");

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className={`flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
          <div className={`flex shrink-0 items-center justify-between border-b px-6 py-4 ${isDark ? "border-border-dark" : "border-border-light"}`}>
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=2563eb&color=fff`
                }
                alt={user?.profile?.displayName}
                className={`h-10 w-10 rounded-full border-2 object-cover ${isDark ? "border-border-dark" : "border-border-light"}`}
              />
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
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
              onClick={() => dispatch(closeComposer())}
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
            <div className="flex gap-2">
              {["text", "poll"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPostType(t)}
                  className={getButtonClassName({
                    variant: postType === t ? "primary" : "secondary",
                    size: "sm",
                    isDark,
                    className:
                      "min-w-0 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
                  })}
                >
                  {t === "text" ? "Text Post" : "Poll"}
                </button>
              ))}
            </div>

            {aiPanelOpen ? (
              <AiWritingPanel
                currentBody={body}
                onApply={(newBody) => setBody(newBody)}
                onClose={() => setAiPanelOpen(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAiPanelOpen(true)}
                className={getButtonClassName({
                  variant: "ghost",
                  size: "sm",
                  isDark,
                  className:
                    "w-full justify-start border border-info/20 bg-info/10 px-3 py-2 text-xs font-semibold text-info hover:border-info/40 hover:bg-info/15 hover:text-info",
                })}
              >
                <Sparkles className="h-3.5 w-3.5 text-info" />
                AI Writing Assistant - draft or improve your post
              </button>
            )}

            <div className="relative">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  postType === "poll"
                    ? "Ask your campus a question..."
                    : "What's on your mind?"
                }
                maxLength={MAX_CHARS}
                rows={postType === "poll" ? 3 : 5}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none ${
                  isDark
                    ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
                    : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light"
                }`}
              />
              <span
                className={`absolute bottom-3 right-3 text-xs font-mono ${
                  charsLeft < 100 ? "text-amber-400" : "text-slate-600"
                }`}
              >
                {charsLeft}
              </span>
            </div>

            <HashtagChips hashtags={hashtags} onSelect={handleInsertHashtag} />

            {images.length > 0 && (
              <div
                className={`grid gap-2 ${
                  images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`group relative aspect-square overflow-hidden rounded-xl ${isDark ? "bg-background-dark" : "bg-[rgb(var(--color-surface-muted-light)/1)]"}`}
                  >
                    <img
                      src={img.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className={getButtonClassName({
                        variant: "ghost",
                        size: "icon-sm",
                        isDark,
                        className:
                          "absolute right-2 top-2 rounded-full border-black/40 bg-black/70 p-1 text-white opacity-0 shadow-none transition-opacity hover:bg-black group-hover:opacity-100",
                        iconOnly: true,
                      })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {postType === "poll" && (
              <div className={`space-y-3 rounded-xl border p-4 ${isDark ? "border-border-dark bg-background-dark/60" : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    Poll Options
                  </p>
                  <button
                    type="button"
                    onClick={handleGeneratePollOpts}
                    disabled={pollingGen}
                    className={getButtonClassName({
                      variant: "ghost",
                      size: "sm",
                      isDark,
                      className: "min-w-0 gap-1 px-2 py-1 text-xs font-semibold text-info hover:text-info",
                    })}
                  >
                    {pollingGen ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    AI Generate
                  </button>
                </div>

                {pollOpts.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => setPollOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      maxLength={100}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none ${
                        isDark
                          ? "border-border-dark bg-surface-dark text-text-primary-dark placeholder:text-text-secondary-dark"
                          : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light"
                      }`}
                    />
                    {i >= 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(i)}
                        className={getButtonClassName({
                          variant: "ghost",
                          size: "icon-sm",
                          isDark,
                          className: "rounded-lg text-text-secondary-light hover:text-danger dark:text-text-secondary-dark dark:hover:text-danger",
                          iconOnly: true,
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {pollOpts.length < 5 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className={getButtonClassName({
                      variant: "ghost",
                      size: "sm",
                      isDark,
                      className:
                        "min-w-0 gap-1.5 px-0 text-xs font-semibold text-info hover:text-info",
                    })}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add option
                  </button>
                )}

                <div className={`flex items-center gap-4 border-t pt-2 ${isDark ? "border-border-dark" : "border-border-light"}`}>
                  <div className="flex flex-col gap-1">
                    <label className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                      End date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={pollEndsAt}
                      onChange={(e) => setPollEndsAt(e.target.value)}
                      className={`rounded-lg border px-2 py-1 text-xs focus:border-primary focus:outline-none ${
                        isDark
                          ? "border-border-dark bg-surface-dark text-text-primary-dark"
                          : "border-border-light bg-surface-light text-text-primary-light"
                      }`}
                    />
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pollMulti}
                      onChange={(e) => setPollMulti(e.target.checked)}
                      className="h-4 w-4 accent-green-600"
                    />
                    <span className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                      Allow multiple selections
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className={`flex shrink-0 flex-col gap-3 border-t px-6 py-4 ${isDark ? "border-border-dark" : "border-border-light"}`}>
            {moderationResult && !moderationResult.safe && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>AI flagged this content.</strong>{" "}
                  {moderationResult.reason} You can still post or edit.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {postType === "text" && (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageAdd}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={images.length >= 4}
                      className={getButtonClassName({
                        variant: "ghost",
                        size: "sm",
                        isDark,
                        className:
                          "min-w-0 gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary-light hover:text-info dark:text-text-secondary-dark dark:hover:text-info",
                      })}
                    >
                      <Image className="h-4 w-4" />
                      <span className="text-xs">
                        Photo {images.length > 0 ? `(${images.length}/4)` : ""}
                      </span>
                    </button>
                  </>
                )}

                {postType === "text" && (
                  <button
                    type="button"
                    onClick={handleSuggestHashtags}
                    disabled={tagging || body.trim().length < 20}
                    title="AI Hashtag Suggestions"
                    className={getButtonClassName({
                      variant: "ghost",
                      size: "sm",
                      isDark,
                      className:
                        "min-w-0 gap-1.5 rounded-lg px-3 py-2 text-sm text-text-secondary-light hover:text-info dark:text-text-secondary-dark dark:hover:text-info",
                    })}
                  >
                    {tagging ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Hash className="h-4 w-4" />
                    )}
                    <span className="text-xs">Hashtags</span>
                  </button>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                variant="primary"
                size="md"
                className="px-6 py-2.5 font-bold"
              >
                {(composerLoading || moderating) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {composerLoading
                  ? "Publishing..."
                  : moderating
                    ? "Checking..."
                    : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modConfirm}
        title="Content Flagged by AI"
        message={`Our AI flagged this content as potentially sensitive${
          moderationResult?.reason
            ? `: "${moderationResult.reason}"`
            : ""
        }. You can still post it, or go back and make edits.`}
        confirmText="Post Anyway"
        variant="warning"
        onConfirm={async () => {
          setModConfirm(false);
          await doPost();
        }}
        onCancel={() => {
          setModConfirm(false);
          dispatch(clearModerationResult());
        }}
      />
    </>
  );
}
