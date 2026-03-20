// ============================================
// FILE: components/ChatInput.jsx
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';

const ChatInput = ({
  value = '',
  onChange,
  onSend,
  replyMessage,
  onCancelReply,
  isEditing,
  onCancelEdit
}) => {
  // State to control emoji picker visibility
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Ref for emoji picker to detect outside clicks
  const emojiPickerRef = useRef(null);
  // Ref for file input
  const fileInputRef = useRef(null);
  // State for attachments
  const [attachments, setAttachments] = useState([]);

  // Emoji data organized by categories
  const emojiCategories = {
    "Smileys & Emotion": ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
    "Hand Gestures": ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    "Hearts & Symbols": ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️'],
    "Objects & Items": ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡'],
    "Nature & Animals": ['🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡'],
    "Food & Drink": ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕'],
    "Activities & Sports": ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏅', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰']
  };

  // Combine all emojis into single array
  const allEmojis = Object.values(emojiCategories).flat();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Send message function
  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value);
  };

  // Handle Enter key press to send message
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Add selected emoji to message
  const handleEmojiSelect = (emoji) => {
    onChange?.(`${value}${emoji}`);
  };

  // Toggle emoji picker visibility
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Add files to attachments (limit to 5 files)
      const newAttachments = files.slice(0, 5 - attachments.length).map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  return (
    <div className="chat-input">
      {(replyMessage || isEditing) && (
        <div className="input-preview">
          <div className="preview-content">
            <span className="preview-label">
              {isEditing ? 'Editing message' : 'Replying to'}
            </span>
            {!isEditing && replyMessage && (
              <span className="preview-text">
                {replyMessage.senderName || 'Unknown'}: {replyMessage.text}
              </span>
            )}
          </div>
          <button
            className="preview-close"
            onClick={isEditing ? onCancelEdit : onCancelReply}
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          backgroundColor: '#0d1117',
        }}>
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                color: '#c9d1d9',
              }}
            >
              <span>{attachment.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8b949e',
                  cursor: 'pointer',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="input-container">
        {/* Emoji button with picker */}
        <div className="emoji-container" ref={emojiPickerRef}>
          <button onClick={toggleEmojiPicker}>
            <Smile size={22} />
          </button>
          
          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              <div className="emoji-picker-header">
                <span>Emojis</span>
              </div>
              <div className="emoji-categories">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category} className="emoji-category">
                    <div className="category-title">{category}</div>
                    <div className="emoji-grid">
                      {emojis.map((emoji, index) => (
                        <button
                          key={`${category}-${index}`}
                          className="emoji-button"
                          onClick={() => handleEmojiSelect(emoji)}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attachment button */}
        <button 
          type="button"
          onClick={handleAttachmentClick}
          title="Attach file"
        >
          <Paperclip size={22} />
        </button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {/* Message input field */}
        <input
          type="text"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isEditing ? 'Edit your message...' : 'Type a message...'}
        />
        
        {/* Send button */}
        <button className="send-button" onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;