import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import IconButton from "../common/IconButton";

/**
 * Advanced Message Bubble Component with reactions, replies, and rich media support
 * Supports text, images, files, links, and various message types
 */
const MessageBubble = React.forwardRef(
  (
    {
      message,
      isOwn = false,
      showAvatar = true,
      showTimestamp = true,
      showStatus = false,
      allowReactions = true,
      allowReplies = true,
      allowEdit = false,
      allowDelete = false,
      onReply,
      onReact,
      onEdit,
      onDelete,
      onClick,
      isEditing = false,
      reactions = [],
      replies = [],
      className = "",
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const messageRef = useRef(null);
    const combinedRef = ref || messageRef;

    // Auto-scroll into view for new messages
    useEffect(() => {
      if (message.isNew && combinedRef.current) {
        combinedRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, [message.isNew]);

    // Format timestamp
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return format(date, "HH:mm");
      } else if (isYesterday(date)) {
        return `Yesterday ${format(date, "HH:mm")}`;
      } else {
        return format(date, "MMM d, HH:mm");
      }
    };

    // Message status indicators
    const getStatusIcon = (status) => {
      switch (status) {
        case "sending":
          return (
            <span className="material-symbols-outlined text-gray-400 text-sm">
              schedule
            </span>
          );
        case "sent":
          return (
            <span className="material-symbols-outlined text-gray-400 text-sm">
              check
            </span>
          );
        case "delivered":
          return (
            <span className="material-symbols-outlined text-blue-500 text-sm">
              done_all
            </span>
          );
        case "read":
          return (
            <span className="material-symbols-outlined text-blue-600 text-sm">
              done_all
            </span>
          );
        case "failed":
          return (
            <span className="material-symbols-outlined text-red-500 text-sm">
              error
            </span>
          );
        default:
          return null;
      }
    };

    // Handle reactions
    const handleReaction = (emoji) => {
      onReact?.(message.id, emoji);
      setShowReactions(false);
    };

    // Quick reactions
    const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

    // Message bubble variants
    const bubbleVariants = {
      own: "bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md",
      other:
        "bg-gray-100 text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-md",
      system: "bg-yellow-100 text-yellow-800 rounded-xl text-center text-sm",
    };

    // Animation variants
    const messageVariants = {
      hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 },
      },
    };

    // Render message content based on type
    const renderMessageContent = () => {
      switch (message.type) {
        case "text":
          return (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          );

        case "image":
          return (
            <div className="space-y-2">
              <div className="relative max-w-xs">
                <motion.img
                  src={message.content}
                  alt={message.alt || "Shared image"}
                  className="rounded-lg max-w-full h-auto cursor-pointer"
                  onClick={() => onClick?.(message)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imageLoaded ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400">
                      image
                    </span>
                  </div>
                )}
              </div>
              {message.caption && (
                <div className="text-sm opacity-90">{message.caption}</div>
              )}
            </div>
          );

        case "file":
          return (
            <div className="flex items-center space-x-3 p-3 bg-black bg-opacity-10 rounded-lg cursor-pointer hover:bg-opacity-20 transition-colors">
              <span className="material-symbols-outlined text-2xl">
                {message.fileType === "pdf"
                  ? "picture_as_pdf"
                  : message.fileType === "doc" || message.fileType === "docx"
                  ? "description"
                  : "attach_file"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{message.fileName}</div>
                <div className="text-xs opacity-75">{message.fileSize}</div>
              </div>
              <IconButton
                icon="download"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle file download
                }}
                className="text-current opacity-75 hover:opacity-100"
              />
            </div>
          );

        case "link":
          return (
            <div className="space-y-2">
              {message.preview && (
                <div className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  {message.preview.image && (
                    <img
                      src={message.preview.image}
                      alt={message.preview.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <div className="font-medium text-sm line-clamp-1">
                      {message.preview.title}
                    </div>
                    <div className="text-xs opacity-75 line-clamp-2">
                      {message.preview.description}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      {message.preview.url}
                    </div>
                  </div>
                </div>
              )}
              <div className="text-blue-500 underline cursor-pointer hover:text-blue-600">
                {message.content}
              </div>
            </div>
          );

        case "system":
          return (
            <div className="text-center text-sm opacity-90">
              {message.content}
            </div>
          );

        default:
          return <div>{message.content}</div>;
      }
    };

    // Don't render system messages as bubbles
    if (message.type === "system") {
      return (
        <motion.div
          ref={combinedRef}
          className="flex justify-center my-4"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          {...props}
        >
          <div className={`px-4 py-2 ${bubbleVariants.system} ${className}`}>
            {renderMessageContent()}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={combinedRef}
        className={`flex ${
          isOwn ? "justify-end" : "justify-start"
        } mb-4 group ${className}`}
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      >
        <div
          className={`flex ${
            isOwn ? "flex-row-reverse" : "flex-row"
          } items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl`}
        >
          {/* Avatar */}
          {showAvatar && !isOwn && message.sender && (
            <Avatar
              src={message.sender.avatar}
              name={message.sender.name}
              size="sm"
              status={message.sender.isOnline ? "online" : "offline"}
            />
          )}

          {/* Message Container */}
          <div
            className={`relative ${
              isOwn ? "items-end" : "items-start"
            } flex flex-col`}
          >
            {/* Sender name for group chats */}
            {!isOwn && message.sender && message.showSenderName && (
              <div className="text-xs text-gray-500 mb-1 px-3">
                {message.sender.name}
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`relative px-4 py-3 max-w-full ${
                bubbleVariants[isOwn ? "own" : "other"]
              }`}
            >
              {renderMessageContent()}

              {/* Message Actions (visible on hover) */}
              <AnimatePresence>
                {(isHovered || showReactions) && allowReactions && (
                  <motion.div
                    className={`absolute ${
                      isOwn ? "-left-12" : "-right-12"
                    } top-0 flex space-x-1`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <IconButton
                      icon="add_reaction"
                      size="sm"
                      onClick={() => setShowReactions(!showReactions)}
                      className="bg-white shadow-md hover:shadow-lg"
                    />

                    {allowReplies && (
                      <IconButton
                        icon="reply"
                        size="sm"
                        onClick={() => onReply?.(message)}
                        className="bg-white shadow-md hover:shadow-lg"
                      />
                    )}

                    {isOwn && allowEdit && (
                      <IconButton
                        icon="edit"
                        size="sm"
                        onClick={() => onEdit?.(message)}
                        className="bg-white shadow-md hover:shadow-lg"
                      />
                    )}

                    {isOwn && allowDelete && (
                      <IconButton
                        icon="delete"
                        size="sm"
                        onClick={() => onDelete?.(message)}
                        className="bg-white shadow-md hover:shadow-lg text-red-500 hover:text-red-600"
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reactions Picker */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    className="absolute -bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {quickReactions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reactions Display */}
            {reactions.length > 0 && (
              <div
                className={`flex flex-wrap gap-1 mt-1 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {reactions.slice(0, 6).map((reaction, index) => (
                  <motion.div
                    key={`${reaction.emoji}-${index}`}
                    className="bg-white border border-gray-200 rounded-full px-2 py-1 text-xs shadow-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {reaction.emoji} {reaction.count > 1 && reaction.count}
                  </motion.div>
                ))}
                {reactions.length > 6 && (
                  <div className="bg-white border border-gray-200 rounded-full px-2 py-1 text-xs shadow-sm">
                    +{reactions.length - 6}
                  </div>
                )}
              </div>
            )}

            {/* Timestamp and Status */}
            <div
              className={`flex items-center space-x-2 mt-1 text-xs ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {showTimestamp && (
                <span className="text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              )}

              {showStatus && isOwn && getStatusIcon(message.status)}

              {/* Edited indicator */}
              {message.isEdited && (
                <span className="text-gray-400 italic">edited</span>
              )}
            </div>

            {/* Reply indicator */}
            {message.replyTo && (
              <div
                className={`mt-2 p-2 rounded border-l-2 ${
                  isOwn
                    ? "border-l-blue-300 bg-blue-50"
                    : "border-l-gray-300 bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-600">
                  Replying to {message.replyTo.sender}
                </div>
                <div className="text-sm text-gray-800 line-clamp-1">
                  {message.replyTo.content}
                </div>
              </div>
            )}
          </div>

          {/* Avatar for own messages (optional) */}
          {showAvatar && isOwn && message.sender && (
            <Avatar
              src={message.sender.avatar}
              name={message.sender.name}
              size="sm"
              status={message.sender.isOnline ? "online" : "offline"}
            />
          )}
        </div>
      </motion.div>
    );
  }
);

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["text", "image", "file", "link", "system"]),
    content: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["sending", "sent", "delivered", "read", "failed"]),
    sender: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
      isOnline: PropTypes.bool,
    }),
    isNew: PropTypes.bool,
    isEdited: PropTypes.bool,
    showSenderName: PropTypes.bool,
    replyTo: PropTypes.shape({
      sender: PropTypes.string,
      content: PropTypes.string,
    }),
    // File message props
    fileName: PropTypes.string,
    fileSize: PropTypes.string,
    fileType: PropTypes.string,
    // Link message props
    preview: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      image: PropTypes.string,
      url: PropTypes.string,
    }),
    // Image message props
    alt: PropTypes.string,
    caption: PropTypes.string,
  }).isRequired,
  isOwn: PropTypes.bool,
  showAvatar: PropTypes.bool,
  showTimestamp: PropTypes.bool,
  showStatus: PropTypes.bool,
  allowReactions: PropTypes.bool,
  allowReplies: PropTypes.bool,
  allowEdit: PropTypes.bool,
  allowDelete: PropTypes.bool,
  onReply: PropTypes.func,
  onReact: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  isEditing: PropTypes.bool,
  reactions: PropTypes.arrayOf(
    PropTypes.shape({
      emoji: PropTypes.string,
      count: PropTypes.number,
      users: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  replies: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
};

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
