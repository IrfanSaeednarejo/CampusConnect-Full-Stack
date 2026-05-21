import {
  Search,
  X,
  Archive,
  Pin,
  BellOff,
  Bell,
  Trash2,
  MoreVertical,
  UserMinus,
  ArrowLeft
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useHomeTheme from '../../hooks/useHomeTheme';
import { useLanguage } from "../../hooks/useLanguage";

const formatLastSeen = (value, locale) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const ChatHeader = ({
  conversation,
  avatarColor,
  isMuted,
  isArchived,
  isPinned,
  isTyping,
  typingName,
  lastSeen,
  searchQuery = '',
  searchInputRef,
  onSearch,
  onClose,
  onArchive,
  onMute,
  onPin,
  onClearChat,
  onDisconnect
}) => {
  const isDark = useHomeTheme();
  const { t, locale } = useLanguage();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const statusLine = () => {
    if (conversation.type === 'group') {
      return t("chat.members", { count: conversation.members || 0 });
    }
    if (isTyping) {
      return t("chat.typing", { name: typingName || t("common.someone") });
    }
    if (conversation.status === 'online') {
      return t("common.online");
    }
    if (lastSeen) {
      return t("chat.lastSeen", { time: formatLastSeen(lastSeen, locale) });
    }
    return t("common.offline");
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

  return (
    <div className={`z-20 flex items-center justify-between border-b px-4 py-3 shadow-sm ${
      isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className={`rounded-lg p-1.5 md:hidden ${
            isDark ? "text-text-secondary-dark hover:bg-surface-muted-dark" : "text-text-secondary-light hover:bg-surface-muted-light"
          }`}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="relative flex-shrink-0">
          <div
            className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border text-xs font-bold text-white shadow-md ${
              avatarGradients[avatarColor] || avatarGradients.blue
            } ${isDark ? "border-white/10" : "border-white/70"}`}
          >
            {conversation.avatar && conversation.avatar.length > 2 ? (
              <img src={conversation.avatar} alt={conversation.name} className="h-full w-full object-cover" />
            ) : (
              conversation.avatar || conversation.name[0].toUpperCase()
            )}
          </div>
          {conversation.type === 'user' && conversation.status === 'online' && (
            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 bg-emerald-500 ${
              isDark ? "border-[#161b22]" : "border-white"
            }`}></span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className={`truncate text-[15px] font-bold leading-tight ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
              {conversation.name}
            </h3>
            {isPinned && <Pin size={12} className="fill-emerald-500 text-emerald-500" />}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {conversation.type === 'user' && (
              <span className={`h-1.5 w-1.5 rounded-full ${conversation.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
            )}
            <p className={`text-[11px] font-medium uppercase tracking-wide ${
              isTyping
                ? isDark ? 'animate-pulse text-emerald-400' : 'animate-pulse text-emerald-700'
                : isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
            }`}>
              {statusLine()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <div className={`hidden items-center rounded-lg border px-2.5 py-1.5 transition-all focus-within:border-emerald-500/50 lg:flex ${
          showSearch ? 'w-64' : 'w-48'
        } ${isDark ? 'border-border-dark bg-background-dark' : 'border-border-light bg-background-light'}`}>
          <Search size={14} className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t("chat.searchMessages")}
            value={searchQuery}
            onChange={(event) => onSearch?.(event.target.value)}
            className={`ml-2 w-full border-none bg-transparent text-xs outline-none ${
              isDark ? "text-text-primary-dark placeholder:text-text-secondary-dark" : "text-text-primary-light placeholder:text-text-secondary-light"
            }`}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setShowSearch(false)}
          />
        </div>

        <div className="flex items-center">
          <button
            onClick={onPin}
            className={`rounded-lg p-2 transition-colors ${
              isPinned
                ? 'text-emerald-500'
                : isDark ? 'text-text-secondary-dark hover:bg-surface-muted-dark' : 'text-text-secondary-light hover:bg-surface-muted-light'
            }`}
            title={isPinned ? t("chat.unpin") : t("chat.pin")}
          >
            <Pin size={18} className={isPinned ? 'fill-emerald-500' : ''} />
          </button>

          <button
            onClick={onMute}
            className={`rounded-lg p-2 transition-colors ${
              isDark ? 'text-text-secondary-dark hover:bg-surface-muted-dark' : 'text-text-secondary-light hover:bg-surface-muted-light'
            }`}
            title={isMuted ? t("chat.unmute") : t("chat.mute")}
          >
            {isMuted ? <Bell size={18} /> : <BellOff size={18} />}
          </button>

          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`rounded-lg p-2 transition-colors ${
                showMoreMenu
                  ? isDark ? 'bg-surface-muted-dark text-text-primary-dark' : 'bg-surface-muted-light text-text-primary-light'
                  : isDark ? 'text-text-secondary-dark hover:bg-surface-muted-dark' : 'text-text-secondary-light hover:bg-surface-muted-light'
              }`}
              title={t("chat.moreOptions")}
            >
              <MoreVertical size={18} />
            </button>

            {showMoreMenu && (
              <div className={`absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border py-1.5 shadow-2xl backdrop-blur-sm ${
                isDark
                  ? 'border-[#30363d] bg-[#161b22] bg-opacity-95'
                  : 'border-slate-200 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.14)]'
              }`}>
                <button
                  onClick={() => { onClearChat?.(); setShowMoreMenu(false); }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                    isDark ? 'text-text-primary-dark hover:bg-surface-muted-dark' : 'text-text-primary-light hover:bg-surface-muted-light'
                  }`}
                >
                  <Trash2 size={16} className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"} />
                  {t("chat.clearHistory")}
                </button>
                <button
                  onClick={() => { onArchive?.(); setShowMoreMenu(false); }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                    isDark ? 'text-text-primary-dark hover:bg-surface-muted-dark' : 'text-text-primary-light hover:bg-surface-muted-light'
                  }`}
                >
                  <Archive size={16} className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"} />
                  {isArchived ? t("chat.unarchiveChat") : t("chat.archiveChat")}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(t("chat.disconnectConfirm"))) {
                      onDisconnect?.();
                    }
                    setShowMoreMenu(false);
                  }}
                  className={`mt-1 flex w-full items-center gap-2.5 border-t px-4 py-2 pt-3 text-left text-sm text-red-400 transition-colors ${
                    isDark ? 'border-[#30363d] hover:bg-red-500/10' : 'border-slate-200 hover:bg-red-50'
                  }`}
                >
                  <UserMinus size={16} /> {t("chat.disconnect")}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className={`ml-1 rounded-lg p-2 transition-colors ${
              isDark ? 'text-text-secondary-dark hover:bg-red-500/10 hover:text-red-400' : 'text-text-secondary-light hover:bg-red-50 hover:text-red-500'
            }`}
            title={t("chat.close")}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
