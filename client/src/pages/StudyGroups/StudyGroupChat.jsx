import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "@/hooks/useHomeTheme";
import { fetchStudyGroupById, selectSelectedStudyGroup } from "../../redux/slices/studyGroupSlice";
import {
  fetchMessages,
  sendMessageThunk,
  selectMessagesByConversation,
  selectChatLoading,
} from "../../redux/slices/chatSlice";
import { useAuth } from "../../hooks/useAuth";
import ChatMessage from "../../components/studyGroups/ChatMessage";
import GroupChatInput from "../../components/studyGroups/GroupChatInput";
import {
  getStudyGroupTheme,
  studyGroupPageTitle,
} from "../../components/studyGroups/studyGroupTheme";

export default function StudyGroupChat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

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
        await dispatch(
          sendMessageThunk({
            chatId,
            messageData: { content: text.trim() },
          })
        ).unwrap();
        setText("");
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  if (!group && !loading) {
    return (
      <div className={`flex h-screen items-center justify-center ${theme.page}`}>
        <p className={theme.muted}>Study group not found.</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen flex-col ${theme.page}`}>
      <div className={`border-b ${theme.hero}`}>
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/study-groups/${id}`)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${theme.muted} ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to group
          </button>

          <div className={`rounded-[28px] border p-5 sm:p-6 ${theme.surface}`}>
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.accentSurface}`}>
                <span className={`material-symbols-outlined text-[22px] ${theme.iconAccent}`}>chat</span>
              </div>
              <div>
                <h1 className={`${studyGroupPageTitle} ${theme.title}`}>{group?.name || "Chat"}</h1>
                <p className={`mt-1 text-sm ${theme.muted}`}>
                  {group?.memberCount || 0} members in discussion
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className={`rounded-[28px] border p-4 sm:p-6 ${theme.surface}`}>
            {loading && messages.length === 0 ? (
              <div className="flex justify-center py-12">
                <span className={`material-symbols-outlined animate-spin text-3xl ${theme.iconAccent}`}>sync</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center">
                <span className={`material-symbols-outlined mb-4 text-6xl ${theme.subtle}`}>forum</span>
                <p className={theme.muted}>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
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
                        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      }}
                      isOwn={isOwn}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      <GroupChatInput message={text} setMessage={setText} onSend={handleSend} />
    </div>
  );
}
