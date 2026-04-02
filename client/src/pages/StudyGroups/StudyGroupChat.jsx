import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectStudyGroupById,
  selectGroupMessages,
  setGroupMessages,
  addMessage,
} from "../../redux/slices/studyGroupSlice";
import PageHeader from "../../components/common/PageHeader";
import ChatMessage from "../../components/studyGroups/ChatMessage";
import GroupChatInput from "../../components/studyGroups/GroupChatInput";

export default function StudyGroupChat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const group = useSelector(selectStudyGroupById(id));
  const messages = useSelector(selectGroupMessages(id));

  useEffect(() => {
    if (messages.length === 0) {
      const mockMessages = [
        {
          id: 1,
          author: "Sarah Johnson",
          avatar: "SJ",
          message:
            "Hey everyone! Don't forget we're meeting tomorrow at 6 PM in the library.",
          timestamp: "10:30 AM",
          isOwn: false,
        },
        {
          id: 2,
          author: "Alex Chen",
          avatar: "AC",
          message:
            "Thanks for the reminder! I'll bring my notes from last week's lecture.",
          timestamp: "10:35 AM",
          isOwn: true,
        },
        {
          id: 3,
          author: "Emma Wilson",
          avatar: "EW",
          message:
            "Can someone explain the concept of pointers? I'm still confused.",
          timestamp: "11:15 AM",
          isOwn: false,
        },
        {
          id: 4,
          author: "Michael Brown",
          avatar: "MB",
          message:
            "Sure! I can go over that tomorrow. It's actually not as complicated as it seems.",
          timestamp: "11:20 AM",
          isOwn: false,
        },
      ];
      dispatch(setGroupMessages({ groupId: id, messages: mockMessages }));
    }
  }, [dispatch, id, messages.length]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1,
        author: "You",
        avatar: "Y",
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
        subtitle={`${group.members} members`}
        icon="chat"
        backPath={`/study-groups/${id}`}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} isOwn={msg.isOwn} />
          ))}
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
