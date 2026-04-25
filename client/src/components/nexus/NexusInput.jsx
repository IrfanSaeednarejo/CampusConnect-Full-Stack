import { useState, useRef, useEffect } from 'react';

const QUICK_PROMPTS = [
  { label: '📝 Save a note', text: 'Add this to my notes: ' },
  { label: '✅ Create task', text: 'Remind me to ' },
  { label: '🎓 Find mentor', text: 'Suggest a mentor for ' },
  { label: '📖 Explain topic', text: 'Explain my notes on ' },
];

export default function NexusInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
    <div className="border-t border-[#21262d] bg-[#0d1117] px-4 py-3">
      {/* Quick prompt chips — only shown when input is empty */}
      {!value && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleQuickPrompt(p.text)}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-full border border-[#30363d] text-[#8b949e]
                hover:border-[#3fb950] hover:text-[#3fb950] transition-all disabled:opacity-40"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask Nexus anything…"
            maxLength={8000}
            rows={1}
            className="w-full resize-none bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 pr-16
              text-sm text-[#e6edf3] placeholder-[#8b949e] outline-none
              focus:border-[#3fb950] focus:ring-1 focus:ring-[#3fb950]/30
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              scrollbar-thin scrollbar-thumb-[#30363d]"
            style={{ minHeight: '48px', maxHeight: '160px' }}
          />
          {nearLimit && (
            <span className="absolute bottom-2 right-3 text-[10px] text-amber-400">
              {charCount}/8000
            </span>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          id="nexus-send-btn"
          className="w-11 h-11 rounded-xl bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d]
            disabled:text-[#8b949e] text-white flex items-center justify-center
            transition-all shrink-0 shadow-lg shadow-green-500/10 disabled:shadow-none"
          title="Send (Enter)"
        >
          {disabled ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2v-9l4.5 4.5" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-[10px] text-[#8b949e] mt-2 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
