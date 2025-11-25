/**
 * Message List Component
 * Scrollable container displaying all messages in the current conversation
 * Shows conversation start indicator and renders all message bubbles
 */

import MessageBubble from "./MessageBubble";
const MessageList = ({ messages, userColor }) => {
  return (
    <div className="message-list">
      {/* Conversation Start Indicator */}
      <div className="conversation-start">
        {/* <span>Today at 9:15 AM</span> */}
      </div>
      {/* Render all messages */}
      {messages.map(msg => (
        <MessageBubble 
          key={msg.id} 
          message={msg} 
          isCurrentUser={msg.senderId === 'current'}
          userColor={userColor}
        />
      ))}
    </div>
  );
};

// Chat Input Component
const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <div className="input-container">
        <button>
          <Smile size={22} />
        </button>
        <button>
          <Paperclip size={22} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button className="send-button" onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
export default MessageList;


