import useHomeTheme from "@/hooks/useHomeTheme";
import { getStudyGroupTheme } from "./studyGroupTheme";

export default function GroupChatInput({ message, setMessage, onSend }) {
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`border-t p-4 ${theme.hero}`}>
      <div className="mx-auto max-w-5xl px-0 sm:px-0">
        <div className={`rounded-[28px] border p-4 ${theme.surface}`}>
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              className={`flex-1 resize-none rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input}`}
              rows={2}
            />
            <button
              onClick={onSend}
              className={`flex flex-shrink-0 items-center gap-2 self-end rounded-2xl px-5 py-3 text-sm font-medium transition ${theme.buttonPrimary}`}
            >
              <span className="material-symbols-outlined text-lg">send</span>
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
