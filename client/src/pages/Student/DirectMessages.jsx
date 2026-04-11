import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getMyChats, getChatMessages, sendMessage } from "../../api/chatApi";
import Avatar from "../../components/common/Avatar";

export default function DirectMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations from backend
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await getMyChats();
        const chats = res?.data || [];
        setConversations(chats);
        if (chats.length > 0) {
          setActiveChat(chats[0]);
        }
      } catch (err) {
        console.error("Failed to load chats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat?._id) return;
    const loadMessages = async () => {
      try {
        const res = await getChatMessages(activeChat._id);
        setMessages(res?.data?.docs || res?.data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      }
    };
    loadMessages();
  }, [activeChat?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim() || !activeChat?._id || sending) return;
    setSending(true);
    try {
      const res = await sendMessage(activeChat._id, messageInput.trim());
      const newMsg = res?.data;
      if (newMsg) setMessages((prev) => [...prev, newMsg]);
      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get the "other" participant's info for DM chats
  const getOtherParticipant = (chat) => {
    const userId = user?.id || user?._id;
    const participants = chat?.participants || [];
    const other = participants.find(
      (p) => (p._id || p.id) !== userId
    );
    return other;
  };

  const getChatName = (chat) => {
    if (chat?.name) return chat.name;
    const other = getOtherParticipant(chat);
    return other?.profile?.displayName || other?.profile?.firstName || "Chat";
  };

  const getChatAvatar = (chat) => {
    const other = getOtherParticipant(chat);
    return other?.profile?.avatar || "";
  };

  const getChatInitial = (chat) => {
    const name = getChatName(chat);
    return name.charAt(0).toUpperCase();
  };

  const isOwnMessage = (msg) => {
    const userId = user?.id || user?._id;
    const senderId = msg?.senderId?._id || msg?.senderId || msg?.sender?._id || msg?.sender;
    return senderId === userId;
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Conversations List */}
      <div className="flex w-full max-w-sm flex-col border-r border-border bg-background">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">Messages</h2>
        </div>
        <div className="p-4">
          <label className="flex flex-col w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-10">
              <div className="text-text-secondary flex bg-surface items-center justify-center pl-3 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-lg">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-primary focus:outline-0 focus:ring-0 border-none bg-surface h-full placeholder:text-text-secondary pl-2 text-sm font-normal"
                placeholder="Search messages or users"
              />
            </div>
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setActiveChat(conv)}
                className={`flex items-center gap-4 px-4 py-3 justify-between cursor-pointer transition-colors ${activeChat?._id === conv._id
                    ? "bg-surface border-l-4 border-primary"
                    : "hover:bg-surface"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {getChatAvatar(conv) ? (
                      <Avatar src={getChatAvatar(conv)} size="12" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {getChatInitial(conv)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-text-primary text-base font-medium leading-normal truncate">
                      {getChatName(conv)}
                    </p>
                    <p className="text-text-secondary text-sm font-normal leading-normal truncate">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
                {conv.lastMessage?.createdAt && (
                  <p className="text-text-secondary text-xs font-normal shrink-0">
                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-3">chat_bubble_outline</span>
              <p className="text-text-primary font-medium">No conversations yet</p>
              <p className="text-text-secondary text-sm mt-1">Start a conversation from a profile page</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat View */}
      <main className="flex flex-1 flex-col bg-surface">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <header className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {getChatAvatar(activeChat) ? (
                  <Avatar src={getChatAvatar(activeChat)} size="10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {getChatInitial(activeChat)}
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-text-primary text-base font-bold leading-normal">
                    {getChatName(activeChat)}
                  </p>
                  <p className="text-text-secondary text-sm font-normal">
                    {activeChat.isGroup ? `${activeChat.participants?.length || 0} members` : "Direct Message"}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-3 ${isOwnMessage(msg) ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {(msg.senderId?.profile?.displayName || msg.sender?.profile?.displayName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex flex-col items-${isOwnMessage(msg) ? "end" : "start"} gap-1 max-w-lg`}>
                      <div className={`p-3 rounded-xl ${isOwnMessage(msg)
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-background text-text-primary rounded-tl-sm"
                        }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">forum</span>
                  <p className="text-text-secondary text-sm">No messages in this conversation yet. Say hi!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <footer className="p-4 border-t border-border">
              <div className="flex items-center gap-2 bg-background rounded-lg p-2 border border-border focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary border-none focus:ring-0 text-sm"
                  placeholder="Type a message..."
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !messageInput.trim()}
                  className="flex items-center justify-center size-8 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">chat</span>
            <p className="text-text-primary text-lg font-semibold">Select a conversation</p>
            <p className="text-text-secondary text-sm mt-1">Choose a conversation from the left to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
}
