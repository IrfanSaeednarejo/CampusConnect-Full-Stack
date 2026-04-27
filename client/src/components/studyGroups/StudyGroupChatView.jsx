import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { toast } from "react-hot-toast";

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

  const allMessages = useSelector(selectMessagesByConversation);
  const messages = useMemo(() => allMessages[chatId] || [], [allMessages, chatId]);
  const chatLoading = useSelector(selectChatLoading);
  const loading = chatLoading?.messages;
  const typingStatus = useSelector(selectTypingByConversation)[chatId];

  // ── Join socket room ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !chatId) return;

    setJoined(false);
    setJoinError(null);

    // Emit join — backend checks Chat.members
    socket.emit("chat:join", { chatId });
    dispatch(setSelectedConversation(chatId));

    // Listen for join confirmation and error
    const onJoined = (data) => {
      if (data.chatId === chatId) setJoined(true);
    };
    const onError = (data) => {
      if (data.event === "chat:join") {
        setJoinError(data.message || "Unable to join chat room");
      }
    };

    socket.on("chat:joined", onJoined);
    socket.on("error:chat", onError);

    // Listen for incoming messages in real-time
    const onNewMessage = (message) => {
      const msgChatId = message.chat?.toString() || message.chatId?.toString();
      if (msgChatId === chatId) {
        dispatch(newMessage({ conversationId: chatId, message }));
      }
    };

    const onTypingStart = (data) => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        dispatch(setTypingStatus({
          conversationId: chatId,
          isTyping: true,
          userName: data.displayName || "Someone",
        }));
      }
    };

    const onTypingStop = (data) => {
      if (data.chatId === chatId) {
        dispatch(setTypingStatus({ conversationId: chatId, isTyping: false, userName: null }));
      }
    };

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

  // ── Load message history via REST ─────────────────────────────────────────
  useEffect(() => {
    if (chatId && messages.length === 0) {
      dispatch(fetchMessages({ chatId }));
    }
  }, [dispatch, chatId]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  // ── Send message via Socket.IO (bypasses REST, avoids extra middleware) ───
  const handleSend = useCallback((e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !chatId || !socket || sending) return;

    setSending(true);

    socket.emit(
      "message:send",
      { chatId, content: trimmed, type: "text" },
      (ack) => {
        setSending(false);
        if (ack?.error) {
          toast.error(ack.error);
        } else if (ack?.success && ack?.message) {
          // Add our own message to the store (server won't broadcast back to sender)
          dispatch(newMessage({ conversationId: chatId, message: ack.message }));
          setText("");
          socket.emit("typing:stop", { chatId });
        }
      }
    );
  }, [text, chatId, socket, sending, dispatch]);

  // ── Typing indicators ─────────────────────────────────────────────────────
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

  // ── Join error state ──────────────────────────────────────────────────────
  if (joinError) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-center p-8">
        <span className="material-symbols-outlined text-5xl text-[#f85149]">lock</span>
        <h3 className="text-white font-bold">Chat Access Denied</h3>
        <p className="text-[#8b949e] text-sm">{joinError}</p>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#238636] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#8b949e] text-sm">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-[#161b22] shrink-0">
        <div className="w-8 h-8 bg-[#238636]/15 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-[#238636] text-sm">forum</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm">{groupName || "Group Discussion"}</p>
          <p className="text-[#8b949e] text-[10px]">
            {joined ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#238636] rounded-full inline-block" />
                Connected
              </span>
            ) : (
              "Connecting..."
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0d1117]">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="material-symbols-outlined text-5xl text-[#30363d]">chat</span>
            <p className="text-[#8b949e] text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const senderId = msg.sender?._id || msg.sender;
          const isOwn = String(senderId) === String(user?._id);
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const prevSenderId = prevMsg?.sender?._id || prevMsg?.sender;
          const isFirstInBlock = String(senderId) !== String(prevSenderId);
          const senderName = msg.sender?.profile?.displayName ||
            msg.sender?.profile?.firstName || "Member";
          const avatarUrl = msg.sender?.profile?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=238636&color=fff&size=64`;

          return (
            <div
              key={msg._id || idx}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${isFirstInBlock ? "mt-4" : "mt-0.5"}`}
            >
              {!isOwn && isFirstInBlock && (
                <p className="text-xs font-bold text-[#3fb950] ml-11 mb-1">{senderName}</p>
              )}
              <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                {!isOwn && isFirstInBlock ? (
                  <img
                    src={avatarUrl}
                    alt={senderName}
                    className="w-8 h-8 rounded-full border border-[#30363d] mb-1 shrink-0 object-cover"
                  />
                ) : !isOwn ? (
                  <div className="w-8 shrink-0" />
                ) : null}

                <div className={`px-3 py-2 rounded-2xl text-sm max-w-full break-words ${
                  isOwn
                    ? "bg-[#238636] text-white rounded-tr-none"
                    : "bg-[#1c2128] text-[#c9d1d9] border border-[#30363d] rounded-tl-none"
                }`}>
                  {msg.isDeleted ? (
                    <p className="italic opacity-50 text-xs">This message was deleted</p>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60 text-right" : "text-[#8b949e]"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {msg.isEdited && <span className="ml-1 opacity-60">(edited)</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingStatus?.isTyping && (
          <div className="flex items-center gap-2 mt-3 ml-10">
            <div className="flex gap-1 bg-[#1c2128] border border-[#30363d] rounded-full px-3 py-2">
              <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-xs text-[#8b949e]">{typingStatus.userName} is typing…</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 bg-[#161b22] border-t border-[#30363d]">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white
                         focus:outline-none focus:border-[#238636]/60 transition-colors resize-none
                         placeholder-[#8b949e] max-h-28 overflow-y-auto"
              style={{ lineHeight: "1.5" }}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || sending || !joined}
            className="w-10 h-10 shrink-0 flex items-center justify-center bg-[#238636] text-white 
                       rounded-xl hover:bg-[#2ea043] transition-colors 
                       disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg">send</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
