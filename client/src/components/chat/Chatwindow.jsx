// ============================================
// FILE: components/ChatWindow.jsx
// ============================================
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList'; 
import ChatInput from './ChatInput';
import mockData from "../../data/mockUsers.json";
// Access mock data for users, groups and messages
const { mockUsers, mockGroups, mockMessages } = mockData;

const ChatWindow = ({ conversation, messages, onSendMessage }) => {
  return (
    <div className="chat-window">
      {/* Header with conversation info */}
      <ChatHeader conversation={conversation} />
      
      {/* Scrollable message list */}
      <MessageList 
        messages={messages || []} 
        conversationStartTime={new Date('2024-11-21T09:15:00')}
      />
      
      {/* Message input at bottom */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatWindow;