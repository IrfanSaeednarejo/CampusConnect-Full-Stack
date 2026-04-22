

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
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
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
  const senderProfile = message.sender?.profile || {};
  const senderAvatar = senderProfile.avatar;
  const senderDisplayName = senderProfile.displayName || message.senderName || 'Unknown';

  const initials = senderDisplayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const reactionEntries = Object.entries(message.reactions || {});
  const isDeleted = message.isDeleted || message.deleted;

  return (
    <div
      className={`message-bubble ${isCurrentUser ? 'sent' : 'received'} ${
        isSearchMatch ? 'match' : ''
      } ${isDeleted ? 'is-deleted' : ''}`}
    >
      <div className={`bubble-content ${isCurrentUser ? 'reverse' : ''}`}>
        {!isCurrentUser && (
          <div className={`avatar ${userColor || 'blue'} circular-avatar shadow-sm`}>
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderDisplayName} />
            ) : (
              initials
            )}
          </div>
        )}

        <div className={`message-content ${isCurrentUser ? 'align-end' : ''}`}>
          <div className={`bubble ${isCurrentUser ? 'sent' : 'received'} ${isDeleted ? 'deleted' : ''} shadow-sm`}>
            {/* Action Buttons (Floating on hover) */}
            {!isDeleted && (
              <div className={`message-actions-overlay ${isCurrentUser ? 'sent' : 'received'}`}>
                <button onClick={onReply} title="Reply"><Reply size={14} /></button>
                {isCurrentUser && (
                  <>
                    <button onClick={onEdit} title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => onDelete?.(true)} title="Delete for everyone" className="delete-btn"><Trash2 size={14} /></button>
                  </>
                )}
                {!isCurrentUser && (
                   <button onClick={() => onDelete?.(false)} title="Delete for me" className="delete-btn"><Trash size={14} /></button>
                )}
                <button onClick={() => onReact?.('👍')} title="React"><Smile size={14} /></button>
              </div>
            )}

            {message.forwarded && <span className="message-forwarded flex items-center gap-1"><Forward size={10} /> Forwarded</span>}
            
            {/* Reply Preview */}
            {message.replyPreview && (
              <div className="message-reply-preview">
                <div className="reply-border"></div>
                <div className="reply-content">
                  <span className="reply-sender">{message.replyPreview.senderDisplayName}</span>
                  <span className="reply-text">{message.replyPreview.content}</span>
                </div>
              </div>
            )}

            <p className="message-text">
              {isDeleted ? "This message was deleted" : (message.content || message.text || '')}
            </p>

            <div className="message-footer">
              <span className="message-time">{formatTime(message.createdAt || message.timestamp)}</span>
              {message.isEdited && !isDeleted && <span className="edited-label">Edited</span>}
              {isCurrentUser && <StatusIcon status={message.status || 'sent'} />}
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
