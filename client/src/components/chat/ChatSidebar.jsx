
import React, { useState, useMemo } from 'react';
import { Search, Archive, Pin, BellOff } from 'lucide-react';

const ChatSidebar = ({
  conversations,
  selectedId,
  onSelectConversation,
  archivedCount = 0,
  showArchived = false,
  onToggleArchived
}) => {
  const [searchQuery, setSearchQuery] = useState('');

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
      return timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const getAvatarGradient = (color) => avatarGradients[color] || avatarGradients.blue;

  return (
    <div className={`flex flex-col h-full bg-[#0d1117] border-r border-[#30363d] w-full md:w-[350px] transition-all duration-300 z-10`}>
      <div className="p-4 border-b border-[#30363d] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
          <button
            onClick={onToggleArchived}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              showArchived 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]/30'
            }`}
          >
            <Archive size={14} />
            <span>Archived</span>
            <span className="bg-[#30363d] text-white px-1.5 py-0.5 rounded-md text-[10px] min-w-[1.25rem] text-center">
              {archivedCount}
            </span>
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161b22] text-white border border-[#30363d] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl py-2 pl-10 pr-4 outline-none text-sm transition-all placeholder:text-[#484f58]"
          />
        </div>
      </div>

      {searchQuery && (
        <div className="px-4 py-2 bg-[#161b22]/50 border-b border-[#30363d] text-[#8b949e] text-[11px] font-medium uppercase tracking-wider">
          {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-[3px] ${
                selectedId === conversation.id 
                  ? 'bg-emerald-500/5 border-emerald-500' 
                  : 'border-transparent hover:bg-[#161b22]'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(conversation.avatarColor)} flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-lg border border-white/10`}>
                  {conversation.avatar && conversation.avatar.length > 2 ? (
                    <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
                  ) : (
                    conversation.avatar || conversation.name[0].toUpperCase()
                  )}
                </div>
                {conversation.type === 'user' && conversation.status === 'online' && (
                  <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0d1117] rounded-full"></span>
                )}
              </div>
              
              <div className="flex-1 min-width-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-sm font-semibold truncate ${selectedId === conversation.id ? 'text-white' : 'text-[#c9d1d9]'}`}>
                    {conversation.name}
                  </h3>
                  <span className="text-[10px] text-[#8b949e] font-medium">
                    {formatSidebarTime(conversation.timestamp)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-[13px] text-[#8b949e] truncate flex-1">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {conversation.isPinned && <Pin size={12} className="text-[#8b949e] fill-[#8b949e]/20" />}
                    {conversation.isMuted && <BellOff size={12} className="text-[#8b949e]" />}
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
          <div className="p-8 text-center text-[#8b949e]">
            <Search className="mx-auto mb-3 opacity-20" size={32} />
            <p className="text-sm font-medium">No conversations found</p>
            {searchQuery && <span className="text-xs opacity-60">Try a different search term</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;