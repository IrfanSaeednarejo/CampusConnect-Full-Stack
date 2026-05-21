import { useState, useRef, useEffect } from "react";
import useHomeTheme from "../../hooks/useHomeTheme";

const QUICK_PROMPTS = [
  { label: "📝 Save a note", text: "Add this to my notes: " },
  { label: "✅ Create task", text: "Remind me to " },
  { label: "🎓 Find mentor", text: "Suggest a mentor for " },
  { label: "📖 Explain topic", text: "Explain my notes on " },
];

export default function NexusInput({ onSend, disabled }) {
  const isDark = useHomeTheme();
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (text) => {
    setValue(text);
    textareaRef.current?.focus();
  };

  const charCount = value.length;
  const nearLimit = charCount > 7000;

  return (
    <div
      className={`border-t px-4 py-3 ${
        isDark ? "border-[#21262d] bg-[#0d1117]" : "border-slate-200 bg-white"
      }`}
    >
      {!value && (
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => handleQuickPrompt(prompt.text)}
              disabled={disabled}
              className={`rounded-full border px-3 py-1.5 text-xs transition-all disabled:opacity-40 ${
                isDark
                  ? "border-[#30363d] text-[#8b949e] hover:border-[#3fb950] hover:text-[#3fb950]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask Nexus anything..."
            maxLength={8000}
            rows={1}
            className={`w-full resize-none rounded-xl border px-4 py-3 pr-16 text-sm outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark
                ? "border-[#30363d] bg-[#161b22] text-[#e6edf3] placeholder-[#8b949e] focus:border-[#3fb950] focus:ring-1 focus:ring-[#3fb950]/30 scrollbar-thumb-[#30363d]"
                : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 scrollbar-thumb-slate-300"
            } scrollbar-thin`}
            style={{ minHeight: "48px", maxHeight: "160px" }}
          />
          {nearLimit && (
            <span className="absolute bottom-2 right-3 text-[10px] text-amber-500">
              {charCount}/8000
            </span>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          id="nexus-send-btn"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-all ${
            disabled || !value.trim()
              ? isDark
                ? "bg-[#21262d] text-[#8b949e] shadow-none"
                : "bg-slate-200 text-slate-400 shadow-none"
              : "bg-[#238636] shadow-lg shadow-green-500/10 hover:bg-[#2ea043]"
          }`}
          title="Send (Enter)"
        >
          {disabled ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2v-9l4.5 4.5" />
            </svg>
          )}
        </button>
      </div>
      <p className={`mt-2 text-center text-[10px] ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
