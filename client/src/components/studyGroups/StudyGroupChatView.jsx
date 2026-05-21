import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  fetchMessages,
  selectMessagesByConversation,
  selectChatLoading,
  newMessage,
  setTypingStatus,
  selectTypingByConversation,
  setSelectedConversation,
} from "../../redux/slices/chatSlice";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks";
import { getStudyGroupTheme } from "./studyGroupTheme";

export default function StudyGroupChatView({ chatId, groupName }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

  const allMessages = useSelector(selectMessagesByConversation);
  const messages = useMemo(() => allMessages[chatId] || [], [allMessages, chatId]);
  const chatLoading = useSelector(selectChatLoading);
  const loading = chatLoading?.messages;
  const typingStatus = useSelector(selectTypingByConversation)[chatId];

  useEffect(() => {
    if (!socket || !chatId) return;

    setJoined(false);
    setJoinError(null);

    socket.emit("chat:join", { chatId });
    dispatch(setSelectedConversation(chatId));

    const onJoined = (data) => {
      if (data.chatId === chatId) setJoined(true);
    };

    const onError = (data) => {
      if (data.event === "chat:join") {
        setJoinError(data.message || "Unable to join chat room");
      }
    };

    const onNewMessage = (message) => {
      const msgChatId = message.chat?.toString() || message.chatId?.toString();
      if (msgChatId === chatId) {
        dispatch(newMessage({ conversationId: chatId, message }));
      }
    };

    const onTypingStart = (data) => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        dispatch(
          setTypingStatus({
            conversationId: chatId,
            isTyping: true,
            userName: data.displayName || "Someone",
          })
        );
      }
    };

    const onTypingStop = (data) => {
      if (data.chatId === chatId) {
        dispatch(setTypingStatus({ conversationId: chatId, isTyping: false, userName: null }));
      }
    };

    socket.on("chat:joined", onJoined);
    socket.on("error:chat", onError);
    socket.on("message:new", onNewMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.emit("chat:leave", { chatId });
      dispatch(setSelectedConversation(null));
      socket.off("chat:joined", onJoined);
      socket.off("error:chat", onError);
      socket.off("message:new", onNewMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, chatId, dispatch, user?._id]);

  useEffect(() => {
    if (chatId && messages.length === 0) {
      dispatch(fetchMessages({ chatId }));
    }
  }, [dispatch, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  const handleSend = useCallback(
    (e) => {
      if (e) e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || !chatId || !socket || sending) return;

      setSending(true);

      socket.emit("message:send", { chatId, content: trimmed, type: "text" }, (ack) => {
        setSending(false);
        if (ack?.error) {
          toast.error(ack.error);
        } else if (ack?.success && ack?.message) {
          dispatch(newMessage({ conversationId: chatId, message: ack.message }));
          setText("");
          socket.emit("typing:stop", { chatId });
        }
      });
    },
    [text, chatId, socket, sending, dispatch]
  );

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    if (e.target.value.trim().length > 0) {
      socket.emit("typing:start", { chatId });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit("typing:stop", { chatId });
      }, 4000);
    } else {
      clearTimeout(typingTimerRef.current);
      socket.emit("typing:stop", { chatId });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (joinError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className={`material-symbols-outlined text-5xl ${theme.dangerText}`}>lock</span>
        <h3 className={`text-lg font-medium ${theme.title}`}>Chat Access Denied</h3>
        <p className={`text-sm ${theme.muted}`}>{joinError}</p>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${isDark ? "border-[#238636]" : "border-slate-900"}`} />
        <p className={`text-sm ${theme.muted}`}>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col overflow-hidden ${theme.page}`}>
      <div className={`flex shrink-0 items-center gap-3 border-b px-4 py-3 ${theme.hero}`}>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${theme.accentSurface}`}>
          <span className={`material-symbols-outlined text-sm ${theme.iconAccent}`}>forum</span>
        </div>
        <div>
          <p className={`text-sm font-medium ${theme.title}`}>{groupName || "Group Discussion"}</p>
          <p className={`text-xs ${theme.muted}`}>
            {joined ? "Connected" : "Connecting..."}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className={`material-symbols-outlined text-5xl ${theme.subtle}`}>chat</span>
            <p className={`text-sm ${theme.muted}`}>No messages yet. Start the conversation!</p>
          </div>
        )}

        <div className="space-y-1">
          {messages.map((msg, index) => {
            const senderId = msg.sender?._id || msg.sender;
            const isOwn = String(senderId) === String(user?._id);
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevSenderId = prevMsg?.sender?._id || prevMsg?.sender;
            const isFirstInBlock = String(senderId) !== String(prevSenderId);
            const senderName =
              msg.sender?.profile?.displayName || msg.sender?.profile?.firstName || "Member";
            const avatarUrl =
              msg.sender?.profile?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                senderName
              )}&background=238636&color=fff&size=64`;

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${
                  isFirstInBlock ? "mt-4" : "mt-0.5"
                }`}
              >
                {!isOwn && isFirstInBlock && (
                  <p className={`mb-1 ml-11 text-xs font-semibold ${theme.iconAccent}`}>{senderName}</p>
                )}

                <div className={`flex max-w-[80%] items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  {!isOwn && isFirstInBlock ? (
                    <img
                      src={avatarUrl}
                      alt={senderName}
                      className={`mb-1 h-8 w-8 shrink-0 rounded-full border object-cover ${theme.border}`}
                    />
                  ) : !isOwn ? (
                    <div className="w-8 shrink-0" />
                  ) : null}

                  <div
                    className={`max-w-full break-words rounded-2xl px-3 py-2 text-sm ${
                      isOwn
                        ? `${isDark ? "bg-[#238636]" : "bg-slate-900"} rounded-tr-none text-white`
                        : `${theme.surfaceMuted} rounded-tl-none border ${theme.text}`
                    }`}
                  >
                    {msg.isDeleted ? (
                      <p className="text-xs italic opacity-50">This message was deleted</p>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <p className={`mt-1 text-[10px] ${isOwn ? "text-right text-white/65" : theme.muted}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.isEdited && <span className="ml-1 opacity-60">(edited)</span>}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {typingStatus?.isTyping && (
          <div className="mt-3 ml-10 flex items-center gap-2">
            <div className={`flex gap-1 rounded-full border px-3 py-2 ${theme.surfaceMuted}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#8b949e]" : "bg-slate-400"} animate-bounce`} />
              <div className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#8b949e]" : "bg-slate-400"} animate-bounce [animation-delay:150ms]`} />
              <div className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#8b949e]" : "bg-slate-400"} animate-bounce [animation-delay:300ms]`} />
            </div>
            <p className={`text-xs ${theme.muted}`}>{typingStatus.userName} is typing...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={`shrink-0 border-t p-3 ${theme.hero}`}>
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className={`max-h-28 w-full overflow-y-auto resize-none rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none ${theme.input}`}
              style={{ lineHeight: "1.5" }}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || sending || !joined}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40 ${theme.buttonPrimary}`}
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="material-symbols-outlined text-lg">send</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
