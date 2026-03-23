// ============================================
// FILE: components/ChatWindow.jsx
// ============================================
import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList'; 
import ChatInput from './ChatInput';

const ChatWindow = ({ conversation, messages, onSendMessage }) => {
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendMessage?.(draft);
    setDraft('');
  };

  return (
    <div className="chat-window">
      {/* Header with conversation info */}
      <ChatHeader conversation={conversation} avatarColor={conversation?.avatarColor} />
      
      {/* Scrollable message list */}
      <MessageList 
        messages={messages || []} 
        conversationStartTime={new Date('2024-11-21T09:15:00')}
      />
      
      {/* Message input at bottom */}
      <ChatInput value={draft} onChange={setDraft} onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;