import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Loader2, X, RefreshCw, Check, Wand2 } from "lucide-react";
import {
    draftPostThunk,
    improvePostThunk,
    clearAiSuggestion,
} from "../../redux/slices/feedSlice";
import toast from "react-hot-toast";

const TONES = [
    { value: "casual",        label: "Casual",        emoji: "💬" },
    { value: "professional",  label: "Professional",  emoji: "💼" },
    { value: "academic",      label: "Academic",      emoji: "📚" },
    { value: "inspirational", label: "Inspirational", emoji: "🌟" },
    { value: "witty",         label: "Witty",         emoji: "😄" },
];

/**
 * AiWritingPanel — slide-in AI writing assistant for the PostComposer.
 *
 * Props:
 *   currentBody   {string}   — the current textarea content
 *   onApply       {function} — called with the new body string when user accepts
 *   onClose       {function} — close the panel
 */
export default function AiWritingPanel({ currentBody, onApply, onClose }) {
    const dispatch = useDispatch();
    const { drafting, improving, suggestion, error } = useSelector((s) => s.feed.ai);

    const [mode, setMode]   = useState(currentBody?.trim() ? "improve" : "draft"); // draft | improve
    const [topic, setTopic] = useState("");
    const [tone, setTone]   = useState("casual");

    const isLoading = drafting || improving;

    const handleGenerate = async () => {
        dispatch(clearAiSuggestion());

        if (mode === "draft") {
            if (!topic.trim()) { toast.error("Enter a topic or idea first"); return; }
            const result = await dispatch(draftPostThunk({ topic: topic.trim(), tone }));
            if (result.meta.requestStatus === "rejected") {
                toast.error(result.payload || "Failed to generate draft");
            }
        } else {
            if (!currentBody?.trim()) { toast.error("Write something first, then use Improve"); return; }
            const result = await dispatch(improvePostThunk({ body: currentBody.trim(), tone }));
            if (result.meta.requestStatus === "rejected") {
                toast.error(result.payload || "Failed to improve post");
            }
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
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">AI Writing Assistant</span>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-1.5 p-1 bg-slate-900/60 rounded-lg">
                {[
                    { id: "draft",   label: "Draft from idea", icon: Wand2 },
                    { id: "improve", label: "Improve text",    icon: RefreshCw },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => { setMode(id); dispatch(clearAiSuggestion()); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all ${
                            mode === id
                                ? "bg-violet-600 text-white shadow"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Icon className="w-3 h-3" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Topic input (Draft mode only) */}
            {mode === "draft" && (
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Topic or idea
                    </label>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. CS Society hackathon this weekend, prizes worth 50k…"
                        rows={2}
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-violet-500 transition-colors"
                    />
                </div>
            )}

            {/* Tone Selector */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tone</label>
                <div className="flex flex-wrap gap-1.5">
                    {TONES.map(({ value, label, emoji }) => (
                        <button
                            key={value}
                            onClick={() => setTone(value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                tone === value
                                    ? "bg-violet-600 text-white"
                                    : "bg-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            }`}
                        >
                            {emoji} {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            {!suggestion && (
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-all"
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Generate</>
                    )}
                </button>
            )}

            {/* Error */}
            {error && !isLoading && (
                <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            {/* Suggestion Output */}
            {suggestion?.body && (
                <div className="space-y-3">
                    <div className="relative">
                        <div className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-violet-400" />
                            Suggestion
                        </div>
                        <div className="bg-slate-900/70 border border-violet-500/30 rounded-xl p-3 text-sm text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                            {suggestion.body}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleApply}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Use This
                        </button>
                        <button
                            onClick={handleTryAgain}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl transition-all"
                        >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
