import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchMessages, 
  sendMessageThunk, 
  selectMessagesByConversation,
  selectChatLoading,
  newMessage,
  setTypingStatus,
  selectTypingByConversation,
  setSelectedConversation
} from "../../redux/slices/chatSlice";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks";
import { toast } from "react-hot-toast";

export default function StudyGroupChatView({ chatId, groupName }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  
  const allMessages = useSelector(selectMessagesByConversation);
  const messages = useMemo(() => allMessages[chatId] || [], [allMessages, chatId]);
  const loading = useSelector(selectChatLoading).messages;
  const typingStatus = useSelector(selectTypingByConversation)[chatId];

  // Socket setup for this specific room
  useEffect(() => {
    if (!socket || !chatId) return;

    // Join room dynamically (Backend handler now supports this)
    socket.emit("chat:join", { chatId });
    
    // Set as active conversation in Redux so global handlers work correctly
    dispatch(setSelectedConversation(chatId));

    // Cleanup
    return () => {
      socket.emit("chat:leave", { chatId });
      dispatch(setSelectedConversation(null));
    };
  }, [socket, chatId, dispatch]);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages({ chatId }));
    }
  }, [dispatch, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !chatId) return;

    try {
      await dispatch(sendMessageThunk({ 
        chatId, 
        messageData: { content: text.trim(), type: "text" } 
      })).unwrap();
      setText("");
      socket.emit("typing:stop", { chatId });
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    
    if (e.target.value.trim().length > 0) {
      socket.emit("typing:start", { chatId });
    } else {
      socket.emit("typing:stop", { chatId });
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-[600px] w-full items-center justify-center bg-[#0d1117]/50 rounded-2xl border border-[#30363d]">
        <div className="w-8 h-8 border-4 border-[#238636] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#8b949e] text-sm">Connecting to group chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] w-full bg-[#0d1117] rounded-2xl border border-[#30363d] overflow-hidden shadow-2xl">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90">
        <div className="flex flex-col gap-2">
            <div className="self-center bg-[#21262d] py-1 px-3 rounded-full border border-[#30363d] mb-4">
                <p className="text-[10px] text-[#8b949e] font-bold uppercase tracking-widest">End-to-end Liked Session</p>
            </div>

            {messages.map((msg, idx) => {
                const senderId = msg.sender?._id || msg.sender;
                const isOwn = senderId === user?._id;
                const prevMsg = idx > 0 ? messages[idx-1] : null;
                const prevSenderId = prevMsg?.sender?._id || prevMsg?.sender;
                const isFirstInBlock = senderId !== prevSenderId;

                return (
                    <div key={msg._id || idx} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${isFirstInBlock ? 'mt-3' : 'mt-0.5'}`}>
                        {!isOwn && isFirstInBlock && (
                            <p className="text-xs font-bold text-[#3fb950] ml-2 mb-1">
                                {msg.sender?.profile?.displayName || "Member"}
                            </p>
                        )}
                        <div className={`flex items-end gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isOwn && isFirstInBlock && (
                                <img 
                                    src={msg.sender?.profile?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.profile?.displayName || 'U'}&background=random`} 
                                    className="w-8 h-8 rounded-full border border-[#30363d] mb-1" 
                                    alt="avatar"
                                />
                            )}
                            {!isOwn && !isFirstInBlock && <div className="w-8" />}
                            
                            <div className={`px-3 py-2 rounded-2xl text-sm relative group ${
                                isOwn 
                                    ? 'bg-[#238636] text-white rounded-tr-none' 
                                    : 'bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-tl-none'
                            }`}>
                                <p className="leading-relaxed">{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right opacity-60 ${isOwn ? 'text-white' : 'text-[#8b949e]'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {typingStatus?.isTyping && (
                <div className="flex items-center gap-2 mt-2 ml-10">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <p className="text-xs text-[#8b949e] font-medium">{typingStatus.userName} is typing...</p>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={text}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#238636] transition-all pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#c9d1d9]">
                    <span className="material-symbols-outlined text-lg">mood</span>
                </button>
            </div>
            <button
                type="submit"
                disabled={!text.trim()}
                className="w-12 h-12 flex items-center justify-center bg-[#238636] text-white rounded-xl hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:grayscale transition-all shadow-lg"
            >
                <span className="material-symbols-outlined">send</span>
            </button>
        </form>
      </div>
    </div>
  );
}
