import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Chat Window Component - Main chat interface container
 * Handles chat state, message management, and UI coordination
 */
const ChatWindow = React.forwardRef(({
  chat,
  currentUser,
  messages = [],
  onlineUsers = [],
  onSendMessage,
  onLoadMoreMessages,
  onMessageReply,
  onMessageReact,
  onMessageEdit,
  onMessageDelete,
  onTyping,
  onStopTyping,
  typingUsers = [],
  isMinimized = false,
  onMinimize,
  onClose,
  onMaximize,
  loading = false,
  hasMoreMessages = false,
  className = '',
  ...props
}, ref) => {
  const [replyTo, setReplyTo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState(messages);

  const windowRef = useRef(null);
  const combinedRef = ref || windowRef;

  // Filter messages based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(message =>
        message.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [messages, searchQuery]);

  // Handle message reply
  const handleMessageReply = (message) => {
    setReplyTo({
      id: message.id,
      sender: message.sender?.name || 'Unknown',
      content: message.content || 'Attachment'
    });
    onMessageReply?.(message);
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null);
  };

  // Handle send message
  const handleSendMessage = async (messageData) => {
    try {
      await onSendMessage({
        ...messageData,
        chatId: chat.id,
        senderId: currentUser.id
      });

      // Clear reply after sending
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle window controls
  const handleMinimize = () => {
    onMinimize?.();
  };

  const handleMaximize = () => {
    setIsFullscreen(!isFullscreen);
    onMaximize?.(!isFullscreen);
  };

  const handleClose = () => {
    onClose?.();
  };

  // Get chat display info
  const getChatDisplayInfo = () => {
    if (chat.type === 'direct') {
      const otherUser = chat.participants.find(p => p.id !== currentUser.id);
      return {
        title: otherUser?.name || 'Unknown User',
        avatar: otherUser?.avatar,
        subtitle: otherUser?.isOnline ? 'Online' : 'Offline',
        status: otherUser?.status
      };
    } else if (chat.type === 'group') {
      const onlineCount = chat.participants.filter(p => p.isOnline).length;
      return {
        title: chat.name || 'Group Chat',
        avatar: chat.avatar,
        subtitle: `${chat.participants.length} members, ${onlineCount} online`,
        status: 'group'
      };
    }

    return {
      title: 'Chat',
      avatar: null,
      subtitle: '',
      status: null
    };
  };

  const chatInfo = getChatDisplayInfo();

  // Animation variants
  const windowVariants = {
    minimized: {
      height: 60,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    normal: {
      height: isFullscreen ? '100vh' : 600,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    fullscreen: {
      height: '100vh',
      width: '100vw',
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.1 } }
  };

  return (
    <motion.div
      ref={combinedRef}
      className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${className}`}
      variants={windowVariants}
      animate={
        isMinimized ? 'minimized' :
        isFullscreen ? 'fullscreen' : 'normal'
      }
      initial="normal"
      {...props}
    >
      {/* Header */}
      <ChatHeader
        chat={chat}
        chatInfo={chatInfo}
        isMinimized={isMinimized}
        isFullscreen={isFullscreen}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlineUsers={onlineUsers}
        showOnlineUsers={showOnlineUsers}
        onToggleOnlineUsers={() => setShowOnlineUsers(!showOnlineUsers)}
      />

      {/* Minimized view */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            className="flex items-center justify-between px-4 py-2"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="flex items-center space-x-3">
              <Avatar
                src={chatInfo.avatar}
                name={chatInfo.title}
                size="sm"
                status={chatInfo.status}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{chatInfo.title}</div>
                <div className="text-xs text-gray-500">{chatInfo.subtitle}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <Badge count={messages.filter(m => !m.read && m.sender?.id !== currentUser.id).length} size="xs" />
              )}
              <IconButton
                icon="expand_more"
                size="sm"
                onClick={() => onMinimize?.(false)}
                className="text-gray-400 hover:text-gray-600"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="flex flex-col flex-1 overflow-hidden"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Messages area */}
            <div className="flex-1 relative">
              <MessageList
                messages={filteredMessages}
                currentUser={currentUser}
                onMessageReply={handleMessageReply}
                onMessageReact={onMessageReact}
                onMessageEdit={onMessageEdit}
                onMessageDelete={onMessageDelete}
                loading={loading}
                hasMore={hasMoreMessages}
                onLoadMore={onLoadMoreMessages}
                showAvatars={chat.type === 'group'}
                showTimestamps={true}
                showStatus={true}
                allowReactions={true}
                allowReplies={true}
                allowEdit={true}
                allowDelete={true}
                className="h-full"
              />

              {/* Search results indicator */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm shadow-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {filteredMessages.length} results for "{searchQuery}"
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Online users sidebar */}
            <AnimatePresence>
              {showOnlineUsers && chat.type === 'group' && (
                <motion.div
                  className="w-64 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 256, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Online ({onlineUsers.length})
                  </h3>
                  <div className="space-y-2">
                    {onlineUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Avatar
                          src={user.avatar}
                          name={user.name}
                          size="sm"
                          status="online"
                        />
                        <span className="text-sm text-gray-700">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onTyping={onTyping}
              onStopTyping={onStopTyping}
              placeholder={`Message ${chatInfo.title}...`}
              disabled={loading}
              showEmojiPicker={true}
              showFileUpload={true}
              showVoiceMessage={true}
              mentionableUsers={chat.participants}
              showTypingIndicator={true}
              typingUsers={typingUsers}
              replyTo={replyTo}
              onCancelReply={handleCancelReply}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ChatWindow.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['direct', 'group']).isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
        isOnline: PropTypes.bool,
        status: PropTypes.string
      })
    )
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string
  }).isRequired,
  messages: PropTypes.array,
  onlineUsers: PropTypes.array,
  onSendMessage: PropTypes.func.isRequired,
  onLoadMoreMessages: PropTypes.func,
  onMessageReply: PropTypes.func,
  onMessageReact: PropTypes.func,
  onMessageEdit: PropTypes.func,
  onMessageDelete: PropTypes.func,
  onTyping: PropTypes.func,
  onStopTyping: PropTypes.func,
  typingUsers: PropTypes.arrayOf(PropTypes.string),
  isMinimized: PropTypes.bool,
  onMinimize: PropTypes.func,
  onClose: PropTypes.func,
  onMaximize: PropTypes.func,
  loading: PropTypes.bool,
  hasMoreMessages: PropTypes.bool,
  className: PropTypes.string
};

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;