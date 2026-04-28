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

const formatLastSeen = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
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
      return `${conversation.members || 0} members`;
    }
    if (isTyping) {
      return `${typingName || 'Someone'} typing...`;
    }
    if (conversation.status === 'online') {
      return 'online';
    }
    if (lastSeen) {
      return `last seen ${formatLastSeen(lastSeen)}`;
    }
    return 'offline';
  };

  const avatarGradients = {
    blue: 'from-blue-500 to-blue-700',
    teal: 'from-teal-500 to-teal-700',
    pink: 'from-pink-500 to-pink-700',
    indigo: 'from-indigo-500 to-indigo-700',
    cyan: 'from-cyan-500 to-cyan-700',
    emerald: 'from-emerald-500 to-emerald-700',
    rose: 'from-rose-500 to-rose-700',
    violet: 'from-violet-500 to-violet-700',
    amber: 'from-amber-500 to-amber-700',
    lime: 'from-lime-500 to-lime-700',
    fuchsia: 'from-fuchsia-500 to-fuchsia-700',
    sky: 'from-sky-500 to-sky-700',
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
    group: 'from-violet-600 to-indigo-600',
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d] shadow-sm z-20">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="md:hidden p-1.5 hover:bg-[#1f2937] rounded-lg text-[#8b949e]">
          <ArrowLeft size={20} />
        </button>
        
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradients[avatarColor] || avatarGradients.blue} flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-md border border-white/10`}>
            {conversation.avatar && conversation.avatar.length > 2 ? (
              <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
            ) : (
              conversation.avatar || conversation.name[0].toUpperCase()
            )}
          </div>
          {conversation.type === 'user' && conversation.status === 'online' && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#161b22] rounded-full"></span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-bold text-white truncate leading-tight">{conversation.name}</h3>
            {isPinned && <Pin size={12} className="text-emerald-500 fill-emerald-500" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {conversation.type === 'user' && (
               <span className={`w-1.5 h-1.5 rounded-full ${conversation.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
            )}
            <p className={`text-[11px] font-medium tracking-wide uppercase ${isTyping ? 'text-emerald-400 animate-pulse' : 'text-[#8b949e]'}`}>
              {statusLine()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <div className={`hidden lg:flex items-center bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 transition-all focus-within:border-emerald-500/50 ${showSearch ? 'w-64' : 'w-48'}`}>
          <Search size={14} className="text-[#8b949e]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(event) => onSearch?.(event.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-[#484f58] outline-none ml-2 w-full"
            onFocus={() => setShowSearch(true)}
            onBlur={() => setShowSearch(false)}
          />
        </div>

        <div className="flex items-center">
          <button onClick={onPin} className={`p-2 rounded-lg transition-colors ${isPinned ? 'text-emerald-500' : 'text-[#8b949e] hover:bg-[#1f2937]'}`} title={isPinned ? 'Unpin' : 'Pin'}>
            <Pin size={18} className={isPinned ? 'fill-emerald-500' : ''} />
          </button>
          
          <button onClick={onMute} className="p-2 rounded-lg text-[#8b949e] hover:bg-[#1f2937] transition-colors" title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <Bell size={18} /> : <BellOff size={18} />}
          </button>

          <div className="relative" ref={moreMenuRef}>
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-2 rounded-lg transition-colors ${showMoreMenu ? 'bg-[#1f2937] text-white' : 'text-[#8b949e] hover:bg-[#1f2937]'}`}
              title="More options" 
            >
              <MoreVertical size={18} />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 backdrop-blur-sm bg-opacity-95">
                <button
                  onClick={() => { onClearChat?.(); setShowMoreMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-[#c9d1d9] text-left hover:bg-[#1f2937] flex items-center gap-2.5 transition-colors"
                >
                  <Trash2 size={16} className="text-[#8b949e]" />
                  Clear History
                </button>
                <button
                  onClick={() => { onArchive?.(); setShowMoreMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-[#c9d1d9] text-left hover:bg-[#1f2937] flex items-center gap-2.5 transition-colors"
                >
                  <Archive size={16} className="text-[#8b949e]" />
                  {isArchived ? 'Unarchive' : 'Archive'} Chat
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Disconnect? You will need to send a new request to message again.")) {
                        onDisconnect?.();
                    }
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-red-400 text-left hover:bg-red-500/10 flex items-center gap-2.5 transition-colors border-t border-[#30363d] mt-1 pt-3"
                >
                  <UserMinus size={16} /> Disconnect
                </button>
              </div>
            )}
          </div>
          
          <button onClick={onClose} className="p-2 rounded-lg text-[#8b949e] hover:bg-red-500/10 hover:text-red-400 transition-colors ml-1" title="Close">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;