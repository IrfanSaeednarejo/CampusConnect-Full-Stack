import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendMessageThunk,
  addOptimisticUserMessage,
  selectActiveMessages,
  selectNexusStreaming,
  selectActiveConversationId,
  selectNexusError,
  fetchConversationsThunk,
} from "../../redux/slices/nexusSlice";
import useHomeTheme from "../../hooks/useHomeTheme";
import NexusSidebar from "./NexusSidebar";
import NexusMessageBubble from "./NexusMessageBubble";
import NexusTypingIndicator from "./NexusTypingIndicator";
import NexusInput from "./NexusInput";
import { useLanguage } from "../../hooks/useLanguage";

function EmptyState({ isDark, t }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white shadow-sm">
        N
      </div>
      <h2 className={`mb-2 text-xl font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
        {t("nexus.greeting")}
      </h2>
      <p
        className={`mb-6 max-w-xs text-sm leading-relaxed ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
        }`}
      >
        {t("nexus.description")}
      </p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-2 text-left">
        {[
          { icon: "📝", text: t("nexus.suggestion.note") },
          { icon: "✅", text: t("nexus.suggestion.task") },
          { icon: "🎓", text: t("nexus.suggestion.mentor") },
          { icon: "📖", text: t("nexus.suggestion.explain") },
        ].map((suggestion) => (
          <div
            key={suggestion.text}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
              isDark
                ? "border-border-dark bg-surface-dark text-text-secondary-dark"
                : "border-border-light bg-surface-light text-text-secondary-light shadow-sm"
            }`}
          >
            <span>{suggestion.icon}</span>
            <span>"{suggestion.text}"</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NexusChat() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const messages = useSelector(selectActiveMessages);
  const isStreaming = useSelector(selectNexusStreaming);
  const conversationId = useSelector(selectActiveConversationId);
  const error = useSelector(selectNexusError);
  const { t } = useLanguage();
  const bottomRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversationsThunk());
  }, [dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = (text) => {
    dispatch(addOptimisticUserMessage(text));
    dispatch(sendMessageThunk({ message: text, conversationId }));
  };

  return (
    <div className={`flex h-full ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
      <NexusSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={`flex items-center gap-3 border-b px-4 py-3 ${
            isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-surface-light"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">
            N
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
              {t("nexus.title")}
            </p>
            <p className={`text-[10px] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              Powered by Gemini 2.5 Flash
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{t("nexus.online")}</span>
          </div>
        </div>

        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !isStreaming ? (
            <EmptyState isDark={isDark} t={t} />
          ) : (
            messages.map((message, index) => (
              <NexusMessageBubble key={message._id || index} message={message} />
            ))
          )}
          {isStreaming && <NexusTypingIndicator />}

          {error && (
            <div className="flex justify-center">
              <div className="theme-error-surface max-w-2xl rounded-2xl border px-4 py-3 text-xs leading-relaxed shadow-sm">
                <div className="mb-1 font-semibold">{t("nexus.errorTitle")}</div>
                <div>{error}</div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <NexusInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
