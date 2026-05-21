import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useAutoScroll } from "../../hooks";
import useHomeTheme from "../../hooks/useHomeTheme";
import { useLanguage } from "../../hooks/useLanguage";

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const formatDayLabel = (timestamp, locale, t) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return t("common.today");
  if (isYesterday) return t("common.yesterday");
  return date.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const noop = () => {};

export default function ChatShell({
  conversations = [],
  selectedConversationId = null,
  messagesByConversation = {},
  pinnedConversations = [],
  archivedConversations = [],
  mutedConversations = [],
  draftsByConversation = {},
  searchByConversation = {},
  typingByConversation = {},
  hiddenMessagesByConversation = {},
  forwardingMessage = null,
  onSelectConversation = noop,
  onSendMessage = noop,
  onSetDraft = noop,
  onSetReplyTo = noop,
  onClearReplyTo = noop,
  onSetEditingMessage = noop,
  onClearEditingMessage = noop,
  onApplyEditMessage = noop,
  onDeleteMessageForMe = noop,
  onDeleteMessageForAll = noop,
  onToggleReaction = noop,
  onTogglePinConversation = noop,
  onToggleArchiveConversation = noop,
  onToggleMuteConversation = noop,
  onClearConversation = noop,
  onCloseConversation = noop,
  onSetSearchQuery = noop,
  onSetTypingStatus = noop,
  onSetForwardingMessage = noop,
  onClearForwardingMessage = noop,
  onRetryMessage = noop,
  onHandleTyping = noop,
  onDisconnect = noop,
  canSend = true,
  currentUser = null,
}) {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const { t, locale } = useLanguage();
  const [showArchived, setShowArchived] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const searchInputRef = useRef(null);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );
  const rawMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] || []
    : [];
  const hiddenMessages = selectedConversationId
    ? hiddenMessagesByConversation[selectedConversationId] || []
    : [];
  const searchQuery = selectedConversationId
    ? searchByConversation[selectedConversationId] || ""
    : "";
  const draft = selectedConversationId
    ? draftsByConversation[selectedConversationId] || {
        text: "",
        replyToId: null,
        editingMessageId: null,
      }
    : { text: "", replyToId: null, editingMessageId: null };
  const typingStatus = selectedConversationId
    ? typingByConversation[selectedConversationId]
    : null;

  const visibleMessages = rawMessages.filter(
    (message) => !hiddenMessages.includes(message.id)
  );

  const filteredMessages = searchQuery
    ? visibleMessages.filter((message) =>
        (message.content || message.text || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : visibleMessages;

  const [visibleCount, setVisibleCount] = useState(40);
  const messagesToRender = filteredMessages.slice(
    Math.max(filteredMessages.length - visibleCount, 0)
  );

  const scrollRef = useAutoScroll(messagesToRender);

  const messagesWithSeparators = useMemo(() => {
    let lastDay = "";
    const output = [];
    messagesToRender.forEach((message) => {
      const day = formatDayLabel(message.timestamp || message.createdAt, locale, t);
      if (day && day !== lastDay) {
        output.push({ type: "separator", id: `sep-${message.id || message._id}`, label: day });
        lastDay = day;
      }

      const replyMsg = message.replyToId
        ? visibleMessages.find((msg) => (msg._id || msg.id) === message.replyToId)
        : null;

      const enhancedMessage = {
        ...message,
        replyPreview: replyMsg
          ? {
              senderDisplayName:
                replyMsg.senderName || replyMsg.sender?.profile?.displayName || t("common.someone"),
              content: replyMsg.content || replyMsg.text || t("nav.messages"),
            }
          : null,
      };

      output.push({ type: "message", id: message.id || message._id, message: enhancedMessage });
    });
    return output;
  }, [locale, messagesToRender, t, visibleMessages]);

  const visibleConversations = useMemo(() => {
    if (!showArchived) {
      return conversations.filter((conversation) => !conversation.isArchived);
    }
    return conversations;
  }, [conversations, showArchived]);

  useEffect(() => {
    if (searchQuery && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectConversation = (id) => {
    onSelectConversation(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSend = useCallback(() => {
    if (!selectedConversationId || !draft.text.trim()) return;
    if (draft.editingMessageId) {
      onApplyEditMessage({
        conversationId: selectedConversationId,
        messageId: draft.editingMessageId,
        text: draft.text.trim(),
      });
      onClearEditingMessage({ conversationId: selectedConversationId });
      onSetDraft({ conversationId: selectedConversationId, text: "" });
      return;
    }
    onSendMessage(selectedConversationId, draft.text, { replyToId: draft.replyToId });
    onSetDraft({ conversationId: selectedConversationId, text: "" });
    onClearReplyTo({ conversationId: selectedConversationId });
  }, [
    draft,
    onApplyEditMessage,
    onClearEditingMessage,
    onClearReplyTo,
    onSendMessage,
    onSetDraft,
    selectedConversationId,
  ]);

  return (
    <div className={`relative flex h-full w-full overflow-hidden ${
      isDark ? "bg-[#0d1117]" : "bg-slate-50"
    }`}>
      <div
        className={`
          fixed inset-0 z-40 md:relative md:inset-auto md:z-10
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${!isSidebarOpen ? "md:hidden" : "md:flex md:w-[350px]"}
        `}
      >
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-[-1] bg-black/60 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <ChatSidebar
          conversations={visibleConversations}
          selectedId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          archivedCount={archivedConversations.length}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived((prev) => !prev)}
        />
      </div>

      <div className={`relative flex min-w-0 flex-1 flex-col ${
        isDark ? "bg-[#0d1117]" : "bg-slate-50"
      }`}>
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              avatarColor={selectedConversation.avatarColor}
              isMuted={selectedConversation.isMuted}
              isArchived={selectedConversation.isArchived}
              isPinned={selectedConversation.isPinned}
              isTyping={typingStatus?.isTyping}
              typingName={typingStatus?.userName}
              lastSeen={selectedConversation.lastSeen}
              searchQuery={searchQuery}
              searchInputRef={searchInputRef}
              onSearch={(query) =>
                onSetSearchQuery({ conversationId: selectedConversationId, query })
              }
              onClose={() => setIsSidebarOpen(true)}
              onArchive={() =>
                onToggleArchiveConversation({ conversationId: selectedConversationId })
              }
              onMute={() =>
                onToggleMuteConversation({ conversationId: selectedConversationId })
              }
              onPin={() =>
                onTogglePinConversation({ conversationId: selectedConversationId })
              }
              onClearChat={() =>
                onClearConversation({ conversationId: selectedConversationId })
              }
              onDisconnect={() => onDisconnect(selectedConversationId)}
            />

            {forwardingMessage && (
              <div
                className={`flex items-center justify-between border-b px-4 py-2 text-xs font-medium ${
                  isDark
                    ? "border-emerald-500/20 bg-emerald-600/10 text-emerald-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare size={14} />
                  {t("chat.forwarding")}
                </span>
                <button
                  onClick={onClearForwardingMessage}
                  className={`transition-colors ${
                    isDark ? "hover:text-white" : "hover:text-emerald-900"
                  }`}
                >
                  {t("common.cancel")}
                </button>
              </div>
            )}

            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
              {filteredMessages.length > visibleCount && (
                <button
                  className={`mx-auto block rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    isDark
                      ? "border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white"
                      : "border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900"
                  }`}
                  onClick={() => setVisibleCount((prev) => prev + 40)}
                >
                  {t("chat.loadEarlier")}
                </button>
              )}

              <div className="flex flex-col">
                {messagesWithSeparators.map((entry) =>
                  entry.type === "separator" ? (
                    <div key={entry.id} className="my-6 flex items-center justify-center">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          isDark
                            ? "border-[#30363d] bg-[#161b22] text-[#8b949e]"
                            : "border-slate-200 bg-white text-slate-500 shadow-sm"
                        }`}
                      >
                        {entry.label}
                      </span>
                    </div>
                  ) : (
                    <MessageBubble
                      key={entry.id}
                      message={entry.message}
                      isCurrentUser={
                        entry.message.senderId === "current" ||
                        entry.message.senderId === currentUser?._id?.toString() ||
                        entry.message.sender?._id === currentUser?._id
                      }
                      userColor={selectedConversation.avatarColor}
                      onReply={() =>
                        onSetReplyTo({
                          conversationId: selectedConversationId,
                          messageId: entry.message.id,
                        })
                      }
                      onEdit={() => {
                        onSetEditingMessage({
                          conversationId: selectedConversationId,
                          messageId: entry.message.id,
                        });
                        onSetDraft({
                          conversationId: selectedConversationId,
                          text: entry.message.text || entry.message.content,
                        });
                      }}
                      onForward={() => onSetForwardingMessage({ message: entry.message })}
                      onDelete={(deleteForAll) => {
                        if (deleteForAll) {
                          onDeleteMessageForAll({
                            conversationId: selectedConversationId,
                            messageId: entry.message.id,
                          });
                        } else {
                          onDeleteMessageForMe({
                            conversationId: selectedConversationId,
                            messageId: entry.message.id,
                          });
                        }
                      }}
                      onReact={(emoji) =>
                        onToggleReaction({
                          conversationId: selectedConversationId,
                          messageId: entry.message.id,
                          emoji,
                          userId: "current",
                        })
                      }
                      isSearchMatch={
                        searchQuery &&
                        (entry.message.content || entry.message.text || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      }
                      isDark={isDark}
                    />
                  )
                )}
              </div>
            </div>

            {typingStatus?.isTyping && (
              <div className={`px-6 py-2 text-[11px] font-medium italic animate-pulse ${
                isDark ? "text-emerald-400" : "text-emerald-700"
              }`}>
                {t("chat.typing", { name: typingStatus.userName || t("common.someone") })}
              </div>
            )}

            {canSend && (
              <ChatInput
                value={draft.text}
                onChange={(val) => {
                  onSetDraft({ conversationId: selectedConversationId, text: val });
                  onSetTypingStatus({
                    conversationId: selectedConversationId,
                    isTyping: val.length > 0,
                    userName: "You",
                  });
                  onHandleTyping();
                }}
                onSend={handleSend}
                replyMessage={
                  draft.replyToId
                    ? rawMessages.find((m) => (m._id || m.id) === draft.replyToId)
                    : null
                }
                onCancelReply={() =>
                  onClearReplyTo({ conversationId: selectedConversationId })
                }
                isEditing={!!draft.editingMessageId}
                onCancelEdit={() =>
                  onClearEditingMessage({ conversationId: selectedConversationId })
                }
                isDark={isDark}
              />
            )}
          </>
        ) : (
          <div className={`flex flex-1 flex-col items-center justify-center p-8 text-center ${
            isDark ? "bg-[#0d1117]" : "bg-slate-50"
          }`}>
            <div
              className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full border text-emerald-500 ${
                isDark
                  ? "border-[#30363d] bg-[#161b22] shadow-2xl shadow-emerald-500/5"
                  : "border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              }`}
            >
              <MessageSquare size={48} className="opacity-50" />
            </div>
            <h3 className={`mb-2 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {t("chat.emptyTitle")}
            </h3>
            <p className={`mb-8 max-w-sm leading-relaxed ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
              {t("chat.emptyText")}
            </p>
            <button
              onClick={() => conversations.length > 0 && handleSelectConversation(conversations[0].id)}
              className="rounded-2xl bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-1 hover:bg-emerald-500"
            >
              {t("chat.openRecent")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
