import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Chat Header Component with user info, controls, and search functionality
 */
const ChatHeader = React.forwardRef(({
  chat,
  chatInfo,
  isMinimized = false,
  isFullscreen = false,
  onMinimize,
  onMaximize,
  onClose,
  searchQuery = '',
  onSearchChange,
  onlineUsers = [],
  showOnlineUsers = false,
  onToggleOnlineUsers,
  className = '',
  ...props
}, ref) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const searchInputRef = useRef(null);

  // Handle search toggle
  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Focus search input when opening
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      // Clear search when closing
      onSearchChange?.('');
    }
  };

  // Handle menu actions
  const handleMenuAction = (action) => {
    switch (action) {
      case 'profile':
        // Navigate to chat profile/settings
        break;
      case 'notifications':
        // Toggle notifications
        break;
      case 'block':
        // Block user/group
        break;
      case 'leave':
        // Leave group
        break;
      case 'report':
        // Report chat
        break;
      default:
        break;
    }
    setShowMenu(false);
  };

  // Menu items based on chat type
  const getMenuItems = () => {
    const baseItems = [
      { label: 'View Profile', action: 'profile', icon: 'person' },
      { label: 'Notification Settings', action: 'notifications', icon: 'notifications' }
    ];

    if (chat.type === 'group') {
      return [
        ...baseItems,
        { label: 'Group Info', action: 'group-info', icon: 'info' },
        { label: 'Add Members', action: 'add-members', icon: 'person_add' },
        { label: 'Leave Group', action: 'leave', icon: 'logout', danger: true }
      ];
    } else {
      return [
        ...baseItems,
        { label: 'Block User', action: 'block', icon: 'block', danger: true },
        { label: 'Report', action: 'report', icon: 'report', danger: true }
      ];
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`flex items-center justify-between p-4 border-b border-gray-200 bg-white ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Left section - Chat info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Chat avatar and info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Avatar
            src={chatInfo.avatar}
            name={chatInfo.title}
            size="md"
            status={chatInfo.status}
            variant={chat.type === 'group' ? 'rounded' : 'circular'}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {chatInfo.title}
              </h3>

              {/* Online status indicator */}
              {chatInfo.status === 'online' && (
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Group member count */}
              {chat.type === 'group' && chat.participants && (
                <Badge variant="outline" size="xs" color="secondary">
                  {chat.participants.length}
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-500 truncate">
              {chatInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Search input (when active) */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              className="flex-1 max-w-md"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
            >
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-symbols-outlined text-sm">search</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right section - Controls */}
      <div className="flex items-center space-x-1">
        {/* Search toggle */}
        <IconButton
          icon="search"
          size="sm"
          onClick={handleSearchToggle}
          className={`text-gray-400 hover:text-gray-600 ${showSearch ? 'text-blue-500' : ''}`}
        />

        {/* Online users toggle (for groups) */}
        {chat.type === 'group' && onlineUsers.length > 0 && (
          <div className="relative">
            <IconButton
              icon="people"
              size="sm"
              onClick={onToggleOnlineUsers}
              className={`text-gray-400 hover:text-gray-600 ${showOnlineUsers ? 'text-blue-500' : ''}`}
            >
              <Badge count={onlineUsers.length} size="xs" className="absolute -top-1 -right-1" />
            </IconButton>
          </div>
        )}

        {/* Call button */}
        <IconButton
          icon="call"
          size="sm"
          className="text-gray-400 hover:text-gray-600"
        />

        {/* Video call button */}
        <IconButton
          icon="videocam"
          size="sm"
          className="text-gray-400 hover:text-gray-600"
        />

        {/* Menu dropdown */}
        <div className="relative">
          <IconButton
            icon="more_vert"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600"
          />

          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {getMenuItems().map((item, index) => (
                  <button
                    key={item.action}
                    onClick={() => handleMenuAction(item.action)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                      item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimize button */}
        <IconButton
          icon={isMinimized ? 'expand_less' : 'minimize'}
          size="sm"
          onClick={() => onMinimize?.(!isMinimized)}
          className="text-gray-400 hover:text-gray-600"
        />

        {/* Maximize/Fullscreen button */}
        <IconButton
          icon={isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          size="sm"
          onClick={() => onMaximize?.(!isFullscreen)}
          className="text-gray-400 hover:text-gray-600"
        />

        {/* Close button */}
        <IconButton
          icon="close"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-red-600"
        />
      </div>

      {/* Typing indicator overlay */}
      <AnimatePresence>
        {chat.typingUsers && chat.typingUsers.length > 0 && (
          <motion.div
            className="absolute bottom-0 left-16 right-4 bg-blue-50 border-t border-blue-200 px-4 py-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <span className="text-sm text-blue-700">
                {chat.typingUsers.length === 1
                  ? `${chat.typingUsers[0]} is typing...`
                  : `${chat.typingUsers.slice(0, -1).join(', ')} and ${chat.typingUsers[chat.typingUsers.length - 1]} are typing...`
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ChatHeader.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['direct', 'group']).isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string,
    participants: PropTypes.array,
    typingUsers: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  chatInfo: PropTypes.shape({
    title: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    subtitle: PropTypes.string,
    status: PropTypes.string
  }).isRequired,
  isMinimized: PropTypes.bool,
  isFullscreen: PropTypes.bool,
  onMinimize: PropTypes.func,
  onMaximize: PropTypes.func,
  onClose: PropTypes.func,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  onlineUsers: PropTypes.array,
  showOnlineUsers: PropTypes.bool,
  onToggleOnlineUsers: PropTypes.func,
  className: PropTypes.string
};

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;