import useHomeTheme from "@/hooks/useHomeTheme";
import { getStudyGroupTheme } from "./studyGroupTheme";

export default function ChatMessage({ message, isOwn }) {
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);
  const initials = message.author ? message.author[0].toUpperCase() : "?";

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div className="mt-1 flex-shrink-0">
        {message.avatar ? (
          <img
            src={message.avatar}
            alt={message.author}
            className={`h-8 w-8 rounded-full border object-cover ${theme.border}`}
          />
        ) : (
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-semibold uppercase ${theme.accentSurface} ${theme.iconAccent}`}>
            {initials}
          </div>
        )}
      </div>

      <div className="flex max-w-[80%] flex-col">
        {!isOwn && (
          <span className={`mb-1 ml-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${theme.muted}`}>
            {message.author}
          </span>
        )}

        <div
          className={`px-4 py-3 shadow-sm ${
            isOwn
              ? `${isDark ? "bg-[#238636]" : "bg-slate-900"} rounded-2xl rounded-tr-none text-white`
              : `${theme.surfaceMuted} rounded-2xl rounded-tl-none border text-sm ${theme.text}`
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
          <div
            className={`mt-1.5 flex items-center gap-1 text-[10px] ${
              isOwn ? "justify-end text-white/70" : theme.muted
            }`}
          >
            <span>{message.timestamp}</span>
            {isOwn && <span className="material-symbols-outlined text-[12px]">done_all</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
