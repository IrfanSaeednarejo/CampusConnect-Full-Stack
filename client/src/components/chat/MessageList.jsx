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
export default MessageList;


