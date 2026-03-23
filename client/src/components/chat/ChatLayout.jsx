
// ============================================
// FILE: components/ChatLayout.jsx
// ============================================

import React, { useState } from 'react';
import { Home, Calendar, Users, Settings, LogOut, MessageSquare } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './Chatwindow';
import mockData from "../../data/ChatMock.json";
import "../../styles/components/chat.scss";

const { mockUsers, mockGroups, mockMessages } = mockData;

const ChatLayout = () => {
  // Combine users and groups
  const allConversations = [...mockUsers, ...mockGroups].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // FIX: Start with no conversation selected instead of defaulting to 'user-1'
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messagesData, setMessagesData] = useState(mockMessages);

  // Get the selected conversation (will be null if none selected)
  const selectedConversation = allConversations.find(
    conv => conv.id === selectedConversationId
  );
  
  // Get messages for selected conversation (empty array if none selected)
  const messages = selectedConversationId ? (messagesData[selectedConversationId] || []) : [];

  /**
   * Handle sending a new message
   * @param {string} text - The message text to send
   */
  const handleSendMessage = (text) => {
    if (!selectedConversationId) return; // Don't send if no conversation selected

    const newMessage = {
      id: `msg-${Date.now()}`,
      text,
      timestamp: new Date(),
      senderId: 'current',
      senderName: 'You',
      status: 'sent'
    };

    setMessagesData(prev => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage]
    }));
  };

  return (
    <div className="messaging-container">
      {/* Navigation Sidebar */}
      <div className="nav-sidebar">
        <div className="user-avatar">ME</div>
        <nav>
          <button className="nav-button">
            <Home size={22} />
          </button>
          <button className="nav-button active">
            <Calendar size={22} />
          </button>
          <button className="nav-button">
            <Users size={22} />
          </button>
          <button className="nav-button">
            <Users size={22} />
          </button>
        </nav>
        <div className="nav-footer">
          <button className="nav-button">
            <Settings size={22} />
          </button>
          <button className="nav-button">
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        conversations={allConversations}
        selectedId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />

      {/* Chat Window - Only show when a conversation is selected */}
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      ) : (
        // Show placeholder when no conversation is selected
        <div className="chat-window no-conversation-selected">
          <div className="placeholder-content">
            <div className="placeholder-icon">
              <MessageSquare size={64} />
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a chat from the sidebar to start messaging</p>
            <button className="start-chat-button">
              Open any Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;