

/**
 * MessageBubble Component
 * Displays individual chat messages with timestamp, status, and avatar
 */
import { Check } from 'lucide-react';

/**
 * Format a timestamp into a human-readable time (e.g., "9:25 AM")
 * Safely handles strings, numbers, or Date objects
 */
const formatTime = (timestamp) => {
  if (!timestamp) return ''; // Handle missing timestamp
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) return ''; // Invalid date
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * StatusIcon Component
 * Shows WhatsApp-style single/double check marks for sent messages
 */
const StatusIcon = ({ status }) => {
  const iconSize = 16;

  if (status === 'sent') {
    return <Check size={iconSize} className="status-icon" />;
  }

  if (status === 'delivered' || status === 'read') {
    return (
      <div className={`status-icon double-check ${status === 'read' ? 'read' : ''}`}>
        <Check size={iconSize} className="tick first" />
        <Check size={iconSize} className="tick second" />
      </div>
    );
  }

  return null;
};

/**
 * MessageBubble Component
 */
const MessageBubble = ({ message, isCurrentUser, userColor }) => {
  // Safely generate initials for avatar
  const initials = message.senderName
    ? message.senderName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
      <div className={`bubble-content ${isCurrentUser ? 'reverse' : ''}`}>
        {/* Avatar for received messages */}
        {!isCurrentUser && (
          <div className={`avatar ${userColor || 'blue'}`}>
            {initials}
          </div>
        )}

        <div className={`message-content ${isCurrentUser ? 'align-end' : ''}`}>
          {/* Message Text */}
          <div className={`bubble ${isCurrentUser ? 'sent' : 'received'}`}>
            <p>{message.text || ''}</p>
          </div>

          {/* Message Footer: Time + Status */}
          <div className="message-footer">
            <span className="message-time">{formatTime(message.timestamp)}</span>
            {isCurrentUser && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
