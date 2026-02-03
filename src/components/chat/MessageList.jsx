import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import MessageBubble from './MessageBubble';
import Spinner from '../common/Spinner';

/**
 * Advanced Message List Component with virtualization, auto-scrolling, and loading states
 * Handles large message collections efficiently with smooth scrolling and animations
 */
const MessageList = React.forwardRef(({
  messages = [],
  currentUser,
  onMessageReply,
  onMessageReact,
  onMessageEdit,
  onMessageDelete,
  onMessageClick,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  showAvatars = true,
  showTimestamps = true,
  showStatus = true,
  allowReactions = true,
  allowReplies = true,
  allowEdit = true,
  allowDelete = true,
  className = '',
  ...props
}, ref) => {
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const combinedRef = ref || containerRef;
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [messageHeights, setMessageHeights] = useState(new Map());

  // Estimated height for each message type
  const getEstimatedHeight = (message) => {
    const baseHeight = 60; // Minimum height

    switch (message.type) {
      case 'text':
        // Estimate based on content length
        const lines = Math.ceil(message.content.length / 60);
        return Math.max(baseHeight, lines * 20 + 40);

      case 'image':
        return 200; // Fixed height for images

      case 'file':
        return 80; // Fixed height for file attachments

      case 'link':
        return message.preview ? 120 : 60;

      case 'system':
        return 40;

      default:
        return baseHeight;
    }
  };

  // Handle scroll events
  const handleScroll = useCallback(({ scrollTop, scrollHeight, clientHeight }) => {
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 300;

    setIsNearBottom(isAtBottom);
    setScrollToBottomVisible(!isAtBottom);
    setAutoScrollEnabled(isAtBottom);

    // Load more messages when scrolling to top
    if (scrollTop === 0 && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (autoScrollEnabled && messages.length > 0 && listRef.current) {
      const lastMessageIndex = messages.length - 1;
      listRef.current.scrollToItem(lastMessageIndex, 'end');
    }
  }, [messages.length, autoScrollEnabled]);

  // Scroll to bottom manually
  const scrollToBottom = () => {
    if (listRef.current) {
      const lastMessageIndex = messages.length - 1;
      listRef.current.scrollToItem(lastMessageIndex, 'end');
      setAutoScrollEnabled(true);
      setScrollToBottomVisible(false);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp).toDateString();

      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [],
          startIndex: index
        };
        groups.push(currentGroup);
      }

      currentGroup.messages.push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Format date header
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Render individual message
  const renderMessage = ({ index, style }) => {
    const message = messages[index];
    const isOwn = message.sender?.id === currentUser?.id;

    return (
      <div style={style} className="px-4">
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={isOwn}
          showAvatar={showAvatars}
          showTimestamp={showTimestamps}
          showStatus={showStatus && isOwn}
          allowReactions={allowReactions}
          allowReplies={allowReplies}
          allowEdit={allowEdit && isOwn}
          allowDelete={allowDelete && isOwn}
          onReply={onMessageReply}
          onReact={onMessageReact}
          onEdit={onMessageEdit}
          onDelete={onMessageDelete}
          onClick={onMessageClick}
          reactions={message.reactions || []}
          replies={message.replies || []}
        />
      </div>
    );
  };

  // Loading indicator component
  const LoadingIndicator = ({ type = 'initial' }) => (
    <div className="flex justify-center py-4">
      <div className="flex flex-col items-center space-y-2">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">
          {type === 'more' ? 'Loading more messages...' : 'Loading messages...'}
        </span>
      </div>
    </div>
  );

  // Date separator component
  const DateSeparator = ({ date, style }) => (
    <div style={style} className="flex justify-center py-4">
      <div className="bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
        <span className="text-xs font-medium text-gray-600">
          {formatDateHeader(date)}
        </span>
      </div>
    </div>
  );

  // Calculate total height including date separators
  const getItemSize = (index) => {
    const message = messages[index];
    let height = getEstimatedHeight(message);

    // Add extra space for date separators
    const messageDate = new Date(message.timestamp).toDateString();
    const prevMessage = messages[index - 1];
    if (!prevMessage || new Date(prevMessage.timestamp).toDateString() !== messageDate) {
      height += 60; // Space for date separator
    }

    return height;
  };

  return (
    <div
      ref={combinedRef}
      className={`relative flex flex-col h-full bg-gray-50 ${className}`}
      {...props}
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages container */}
      <div className="flex-1 relative">
        {messages.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
                chat_bubble_outline
              </span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500">Start a conversation by sending a message.</p>
            </div>
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                width={width}
                itemCount={messages.length}
                itemSize={getItemSize}
                onScroll={handleScroll}
                className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {renderMessage}
              </List>
            )}
          </AutoSizer>
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90">
            <LoadingIndicator type="more" />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {scrollToBottomVisible && messages.length > 10 && (
          <motion.button
            className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors"
            onClick={scrollToBottom}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* New message indicator */}
      <AnimatePresence>
        {!isNearBottom && messages.length > 0 && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            New messages
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'image', 'file', 'link', 'system']),
      content: PropTypes.string,
      timestamp: PropTypes.string.isRequired,
      sender: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
        isOnline: PropTypes.bool
      }),
      reactions: PropTypes.array,
      replies: PropTypes.array
    })
  ),
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string
  }),
  onMessageReply: PropTypes.func,
  onMessageReact: PropTypes.func,
  onMessageEdit: PropTypes.func,
  onMessageDelete: PropTypes.func,
  onMessageClick: PropTypes.func,
  loading: PropTypes.bool,
  loadingMore: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  showAvatars: PropTypes.bool,
  showTimestamps: PropTypes.bool,
  showStatus: PropTypes.bool,
  allowReactions: PropTypes.bool,
  allowReplies: PropTypes.bool,
  allowEdit: PropTypes.bool,
  allowDelete: PropTypes.bool,
  className: PropTypes.string
};

MessageList.displayName = 'MessageList';

export default MessageList;