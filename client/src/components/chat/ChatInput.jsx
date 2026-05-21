import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, FileText, Image as ImageIcon } from 'lucide-react';
import useHomeTheme from '../../hooks/useHomeTheme';
import { useLanguage } from "../../hooks/useLanguage";

const ChatInput = ({
  value = '',
  onChange,
  onSend,
  replyMessage,
  onCancelReply,
  isEditing,
  onCancelEdit,
  senderName = "You",
  isDark: controlledIsDark,
}) => {
  const themeIsDark = useHomeTheme();
  const isDark = controlledIsDark ?? themeIsDark;
  const { t } = useLanguage();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  const emojiCategories = {
    Smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰"],
    Gestures: ["👋", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "🙏"],
    Hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖"],
    Nature: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"],
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
      const newAttachments = files.slice(0, 5 - attachments.length).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        isImage: file.type.startsWith('image/'),
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  return (
    <div className={`border-t p-3 transition-all duration-300 md:p-4 ${
      isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white"
    }`}>
      {(replyMessage || isEditing) && (
        <div className={`mb-3 flex items-center justify-between rounded-r-xl border-l-4 p-3 animate-in slide-in-from-bottom-2 duration-200 ${
          isDark ? "border-emerald-500 bg-[#0d1117]" : "border-emerald-500 bg-emerald-50"
        }`}>
          <div className="min-w-0 flex-1">
            <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-emerald-500">
              {isEditing ? t("chat.editingMessage") : t("chat.replyingTo", { name: replyMessage?.senderName || senderName || t("common.someone") })}
            </span>
            <p className={`truncate text-sm leading-snug ${isDark ? "text-[#8b949e]" : "text-slate-600"}`}>
              {isEditing ? value : (replyMessage?.content || replyMessage?.text || '...')}
            </p>
          </div>
          <button
            onClick={isEditing ? onCancelEdit : onCancelReply}
            className={`ml-2 rounded-full p-1.5 transition-colors ${
              isDark ? "text-[#8b949e] hover:bg-[#1f2937]" : "text-slate-400 hover:bg-slate-200"
            }`}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={`group relative flex items-center gap-2 rounded-lg border py-1 pl-2 pr-1 shadow-sm transition-all ${
                isDark
                  ? "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]/50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              {attachment.isImage ? <ImageIcon size={14} className="text-emerald-500" /> : <FileText size={14} className="text-blue-500" />}
              <span className={`max-w-[120px] truncate text-xs ${isDark ? "text-[#c9d1d9]" : "text-slate-700"}`}>
                {attachment.name}
              </span>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className={`rounded p-1 transition-colors ${
                  isDark ? "text-[#8b949e] hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                }`}
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
              className={`rounded-xl p-2 transition-all ${
                showEmojiPicker
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : isDark
                    ? 'text-[#8b949e] hover:bg-[#1f2937] hover:text-white'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Smile size={24} />
            </button>

            {showEmojiPicker && (
              <div className={`absolute bottom-full left-0 z-50 mb-4 w-72 overflow-hidden rounded-2xl border shadow-2xl ${
                isDark
                  ? "border-[#30363d] bg-[#161b22]"
                  : "border-slate-200 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.14)]"
              }`}>
                <div className={`border-b p-3 ${
                  isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
                }`}>
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                    {t("chat.selectEmoji")}
                  </h4>
                </div>
                <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto p-3 custom-scrollbar">
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <React.Fragment key={category}>
                      {emojis.map((emoji, idx) => (
                        <button
                          key={`${category}-${idx}`}
                          onClick={() => handleEmojiSelect(emoji)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors ${
                            isDark ? "hover:bg-[#1f2937]" : "hover:bg-slate-100"
                          }`}
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
            className={`rounded-xl p-2 transition-all ${
              isDark ? "text-[#8b949e] hover:bg-[#1f2937] hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title={t("chat.attachFile")}
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

        <div className="relative flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEditing ? t("chat.editPlaceholder") : t("chat.typePlaceholder")}
            rows={1}
            className={`max-h-32 w-full resize-none overflow-y-auto rounded-2xl border px-4 py-3 text-[15px] outline-none transition-all ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-white placeholder:text-[#484f58] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            }`}
            style={{ minHeight: '46px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
            value.trim()
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 hover:bg-emerald-500'
              : isDark
                ? 'cursor-not-allowed bg-[#1f2937] text-[#484f58]'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
          }`}
        >
          <Send size={20} className={value.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
