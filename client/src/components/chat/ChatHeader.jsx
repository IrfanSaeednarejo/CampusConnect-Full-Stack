import {
  Search,
  X,
  Archive,
  Pin,
  BellOff,
  Bell,
  Trash2,
  MoreVertical,
  UserMinus
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import MutualConnectionsPreview from '../network/MutualConnectionsPreview';

/**
 * Chat Header Component
 * Top bar of the chat window showing current conversation details
 * Displays contact name, online status, and action menu
 */
const formatLastSeen = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const ChatHeader = ({
  conversation,
  avatarColor,
  isMuted,
  isArchived,
  isPinned,
  isTyping,
  typingName,
  lastSeen,
  searchQuery = '',
  searchInputRef,
  onSearch,
  onClose,
  onArchive,
  onMute,
  onPin,
  onClearChat,
  onDisconnect
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);
  const statusLine = () => {
    if (conversation.type === 'group') {
      return `${conversation.members || 0} members`;
    }
    if (isTyping) {
      return `${typingName || 'Someone'} typing...`;
    }
    if (conversation.status === 'online') {
      return 'online';
    }
    if (lastSeen) {
      return `last seen ${formatLastSeen(lastSeen)}`;
    }
    return 'offline';
  };

  return (
    <div className="chat-header shadow-sm">
      <div className="header-info">
        <div className="avatar-container">
          <div className={`avatar ${avatarColor} circular-avatar shadow-sm`}>
            {conversation.avatar && conversation.avatar.length > 2 ? (
              <img src={conversation.avatar} alt={conversation.name} />
            ) : (
              conversation.avatar
            )}
          </div>
          {conversation.type === 'user' && conversation.status === 'online' && (
            <span className="status-indicator online"></span>
          )}
        </div>
        <div className="user-details">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{conversation.name}</h3>
            {isPinned && <Pin size={12} className="text-emerald-500 fill-emerald-500" />}
          </div>
          <div className="status-container flex items-center gap-1.5">
            {conversation.type === 'user' && (
               <span className={`status-dot ${conversation.status === 'online' ? 'online' : 'offline'}`}></span>
            )}
            <p className="status-text">{statusLine()}</p>
          </div>
        </div>
      </div>
      <div className="header-actions">
        <div className="header-search">
          <Search size={16} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search in chat"
            value={searchQuery}
            onChange={(event) => onSearch?.(event.target.value)}
          />
        </div>
        <div className="header-buttons">
          <button onClick={onPin} title={isPinned ? 'Unpin' : 'Pin'}>
            <Pin size={18} className={isPinned ? 'active' : ''} />
          </button>
          <button onClick={onMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <button onClick={onArchive} title={isArchived ? 'Unarchive' : 'Archive'}>
            <Archive size={18} />
          </button>
          <button onClick={onClearChat} title="Clear chat">
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} title="Close">
            <X size={18} />
          </button>
          <div style={{ position: 'relative' }} ref={moreMenuRef}>
            <button 
              title="More options" 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreVertical size={18} />
            </button>
            {/* More options dropdown menu */}
            {showMoreMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,
                minWidth: '180px',
              }}>
                <button
                  onClick={() => {
                    onClearChat?.();
                    setShowMoreMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#c9d1d9',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #30363d',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0d1117'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Clear Chat History
                </button>
                <button
                  onClick={() => {
                    onArchive?.();
                    setShowMoreMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#c9d1d9',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #30363d',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0d1117'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {isArchived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to disconnect? You will need to send a new request to message again.")) {
                        onDisconnect?.();
                    }
                    setShowMoreMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#f87171',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1f2937'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <UserMinus size={16} /> Disconnect Connection
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#c9d1d9',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1f2937'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;