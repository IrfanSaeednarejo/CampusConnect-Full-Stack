import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { generateDraft } from "../../api/nexusApi";

export default function NexusDraftInput({ schemaType, onDraftComplete, className = "" }) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDraft = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError("");

        try {
            const { data } = await generateDraft({ prompt: prompt.trim(), schemaType });
            // API returns ApiResponse, so data.data is the payload
            if (onDraftComplete) {
                onDraftComplete(data.data);
            }
            setPrompt("");
            setIsExpanded(false);
        } catch (err) {
            console.error("Nexus Draft Error:", err);
            setError(err.response?.data?.message || "Failed to generate draft. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isExpanded) {
        return (
            <div className={`mb-6 ${className}`}>
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-2 px-4 py-3 w-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-indigo-300 text-sm font-semibold transition-all shadow-sm"
                >
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span>Autofill with Nexus Draft ✨</span>
                </button>
            </div>
        );
    }

    return (
        <div className={`mb-8 bg-slate-800/60 border border-indigo-500/40 rounded-2xl p-5 shadow-lg shadow-indigo-500/5 relative overflow-hidden ${className}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-slate-200 font-semibold text-sm">Nexus Draft</h3>
                </div>
                <button 
                    type="button" 
                    onClick={() => setIsExpanded(false)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <p className="text-xs text-slate-400 mb-3">
                Describe your {schemaType} in plain English, and I'll fill out the form for you.
            </p>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={schemaType === "event" 
                    ? "e.g., A 2-hour tech workshop on React next Friday at 4pm in Hall A. Teams of 2-4."
                    : "e.g., A coding club for computer science students to collaborate on open-source projects."}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none min-h-[80px] mb-3"
                disabled={loading}
            />

            {error && (
                <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleDraft}
                    disabled={loading || !prompt.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Magic Fill</>
                    )}
                </button>
            </div>
        </div>
    );
}
