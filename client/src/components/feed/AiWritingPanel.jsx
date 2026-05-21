import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Loader2, X, RefreshCw, Check, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import useHomeTheme from "../../hooks/useHomeTheme";
import {
  draftPostThunk,
  improvePostThunk,
  clearAiSuggestion,
} from "../../redux/slices/feedSlice";

const TONES = [
  { value: "casual", label: "Casual", emoji: "💬" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "academic", label: "Academic", emoji: "📚" },
  { value: "inspirational", label: "Inspirational", emoji: "⭐" },
  { value: "witty", label: "Witty", emoji: "😄" },
];

export default function AiWritingPanel({ currentBody, onApply, onClose }) {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const { drafting, improving, suggestion, error } = useSelector((s) => s.feed.ai);
  const [mode, setMode] = useState(currentBody?.trim() ? "improve" : "draft");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("casual");

  const isLoading = drafting || improving;

  const handleGenerate = async () => {
    dispatch(clearAiSuggestion());

    if (mode === "draft") {
      if (!topic.trim()) {
        toast.error("Enter a topic or idea first");
        return;
      }
      const result = await dispatch(draftPostThunk({ topic: topic.trim(), tone }));
      if (result.meta.requestStatus === "rejected") {
        toast.error(result.payload || "Failed to generate draft");
      }
      return;
    }

    if (!currentBody?.trim()) {
      toast.error("Write something first, then use Improve");
      return;
    }

    const result = await dispatch(improvePostThunk({ body: currentBody.trim(), tone }));
    if (result.meta.requestStatus === "rejected") {
      toast.error(result.payload || "Failed to improve post");
    }
  };

  const handleApply = () => {
    if (suggestion?.body) {
      onApply(suggestion.body);
      dispatch(clearAiSuggestion());
      onClose();
    }
  };

  const handleTryAgain = () => {
    dispatch(clearAiSuggestion());
    handleGenerate();
  };

  return (
    <div
      className={`animate-in slide-in-from-top-2 space-y-4 rounded-xl border p-4 duration-200 ${
        isDark
          ? "border-border-dark bg-surface-dark"
          : "border-border-light bg-surface-light shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-info">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
            AI Writing Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className={`transition-colors ${isDark ? "text-text-secondary-dark hover:text-text-primary-dark" : "text-text-secondary-light hover:text-text-primary-light"}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={`flex gap-1.5 rounded-lg p-1 ${isDark ? "bg-background-dark" : "bg-slate-100"}`}>
        {[
          { id: "draft", label: "Draft from idea", icon: Wand2 },
          { id: "improve", label: "Improve text", icon: RefreshCw },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setMode(id);
              dispatch(clearAiSuggestion());
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-all ${
              mode === id
                ? "bg-info text-white shadow"
                : isDark
                  ? "text-text-secondary-dark hover:text-text-primary-dark"
                  : "text-text-secondary-light hover:text-text-primary-light"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {mode === "draft" && (
        <div>
          <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Topic or idea
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. CS Society hackathon this weekend, prizes worth 50k..."
            rows={2}
            className={`w-full resize-none rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none ${
              isDark
                ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-slate-500 focus:border-info"
                : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light focus:border-info"
            }`}
          />
        </div>
      )}

      <div>
        <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Tone</label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setTone(value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                tone === value
                  ? "bg-info text-white"
                  : isDark
                    ? "bg-background-dark text-text-secondary-dark hover:bg-slate-800 hover:text-text-primary-dark"
                    : "bg-slate-100 text-text-secondary-light hover:bg-slate-200 hover:text-text-primary-light"
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {!suggestion && (
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold text-white transition-all ${
            isDark
              ? "bg-info hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500"
              : "bg-info hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate
            </>
          )}
        </button>
      )}

      {error && !isLoading && <p className="text-center text-xs text-danger">{error}</p>}

      {suggestion?.body && (
        <div className="space-y-3">
          <div className="relative">
            <div className={`mb-1.5 flex items-center gap-1 text-xs font-semibold ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              <Sparkles className="h-3 w-3 text-info" />
              Suggestion
            </div>
            <div
              className={`max-h-48 overflow-y-auto rounded-xl border p-3 text-sm leading-relaxed ${
                isDark
                  ? "border-info/30 bg-background-dark text-text-primary-dark"
                  : "border-info/20 bg-info/5 text-text-primary-light"
              }`}
            >
              {suggestion.body}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success py-2 text-xs font-bold text-white transition-all hover:bg-green-700"
            >
              <Check className="h-3.5 w-3.5" />
              Use This
            </button>
            <button
              onClick={handleTryAgain}
              disabled={isLoading}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                isDark
                  ? "bg-background-dark text-text-primary-dark hover:bg-slate-800 disabled:opacity-50"
                  : "bg-slate-100 text-text-primary-light hover:bg-slate-200 disabled:opacity-50"
              }`}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
