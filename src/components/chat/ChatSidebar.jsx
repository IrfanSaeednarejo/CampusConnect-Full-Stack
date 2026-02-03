import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Chat Sidebar Component with chat list, search, and filtering
 */
const ChatSidebar = React.forwardRef(({
  chats = [],
  activeChatId,
  currentUser,
  onChatSelect,
  onNewChat,
  onSearch,
  searchQuery = '',
  filters = ['all', 'unread', 'groups', 'direct'],
  activeFilter = 'all',
  onFilterChange,
  showOnlineStatus = true,
  className = '',
  ...props
}, ref) => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter and sort chats
  const filteredChats = useMemo(() => {
    let filtered = chats;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.participants?.some(p =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(chat =>
          chat.unreadCount > 0 || chat.messages?.some(m => !m.read && m.senderId !== currentUser.id)
        );
        break;
      case 'groups':
        filtered = filtered.filter(chat => chat.type === 'group');
        break;
      case 'direct':
        filtered = filtered.filter(chat => chat.type === 'direct');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by last message timestamp
    return filtered.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });
  }, [chats, searchQuery, activeFilter, currentUser.id]);

  // Get chat display info
  const getChatDisplayInfo = (chat) => {
    if (chat.type === 'direct') {
      const otherUser = chat.participants.find(p => p.id !== currentUser.id);
      return {
        name: otherUser?.name || 'Unknown User',
        avatar: otherUser?.avatar,
        subtitle: otherUser?.isOnline ? 'Online' : 'Offline',
        status: otherUser?.status,
        isOnline: otherUser?.isOnline
      };
    } else if (chat.type === 'group') {
      const onlineCount = chat.participants.filter(p => p.isOnline).length;
      return {
        name: chat.name || 'Group Chat',
        avatar: chat.avatar,
        subtitle: `${chat.participants.length} members${onlineCount > 0 ? `, ${onlineCount} online` : ''}`,
        status: 'group',
        isOnline: onlineCount > 0
      };
    }

    return {
      name: 'Chat',
      avatar: null,
      subtitle: '',
      status: null,
      isOnline: false
    };
  };

  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Get unread count for chat
  const getUnreadCount = (chat) => {
    return chat.unreadCount || chat.messages?.filter(m => !m.read && m.senderId !== currentUser.id).length || 0;
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    onChatSelect(chat);
  };

  // Sidebar animation variants
  const sidebarVariants = {
    expanded: {
      width: 320,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    collapsed: {
      width: 72,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`bg-white border-r border-gray-200 flex flex-col ${className}`}
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      initial="expanded"
      {...props}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h2
                className="text-xl font-semibold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Messages
              </motion.h2>
            )}
          </AnimatePresence>

          <div className="flex items-center space-x-2">
            <IconButton
              icon="add"
              size="sm"
              onClick={() => setShowNewChatModal(true)}
              className="text-gray-400 hover:text-gray-600"
            />

            <IconButton
              icon={isCollapsed ? 'chevron_right' : 'chevron_left'}
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-gray-600"
            />
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-symbols-outlined text-sm">search</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex space-x-1 mt-3 overflow-x-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => onFilterChange?.(filter)}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredChats.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
                chat_bubble_outline
              </span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No chats found' : 'No messages yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Start a conversation to see your chats here'}
              </p>
              <Button onClick={() => setShowNewChatModal(true)}>
                Start New Chat
              </Button>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map((chat, index) => {
                const chatInfo = getChatDisplayInfo(chat);
                const unreadCount = getUnreadCount(chat);
                const isActive = chat.id === activeChatId;

                return (
                  <motion.div
                    key={chat.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => handleChatSelect(chat)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={chatInfo.avatar}
                          name={chatInfo.name}
                          size={isCollapsed ? 'sm' : 'md'}
                          status={showOnlineStatus ? chatInfo.status : null}
                          variant={chat.type === 'group' ? 'rounded' : 'circular'}
                        />

                        {/* Unread indicator */}
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1">
                            <Badge count={unreadCount} size="xs" color="danger" />
                          </div>
                        )}
                      </div>

                      {/* Chat info */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            className="flex-1 min-w-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className={`text-sm font-medium truncate ${
                                isActive ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                {chatInfo.name}
                              </h3>

                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatLastMessageTime(chat.lastMessage?.timestamp || chat.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500 truncate flex-1 mr-2">
                                {chat.lastMessage ? (
                                  chat.lastMessage.type === 'text' ? chat.lastMessage.content :
                                  chat.lastMessage.type === 'image' ? '📷 Photo' :
                                  chat.lastMessage.type === 'file' ? '📎 File' :
                                  chat.lastMessage.type === 'system' ? chat.lastMessage.content :
                                  'New message'
                                ) : 'No messages yet'}
                              </p>

                              {chat.pinned && (
                                <span className="material-symbols-outlined text-gray-400 text-sm flex-shrink-0">
                                  push_pin
                                </span>
                              )}
                            </div>

                            {/* Typing indicator */}
                            {chat.typingUsers && chat.typingUsers.length > 0 && (
                              <div className="flex items-center space-x-1 mt-1">
                                <div className="flex space-x-0.5">
                                  <motion.div
                                    className="w-1 h-1 bg-blue-500 rounded-full"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                                  />
                                  <motion.div
                                    className="w-1 h-1 bg-blue-500 rounded-full"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                                  />
                                  <motion.div
                                    className="w-1 h-1 bg-blue-500 rounded-full"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                                  />
                                </div>
                                <span className="text-xs text-blue-600">typing...</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with user status */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                  status="online"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>

              <IconButton
                icon="settings"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

ChatSidebar.propTypes = {
  chats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['direct', 'group']).isRequired,
      name: PropTypes.string,
      avatar: PropTypes.string,
      participants: PropTypes.array,
      lastMessage: PropTypes.shape({
        id: PropTypes.string,
        content: PropTypes.string,
        type: PropTypes.string,
        timestamp: PropTypes.string,
        senderId: PropTypes.string
      }),
      unreadCount: PropTypes.number,
      messages: PropTypes.array,
      createdAt: PropTypes.string,
      pinned: PropTypes.bool,
      typingUsers: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  activeChatId: PropTypes.string,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string
  }).isRequired,
  onChatSelect: PropTypes.func.isRequired,
  onNewChat: PropTypes.func,
  onSearch: PropTypes.func,
  searchQuery: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.string),
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func,
  showOnlineStatus: PropTypes.bool,
  className: PropTypes.string
};

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;