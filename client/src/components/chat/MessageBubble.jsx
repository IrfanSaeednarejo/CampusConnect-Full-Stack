

/**
 * MessageBubble Component
 * Displays individual chat messages with timestamp, status, and actions
 */
import {
  Check,
  Clock,
  AlertCircle,
  Reply,
  Pencil,
  Forward,
  Trash2,
  Trash,
  Smile,
  RotateCcw
} from 'lucide-react';

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

  if (status === 'sending') {
    return <Clock size={iconSize} className="status-icon" />;
  }

  if (status === 'sent') {
    return <Check size={iconSize} className="status-icon" />;
  }

  if (status === 'failed') {
    return <AlertCircle size={iconSize} className="status-icon failed" />;
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
const MessageBubble = ({
  message,
  isCurrentUser,
  userColor,
  quickReactions = [],
  replyMessage,
  onReply,
  onEdit,
  onForward,
  onDelete,
  onReact,
  onRetry,
  isSearchMatch
}) => {
  // Safely generate initials for avatar
  const initials = message.senderName
    ? message.senderName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const reactionEntries = Object.entries(message.reactions || {});
  const isDeleted = message.deleted;

  return (
    <div
      className={`message-bubble ${isCurrentUser ? 'sent' : 'received'} ${
        isSearchMatch ? 'match' : ''
      }`}
    >
      <div className="message-actions">
        <button onClick={onReply} title="Reply">
          <Reply size={14} />
        </button>
        <button onClick={onForward} title="Forward">
          <Forward size={14} />
        </button>
        {isCurrentUser && !isDeleted && (
          <button onClick={onEdit} title="Edit">
            <Pencil size={14} />
          </button>
        )}
        <button onClick={() => onDelete?.(false)} title="Delete for me">
          <Trash2 size={14} />
        </button>
        {isCurrentUser && (
          <button onClick={() => onDelete?.(true)} title="Delete for everyone">
            <Trash size={14} />
          </button>
        )}
        {quickReactions.length > 0 && (
          <div className="quick-reactions">
            {quickReactions.map((emoji) => (
              <button key={emoji} onClick={() => onReact?.(emoji)} title={emoji}>
                {emoji}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => onReact?.('👍')} title="React">
          <Smile size={14} />
        </button>
      </div>

      <div className={`bubble-content ${isCurrentUser ? 'reverse' : ''}`}>
        {!isCurrentUser && (
          <div className={`avatar ${userColor || 'blue'}`}>
            {initials}
          </div>
        )}

        <div className={`message-content ${isCurrentUser ? 'align-end' : ''}`}>
          <div className={`bubble ${isCurrentUser ? 'sent' : 'received'} ${isDeleted ? 'deleted' : ''}`}>
            {message.forwarded && <span className="message-forwarded">Forwarded</span>}
            {replyMessage && (
              <div className="message-reply">
                <span className="reply-sender">
                  {replyMessage.senderName || 'Unknown'}
                </span>
                <span className="reply-text">{replyMessage.text}</span>
              </div>
            )}
            <p>{message.text || ''}</p>
          </div>

          {reactionEntries.length > 0 && (
            <div className={`reaction-bar ${isCurrentUser ? 'sent' : 'received'}`}>
              {reactionEntries.map(([emoji, users]) => (
                <button
                  key={emoji}
                  className={`reaction-chip ${users.includes('current') ? 'active' : ''}`}
                  onClick={() => onReact?.(emoji)}
                >
                  <span>{emoji}</span>
                  <span className="count">{users.length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="message-footer">
            <span className="message-time">{formatTime(message.timestamp)}</span>
            {message.edited && <span className="edited-label">edited</span>}
            {isCurrentUser && <StatusIcon status={message.status} />}
            {isCurrentUser && message.status === 'failed' && (
              <button className="retry-button" onClick={onRetry}>
                <RotateCcw size={12} /> Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
