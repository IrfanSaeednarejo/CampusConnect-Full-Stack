
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

  // Format timestamp to show date like "Nov 22"
  const formatTimestampAbsolute = (date) => {
    const timestamp = new Date(date);
    return timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get avatar color based on user ID or group type
  const getAvatarColor = (conversation) => {
    if (conversation.avatarColor) return conversation.avatarColor;
    const { id, type } = conversation;
    if (type === 'group') {
      return 'group'; // Purple for groups
    }
    
    // Color map for different users
    const colorMap = {
      'user-1': 'blue',
      'user-2': 'teal',
      'user-3': 'pink',
      'user-4': 'indigo',
      'user-5': 'cyan',
      'user-6': 'emerald',
      'user-7': 'rose',
      'user-8': 'violet',
      'user-9': 'amber',
      'user-10': 'lime',
      'user-11': 'fuchsia',
      'user-12': 'sky',
      'user-13': 'red',
      'user-14': 'green',
      'user-15': 'purple'
    };
    
    return colorMap[id] || 'blue'; // Default to blue
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
                {conversation.type === 'user' && (
                  <span className={`status-indicator ${conversation.status}`}></span>
                )}
              </div>
              
              {/* Conversation details */}
              <div className="conversation-info">
                <div className="conversation-header">
                  <h3>{conversation.name}</h3>
                  <span className="timestamp">
                    {formatTimestampAbsolute(conversation.timestamp)}
                  </span>
                </div>
                <div className="conversation-footer">
                  <p className="last-message">{conversation.lastMessage}</p>
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


// /**
//  * Navigation Sidebar Component
//  * Left-most vertical navigation bar with icon buttons
//  * Provides navigation between different app sections (Home, Messages, Groups, Calendar)
//  */



// const NavSidebar = () => {
//   // State to track which navigation tab is currently active
//   const [activeTab, setActiveTab] = useState('messages');

//   return (

//     // <div className="nav-sidebar">
//     //   {/* User Avatar with Initials at Top */}
//     //   <div className="user-avatar">
//     //     ME
//     //   </div>

//     //   {/* Main Navigation Icons - Top Section */}
//     //   <nav>
//     //     {/* Home Button */}
//     //     <button 
//     //       className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
//     //       onClick={() => setActiveTab('home')}
//     //       title="Home"
//     //     >
//     //       <Home size={24} />
//     //     </button>

//     //     {/* Messages Button - Active by default */}
//     //     <button 
//     //       className={`nav-button ${activeTab === 'messages' ? 'active' : ''}`}
//     //       onClick={() => setActiveTab('messages')}
//     //       title="Messages"
//     //     >
//     //       <MessageSquare size={24} />
//     //     </button>

//     //     {/* Groups Button */}
//     //     <button 
//     //       className={`nav-button ${activeTab === 'groups' ? 'active' : ''}`}
//     //       onClick={() => setActiveTab('groups')}
//     //       title="Groups"
//     //     >
//     //       <Users size={24} />
//     //     </button>

//     //     {/* Calendar/Schedule Button */}
//     //     <button 
//     //       className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
//     //       onClick={() => setActiveTab('calendar')}
//     //       title="Calendar"
//     //     >
//     //       <Calendar size={24} />
//     //     </button>
//     //   </nav>

//     //   {/* Bottom Navigation Icons - Footer Section */}
//     //   <div className="nav-footer">
//     //     {/* Settings Button */}
//     //     <button className="nav-button" title="Settings">
//     //       <Settings size={24} />
//     //     </button>

//     //     {/* Logout Button */}
//     //     <button className="nav-button" title="Logout">
//     //       <LogOut size={24} />
//     //     </button>
//     //   </div>
//     // </div>
//   );
// };