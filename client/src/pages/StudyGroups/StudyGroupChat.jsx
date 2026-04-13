import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudyGroupById,
  selectSelectedGroup,
  selectGroupMessages,
  setGroupMessages,
  addMessage,
  selectStudyGroupLoading,
} from "../../redux/slices/studyGroupSlice";
import PageHeader from "../../components/common/PageHeader";
import ChatMessage from "../../components/studyGroups/ChatMessage";
import GroupChatInput from "../../components/studyGroups/GroupChatInput";

export default function StudyGroupChat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const group = useSelector(selectSelectedGroup);
  const messages = useSelector(selectGroupMessages(id));
  const loading = useSelector(selectStudyGroupLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudyGroupById(id));
    }
  }, [dispatch, id]);

  const handleSend = () => {
    if (message.trim()) {
      // Get current user info
      let currentUser = { displayName: 'You' };
      try {
        const authState = JSON.parse(localStorage.getItem('authState') || '{}');
        currentUser = authState?.user || currentUser;
      } catch { /* ignore */ }

      const newMessage = {
        id: Date.now(),
        author: currentUser.profile?.displayName || currentUser.displayName || "You",
        avatar: (currentUser.profile?.displayName || "Y").substring(0, 2).toUpperCase(),
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };
      dispatch(addMessage({ groupId: id, message: newMessage }));
      setMessage("");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background text-text-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading chat...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-screen bg-background text-text-primary flex items-center justify-center">
        <p className="text-text-secondary">Study group not found.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-text-primary flex flex-col">
      {/* Header */}
      <PageHeader
        title={group.name}
        subtitle={`${group.memberCount || 0} members`}
        icon="chat"
        backPath={`/study-groups/${id}`}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              <span className="material-symbols-outlined text-5xl mb-4 block">chat</span>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg._id || msg.id} message={msg} isOwn={msg.isOwn} />
            ))
          )}
        </div>
      </div>

      {/* Message Input */}
      <GroupChatInput
        message={message}
        setMessage={setMessage}
        onSend={handleSend}
      />
    </div>
  );
}
