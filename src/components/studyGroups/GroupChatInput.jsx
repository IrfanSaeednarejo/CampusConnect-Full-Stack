import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Avatar from '../common/Avatar';

/**
 * Advanced Group Chat Input Component - Input for study group chat
 * Includes file attachments, mentions, and formatting options
 */
const GroupChatInput = React.forwardRef(({
  group,
  currentUser,
  onSendMessage,
  onSendFile,
  onTyping,
  placeholder = 'Type a message...',
  maxLength = 2000,
  allowFiles = true,
  allowMentions = true,
  className = '',
  ...props
}, ref) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [attachments, setAttachments] = useState([]);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get mentionable members
  const mentionableMembers = group?.members?.filter(
    member => member.id !== currentUser?.id &&
    member.name?.toLowerCase().includes(mentionQuery.toLowerCase())
  ) || [];

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Check for mention trigger
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch && allowMentions) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
    }

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1000);
  };

  // Handle mention selection
  const handleMentionSelect = (member) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const beforeMention = textBeforeCursor.substring(0, mentionMatch.index);
      const newMessage = `${beforeMention}@${member.name} ${textAfterCursor}`;
      setMessage(newMessage);
      setShowMentions(false);
      setMentionQuery('');

      // Focus back on textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const newCursorPosition = beforeMention.length + member.name.length + 2;
        textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (showMentions && mentionableMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev =>
          prev < mentionableMembers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleMentionSelect(mentionableMembers[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setAttachments([...attachments, ...newAttachments]);
    onSendFile?.(files);
  };

  // Handle file remove
  const handleFileRemove = (attachmentId) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  // Handle send
  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;

    onSendMessage?.({
      message: message.trim(),
      attachments: attachments.map(att => ({
        name: att.name,
        size: att.size,
        type: att.type
      }))
    });

    setMessage('');
    setAttachments([]);
    setShowMentions(false);
    setIsTyping(false);
    onTyping?.(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className={`bg-white border-t border-gray-200 p-4 ${className}`} {...props}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
            >
              <span className="material-symbols-outlined text-gray-600 text-sm">
                {attachment.type.startsWith('image/') ? 'image' : 'attach_file'}
              </span>
              <span className="text-sm text-gray-700 truncate max-w-[150px]">
                {attachment.name}
              </span>
              <button
                onClick={() => handleFileRemove(attachment.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        {/* User Avatar */}
        {currentUser && (
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            size="sm"
          />
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              height: 'auto'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />

          {/* Character Count */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {message.length} / {maxLength}
            </div>
          )}

          {/* Mentions Dropdown */}
          {showMentions && mentionableMembers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {mentionableMembers.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => handleMentionSelect(member)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 ${
                    index === selectedMentionIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <Avatar
                    src={member.avatar}
                    name={member.name}
                    size="sm"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    {member.title && (
                      <div className="text-xs text-gray-500">{member.title}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {allowFiles && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <IconButton
                icon="attach_file"
                size="md"
                className="text-gray-600"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              />
            </>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </Button>
        </div>
      </div>
    </div>
  );
});

GroupChatInput.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
        title: PropTypes.string
      })
    )
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string
  }),
  onSendMessage: PropTypes.func.isRequired,
  onSendFile: PropTypes.func,
  onTyping: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  allowFiles: PropTypes.bool,
  allowMentions: PropTypes.bool,
  className: PropTypes.string
};

GroupChatInput.displayName = 'GroupChatInput';

export default GroupChatInput;