
import React, { useState, useMemo } from 'react';
import { Search, Archive, Pin, BellOff } from 'lucide-react';
import useHomeTheme from '@/hooks/useHomeTheme';
import { useLanguage } from "../../hooks/useLanguage";

const ChatSidebar = ({
  conversations,
  selectedId,
  onSelectConversation,
  archivedCount = 0,
  showArchived = false,
  onToggleArchived
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = useHomeTheme();
  const { t, locale, language } = useLanguage();

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(conversation => 
      conversation.name.toLowerCase().includes(query) || 
      (conversation.lastMessage || '').toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const formatSidebarTime = (date) => {
    if (!date) return '';
    const timestamp = new Date(date);
    if (isNaN(timestamp.getTime())) return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return timestamp.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (messageDate.getTime() === yesterday.getTime()) return t("common.yesterday");
    return timestamp.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const avatarGradients = {
    blue: 'bg-info',
    teal: 'bg-info',
    pink: 'bg-danger',
    cyan: 'bg-info',
    emerald: 'bg-primary',
    rose: 'bg-danger',
    amber: 'bg-warning',
    lime: 'bg-primary',
    fuchsia: 'bg-danger',
    sky: 'bg-info',
    red: 'bg-danger',
    green: 'bg-primary',
    group: 'bg-info',
  };

  const getAvatarGradient = (color) => avatarGradients[color] || avatarGradients.blue;
  const conversationsFoundLabel =
    language === "ur"
      ? t("chat.conversationsFound", { count: filteredConversations.length, suffix: "" })
      : t("chat.conversationsFound", {
          count: filteredConversations.length,
          suffix: filteredConversations.length !== 1 ? "s" : "",
        });

  return (
    <div className={`flex flex-col h-full w-full md:w-[350px] transition-all duration-300 z-10 border-r ${
      isDark 
        ? "border-border-dark bg-background-dark" 
        : "border-border-light bg-surface-light"
    }`}>
      <div className={`p-4 border-b space-y-4 transition-colors duration-300 ${
        isDark
          ? "border-border-dark"
          : "border-border-light"
      }`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
            isDark ? "text-white" : "text-[#0F172A]"
          }`}>{t("chat.messages")}</h2>
          <button
            onClick={onToggleArchived}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              showArchived 
                ? isDark
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-success/20 bg-success/5 text-success'
                : isDark
                  ? 'border-border-dark bg-surface-dark text-text-secondary-dark hover:border-info/30'
                  : 'border-border-light bg-background-light text-text-secondary-light hover:border-border-light hover:text-text-primary-light'
            }`}
          >
            <Archive size={14} />
            <span>{t("chat.archived")}</span>
            <span className={`min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-center text-[10px] ${
              isDark ? "bg-surface-muted-dark text-text-primary-dark" : "bg-surface-muted-light text-text-primary-light"
            }`}>
              {archivedCount}
            </span>
          </button>
        </div>
        
        <div className="relative group">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500 ${
              isDark ? "text-[#8b949e]" : "text-slate-400"
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder={t("chat.searchChats")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 ${
              isDark
                ? "border-border-dark bg-surface-dark text-text-primary-dark placeholder:text-text-secondary-dark"
                : "border-border-light bg-background-light text-text-primary-light placeholder:text-text-secondary-light"
            }`}
          />
        </div>
      </div>

      {searchQuery && (
        <div className={`border-b px-4 py-2 text-[11px] font-medium uppercase tracking-wider ${
          isDark
            ? "border-border-dark bg-surface-dark/70 text-text-secondary-dark"
            : "border-border-light bg-background-light text-text-secondary-light"
        }`}>
          {conversationsFoundLabel}
        </div>
      )}

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-[3px] ${
                selectedId === conversation.id 
                  ? isDark
                    ? 'border-primary bg-primary/5'
                    : 'border-primary bg-primary/5'
                  : isDark
                    ? 'border-transparent hover:bg-surface-dark'
                    : 'border-transparent hover:bg-background-light'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border text-sm font-bold text-white shadow-lg ${
                  getAvatarGradient(conversation.avatarColor)
                } ${isDark ? "border-white/10" : "border-white/70"}`}>
                  {conversation.avatar && conversation.avatar.length > 2 ? (
                    <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
                  ) : (
                    conversation.avatar || conversation.name[0].toUpperCase()
                  )}
                </div>
                {conversation.type === 'user' && conversation.status === 'online' && (
                  <span className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-500 ${
                    isDark ? "border-[#0d1117]" : "border-white"
                  }`}></span>
                )}
              </div>
              
              <div className="flex-1 min-width-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`truncate text-sm font-semibold ${
                    selectedId === conversation.id
                      ? isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                      : isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                  }`}>
                    {conversation.name}
                  </h3>
                  <span className={`text-[10px] font-medium ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    {formatSidebarTime(conversation.timestamp)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`flex-1 truncate text-[13px] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    {conversation.lastMessage || t("chat.noMessagesYet")}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {conversation.isPinned && (
                      <Pin
                        size={12}
                        className={isDark ? "fill-text-secondary-dark/20 text-text-secondary-dark" : "fill-text-secondary-light/20 text-text-secondary-light"}
                      />
                    )}
                    {conversation.isMuted && <BellOff size={12} className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"} />}
                    {conversation.unread > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`p-8 text-center ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            <Search className="mx-auto mb-3 opacity-20" size={32} />
            <p className="text-sm font-medium">{t("chat.noConversations")}</p>
            {searchQuery && <span className="text-xs opacity-60">{t("chat.tryDifferentSearch")}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
