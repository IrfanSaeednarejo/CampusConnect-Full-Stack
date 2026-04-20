
/**
 * Chat Sidebar Component
 * Middle panel showing list of all conversations (users and groups)
 * Displays conversation previews with avatars, names, last messages, and timestamps
 * Includes search functionality to filter conversations
 */

import React, { useState, useMemo } from 'react';
import { Search, Archive, Pin, BellOff } from 'lucide-react';

const ChatSidebar = ({
  conversations,
  selectedId,
  onSelectConversation,
  archivedCount = 0,
  showArchived = false,
  onToggleArchived
}) => {
  // State for search query input
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations; // Return all if no search
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter(conversation => 
      conversation.name.toLowerCase().includes(query) || // Search names
      conversation.lastMessage.toLowerCase().includes(query) // Search messages
    );
  }, [conversations, searchQuery]);

  // Format timestamp to show date like "9:30 AM", "Yesterday", or "Nov 22"
  const formatSidebarTime = (date) => {
    if (!date) return '';
    const timestamp = new Date(date);
    if (isNaN(timestamp.getTime())) return '';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    return timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get avatar color based on user ID or group type
  const getAvatarColor = (conversation) => {
    if (conversation.avatarColor) return conversation.avatarColor;
    return 'blue'; // Default
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId) => {
    onSelectConversation(conversationId);
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h2>Messages</h2>
          <button
            className={`archived-toggle ${showArchived ? 'active' : ''}`}
            onClick={onToggleArchived}
            title="Archived"
          >
            <Archive size={16} />
            <span>Archived</span>
            <span className="archived-count">{archivedCount}</span>
          </button>
        </div>
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Show search results count */}
      {searchQuery && (
        <div className="search-results-info">
          <span>
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </span>
        </div>
      )}

      {/* Conversations list */}
      <div className="conversation-list">
        {filteredConversations.length > 0 ? (
          // Map through filtered conversations
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${selectedId === conversation.id ? 'active' : ''}`}
              onClick={() => handleConversationSelect(conversation.id)}
            >
              {/* Avatar with status */}
              <div className="avatar-container">
                <div className={`avatar ${getAvatarColor(conversation)}`}>
                  {conversation.avatar || conversation.name[0]}
                </div>

                {/* Show status only for users, not groups */}
                {conversation.type === 'user' && conversation.status && (
                  <span className={`status-indicator ${conversation.status}`}></span>
                )}
              </div>
              
              {/* Conversation details */}
              <div className="conversation-info">
                <div className="conversation-header">
                  <h3>{conversation.name}</h3>
                  <span className="timestamp">
                    {formatSidebarTime(conversation.timestamp)}
                  </span>
                </div>
                <div className="conversation-footer">
                  <p className="last-message">{conversation.lastMessage || 'No messages yet'}</p>
                  <div className="conversation-badges">
                    {conversation.isPinned && <Pin size={14} />}
                    {conversation.isMuted && <BellOff size={14} />}
                    {conversation.unread > 0 && (
                      <span className="unread-badge">{conversation.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No results message
          <div className="no-results">
            <p>No conversations found</p>
            {searchQuery && (
              <span>Try adjusting your search terms</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;