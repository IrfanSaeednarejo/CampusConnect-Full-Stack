import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Badge from '../common/Badge';

/**
 * Advanced Chat Input Component with rich features like file uploads, emojis,
 * typing indicators, voice messages, and message scheduling
 */
const ChatInput = React.forwardRef(({
  onSendMessage,
  onTyping,
  onStopTyping,
  placeholder = 'Type a message...',
  disabled = false,
  loading = false,
  showEmojiPicker = true,
  showFileUpload = true,
  showVoiceMessage = true,
  showScheduleMessage = false,
  maxLength = 1000,
  mentionableUsers = [],
  showTypingIndicator = true,
  typingUsers = [],
  replyTo = null,
  onCancelReply,
  className = '',
  ...props
}, ref) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [scheduledTime, setScheduledTime] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const combinedRef = ref || textareaRef;

  // Emoji picker data
  const emojiCategories = {
    recent: ['😀', '😂', '❤️', '👍', '😊', '🔥', '💯', '🎉'],
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
    gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🧘']
  };

  // Handle input change with typing indicators
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      onTyping?.();
    }

    if (isTyping && !value.trim()) {
      setIsTyping(false);
      onStopTyping?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping?.();
    }, 2000);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    const messageData = {
      content: message.trim(),
      attachments,
      replyTo: replyTo?.id,
      scheduledTime
    };

    try {
      await onSendMessage(messageData);

      // Clear input
      setMessage('');
      setAttachments([]);
      setScheduledTime(null);
      onCancelReply?.();

      // Stop typing indicator
      setIsTyping(false);
      onStopTyping?.();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle file upload
  const handleFileUpload = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    setShowAttachmentMenu(false);
  };

  // Remove attachment
  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);

    setMessage(newMessage);
    setShowEmojiPicker(false);

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Handle voice recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    // Implement actual recording logic here
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);

    // Implement stop recording and send audio logic here
    console.log('Voice message recorded:', recordingDuration, 'seconds');
  };

  // Format recording duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mention handling
  const handleMention = (user) => {
    const mention = `@${user.name} `;
    setMessage(prev => prev + mention);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`border-t border-gray-200 bg-white ${className}`} {...props}>
      {/* Reply indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            className="px-4 py-2 bg-blue-50 border-l-4 border-blue-400 flex items-center justify-between"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">
                <span className="material-symbols-outlined text-sm">reply</span>
              </span>
              <div>
                <div className="text-sm font-medium text-blue-900">
                  Replying to {replyTo.sender}
                </div>
                <div className="text-sm text-blue-700 line-clamp-1">
                  {replyTo.content}
                </div>
              </div>
            </div>
            <IconButton
              icon="close"
              size="sm"
              onClick={onCancelReply}
              className="text-blue-600 hover:text-blue-800"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            className="px-4 py-2 border-b border-gray-200 flex flex-wrap gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                className="relative bg-gray-100 rounded-lg p-2 flex items-center space-x-2 max-w-xs"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-gray-600">attach_file</span>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(attachment.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>

                <IconButton
                  icon="close"
                  size="xs"
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-gray-400 hover:text-gray-600"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing indicators */}
      <AnimatePresence>
        {showTypingIndicator && typingUsers.length > 0 && (
          <motion.div
            className="px-4 py-1 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="p-4">
        <div className="flex items-end space-x-2">
          {/* Attachment menu */}
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div
                className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
              >
                <IconButton
                  icon="image"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-600 hover:text-gray-900"
                />
                <IconButton
                  icon="attach_file"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-600 hover:text-gray-900"
                />
                {showVoiceMessage && (
                  <IconButton
                    icon={isRecording ? "stop" : "mic"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? "text-red-500" : "text-gray-600 hover:text-gray-900"}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input controls */}
          <div className="flex space-x-2">
            {/* Attachment button */}
            {showFileUpload && (
              <IconButton
                icon="attach_file"
                size="sm"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="text-gray-400 hover:text-gray-600"
                disabled={disabled}
              />
            )}

            {/* Emoji button */}
            {showEmojiPicker && (
              <IconButton
                icon="emoji_emotions"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-gray-600"
                disabled={disabled}
              />
            )}
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={combinedRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? `Recording... ${formatDuration(recordingDuration)}` : placeholder}
              disabled={disabled || isRecording}
              maxLength={maxLength}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              minRows={1}
              maxRows={4}
            />

            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={disabled || loading || (!message.trim() && attachments.length === 0)}
            loading={loading}
            size="sm"
            className="px-4"
          >
            <span className="material-symbols-outlined">
              {scheduledTime ? 'schedule' : 'send'}
            </span>
          </Button>
        </div>

        {/* Voice recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              className="mt-2 flex items-center space-x-2 text-red-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.div
                className="w-3 h-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <span className="text-sm">Recording: {formatDuration(recordingDuration)}</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={stopRecording}
                className="text-red-500 hover:text-red-700"
              >
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*,video/*,application/*,text/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-64 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
          >
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Emojis</h3>
            </div>
            <div className="p-3 overflow-y-auto max-h-48">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {category}
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
  onStopTyping: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  showEmojiPicker: PropTypes.bool,
  showFileUpload: PropTypes.bool,
  showVoiceMessage: PropTypes.bool,
  showScheduleMessage: PropTypes.bool,
  maxLength: PropTypes.number,
  mentionableUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string
    })
  ),
  showTypingIndicator: PropTypes.bool,
  typingUsers: PropTypes.arrayOf(PropTypes.string),
  replyTo: PropTypes.shape({
    id: PropTypes.string,
    sender: PropTypes.string,
    content: PropTypes.string
  }),
  onCancelReply: PropTypes.func,
  className: PropTypes.string
};

ChatInput.displayName = 'ChatInput';

export default ChatInput;