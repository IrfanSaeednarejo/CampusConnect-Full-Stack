import { MoreVertical, Search, Users, Settings, LogOut } from 'lucide-react';

/**
 * Chat Header Component
 * Top bar of the chat window showing current conversation details
 * Displays contact name, online status, and action menu
 */
const ChatHeader = ({ conversation, avatarColor }) => {
  return (
    <div className="chat-header">
      <div className="header-info">
        {/* Avatar with Online Status Indicator */}
        <div className="avatar-container">
          <div className={`avatar ${avatarColor}`}>{conversation.avatar}</div>
          {/* Show green dot for online users only */}
          {conversation.type === 'user' && conversation.status === 'online' && (
            <span className="status-indicator"></span>
          )}
        </div>
        {/* User/Group Details */}
        <div className="user-details">
          <h3>{conversation.name}</h3>
          <p>
            {conversation.type === 'group' 
              ? `${conversation.members} members` 
              : conversation.status}
          </p>
        </div>
      </div>
      {/* More Options Menu */}
      <div className="header-actions">
        <button>
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;