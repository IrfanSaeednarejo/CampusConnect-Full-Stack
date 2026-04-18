import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudyGroupById, selectSelectedStudyGroup } from "../../redux/slices/studyGroupSlice";
import { 
  fetchMessages, 
  sendMessageThunk, 
  selectMessagesByConversation,
  selectChatLoading
} from "../../redux/slices/chatSlice";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import ChatMessage from "../../components/studyGroups/ChatMessage";
import GroupChatInput from "../../components/studyGroups/GroupChatInput";

export default function StudyGroupChat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const group = useSelector(selectSelectedStudyGroup);
  const chatId = group?.chatId;
  const allMessages = useSelector(selectMessagesByConversation);
  const messages = useMemo(() => allMessages[chatId] || [], [allMessages, chatId]);
  const loading = useSelector(selectChatLoading).messages;

  useEffect(() => {
    if (!group || group._id !== id) {
      dispatch(fetchStudyGroupById(id));
    }
  }, [dispatch, id, group]);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages({ chatId }));
    }
  }, [dispatch, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (text.trim() && chatId) {
      try {
        await dispatch(sendMessageThunk({ 
          chatId, 
          messageData: { content: text.trim() } 
        })).unwrap();
        setText("");
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  if (!group && !loading) {
    return (
      <div className="h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center">
        <p className="text-[#8b949e]">Study group not found.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Header */}
      <PageHeader
        title={group?.name || "Chat"}
        subtitle={`${group?.memberCount || 0} members`}
        icon="chat"
        backPath={`/study-groups/${id}`}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-10">
              <span className="material-symbols-outlined animate-spin text-3xl text-[#238636]">sync</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-[#30363d] mb-4">forum</span>
              <p className="text-[#8b949e]">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender;
              const isOwn = senderId === user?._id;
              
              return (
                <ChatMessage 
                  key={msg._id || msg.id} 
                  message={{
                    ...msg,
                    author: msg.sender?.profile?.displayName || "Member",
                    avatar: msg.sender?.profile?.avatar,
                    message: msg.content,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }} 
                  isOwn={isOwn} 
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <GroupChatInput
        message={text}
        setMessage={setText}
        onSend={handleSend}
      />
    </div>
  );
}
