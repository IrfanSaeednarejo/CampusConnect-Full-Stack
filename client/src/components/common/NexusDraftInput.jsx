import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { generateDraft } from "../../api/nexusApi";
import useHomeTheme from "../../hooks/useHomeTheme";
import Button, { getButtonClassName } from "./Button";

export default function NexusDraftInput({ schemaType, onDraftComplete, className = "" }) {
    const isDark = useHomeTheme();
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
                    className={getButtonClassName({
                        variant: "secondary",
                        size: "md",
                        isDark,
                        className: "w-full justify-start border-info/20 bg-info/10 text-info shadow-none hover:border-info/40 hover:bg-info/15 hover:text-info",
                    })}
                >
                    <Sparkles className="h-5 w-5 text-info" />
                    <span>Autofill with Nexus Draft</span>
                </button>
            </div>
        );
    }

    return (
        <div
            className={`relative mb-8 overflow-hidden rounded-2xl border p-5 shadow-lg ${className} ${
                isDark ? "border-info/30 bg-surface-dark" : "border-border-light bg-surface-light"
            }`}
        >
            <div className="absolute left-0 top-0 h-1 w-full bg-info" />

            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-info" />
                    <h3 className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                        Nexus Draft
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className={getButtonClassName({
                        variant: "ghost",
                        size: "icon-sm",
                        isDark,
                        iconOnly: true,
                        className: "rounded-lg shadow-none",
                    })}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <p className={`mb-3 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                Describe your {schemaType} in plain English, and I&apos;ll fill out the form for you.
            </p>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                    schemaType === "event"
                        ? "e.g., A 2-hour tech workshop on React next Friday at 4pm in Hall A. Teams of 2-4."
                        : "e.g., A coding club for computer science students to collaborate on open-source projects."
                }
                className={`mb-3 min-h-[80px] w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                    isDark
                        ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark focus:ring-info/40"
                        : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light focus:ring-info/20"
                }`}
                disabled={loading}
            />

            {error && (
                <div className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    type="button"
                    onClick={handleDraft}
                    disabled={loading || !prompt.trim()}
                    variant="primary"
                    size="md"
                    className="px-5"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" /> Magic Fill
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
