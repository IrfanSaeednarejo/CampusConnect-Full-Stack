import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, FileText, Image as ImageIcon, Plus } from 'lucide-react';

const ChatInput = ({
  value = '',
  onChange,
  onSend,
  replyMessage,
  onCancelReply,
  isEditing,
  onCancelEdit,
  senderName = "You"
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  const emojiCategories = {
    "Smileys": ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'],
    "Gestures": ['👋', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '🙏'],
    "Hearts": ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
    "Nature": ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    onChange?.(`${value}${emoji}`);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newAttachments = files.slice(0, 5 - attachments.length).map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        isImage: file.type.startsWith('image/')
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  return (
    <div className="bg-[#161b22] border-t border-[#30363d] p-3 md:p-4 transition-all duration-300">
      {(replyMessage || isEditing) && (
        <div className="mb-3 bg-[#0d1117] border-l-4 border-emerald-500 rounded-r-xl p-3 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">
              {isEditing ? 'Editing Message' : `Replying to ${replyMessage?.senderName || 'User'}`}
            </span>
            <p className="text-sm text-[#8b949e] truncate leading-snug">
              {isEditing ? value : (replyMessage?.content || replyMessage?.text || '...')}
            </p>
          </div>
          <button
            onClick={isEditing ? onCancelEdit : onCancelReply}
            className="p-1.5 hover:bg-[#1f2937] rounded-full text-[#8b949e] transition-colors ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map(attachment => (
            <div key={attachment.id} className="group relative flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg pl-2 pr-1 py-1 transition-all hover:border-[#8b949e]/50 shadow-sm">
              {attachment.isImage ? <ImageIcon size={14} className="text-emerald-500" /> : <FileText size={14} className="text-blue-500" />}
              <span className="text-xs text-[#c9d1d9] max-w-[120px] truncate">{attachment.name}</span>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded text-[#8b949e] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2 md:gap-3">
        <div className="flex items-center gap-1 pb-1">
          <div className="relative" ref={emojiPickerRef}>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-emerald-500/10 text-emerald-500' : 'text-[#8b949e] hover:bg-[#1f2937] hover:text-white'}`}
            >
              <Smile size={24} />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-4 w-72 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-[#30363d] bg-[#0d1117]">
                  <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-widest">Select Emoji</h4>
                </div>
                <div className="max-h-64 overflow-y-auto p-3 grid grid-cols-8 gap-1 custom-scrollbar">
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <React.Fragment key={category}>
                      {emojis.map((emoji, idx) => (
                        <button
                          key={`${category}-${idx}`}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#1f2937] rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#8b949e] hover:bg-[#1f2937] hover:text-white rounded-xl transition-all"
            title="Attach file"
          >
            <Paperclip size={24} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEditing ? 'Edit your message...' : 'Type a message...'}
            rows={1}
            className="w-full bg-[#0d1117] text-white border border-[#30363d] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 rounded-2xl py-3 px-4 outline-none text-[15px] transition-all placeholder:text-[#484f58] resize-none max-h-32 overflow-y-auto"
            style={{ minHeight: '46px' }}
          />
        </div>
        
        <button 
          onClick={handleSend} 
          disabled={!value.trim()}
          className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${
            value.trim() 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 hover:-translate-y-0.5' 
              : 'bg-[#1f2937] text-[#484f58] cursor-not-allowed'
          }`}
        >
          <Send size={20} className={value.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;