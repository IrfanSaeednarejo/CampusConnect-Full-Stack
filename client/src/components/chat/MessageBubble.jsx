

import {
  Check,
  Clock,
  AlertCircle,
  Reply,
  Pencil,
  Forward,
  Trash2,
  Trash,
  Smile,
  RotateCcw
} from 'lucide-react';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const StatusIcon = ({ status }) => {
  const iconSize = 14;
  if (status === 'sending') return <Clock size={iconSize} className="text-[#8b949e]" />;
  if (status === 'sent') return <Check size={iconSize} className="text-[#8b949e]" />;
  if (status === 'failed') return <AlertCircle size={iconSize} className="text-red-500" />;
  if (status === 'delivered' || status === 'read') {
    return (
      <div className={`relative w-4 h-4 ${status === 'read' ? 'text-blue-500' : 'text-[#8b949e]'}`}>
        <Check size={iconSize} className="absolute top-0 left-0" />
        <Check size={iconSize} className="absolute top-0 left-1.5" />
      </div>
    );
  }
  return null;
};

const MessageBubble = ({
  message,
  isCurrentUser,
  userColor,
  quickReactions = [],
  replyMessage,
  onReply,
  onEdit,
  onForward,
  onDelete,
  onReact,
  onRetry,
  isSearchMatch
}) => {
  const senderProfile = message.sender?.profile || {};
  const senderAvatar = senderProfile.avatar;
  const senderDisplayName = senderProfile.displayName || message.senderName || 'Unknown';

  const initials = senderDisplayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const reactionEntries = Object.entries(message.reactions || {});
  const isDeleted = message.isDeleted || message.deleted;

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
    <div className={`flex flex-col mb-4 group ${isCurrentUser ? 'items-end' : 'items-start'} ${isSearchMatch ? 'ring-2 ring-emerald-500/30 rounded-2xl p-1' : ''}`}>
      <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && (
          <div className={`w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br ${avatarGradients[userColor] || avatarGradients.blue} flex items-center justify-center text-white text-[10px] font-bold border border-white/10 shadow-sm mb-1`}>
            {senderAvatar ? <img src={senderAvatar} alt={senderDisplayName} className="w-full h-full object-cover rounded-full" /> : initials}
          </div>
        )}

        <div className={`relative group/bubble flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {!isDeleted && (
            <div className={`absolute -top-9 flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-lg p-1 shadow-xl opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 z-10 ${isCurrentUser ? 'right-0' : 'left-0'}`}>
              <button onClick={onReply} className="p-1.5 hover:bg-[#1f2937] rounded-md text-[#8b949e] hover:text-white transition-colors" title="Reply"><Reply size={14} /></button>
              {isCurrentUser && (
                <>
                  <button onClick={onEdit} className="p-1.5 hover:bg-[#1f2937] rounded-md text-[#8b949e] hover:text-white transition-colors" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => onDelete?.(true)} className="p-1.5 hover:bg-red-500/10 rounded-md text-[#8b949e] hover:text-red-400 transition-colors" title="Delete for all"><Trash2 size={14} /></button>
                </>
              )}
              {!isCurrentUser && (
                 <button onClick={() => onDelete?.(false)} className="p-1.5 hover:bg-red-500/10 rounded-md text-[#8b949e] hover:text-red-400 transition-colors" title="Delete for me"><Trash size={14} /></button>
              )}
              <button onClick={() => onReact?.('👍')} className="p-1.5 hover:bg-emerald-500/10 rounded-md text-[#8b949e] hover:text-emerald-500 transition-colors" title="React"><Smile size={14} /></button>
            </div>
          )}

          <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
            isDeleted 
              ? 'bg-[#0d1117] border border-[#30363d] border-dashed text-[#484f58] italic' 
              : isCurrentUser 
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-none' 
                : 'bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded-bl-none'
          }`}>
            {message.forwarded && (
              <span className="flex items-center gap-1 text-[10px] text-[#8b949e] mb-1 font-medium italic opacity-80 uppercase tracking-tight">
                <Forward size={10} /> Forwarded
              </span>
            )}
            
            {message.replyPreview && (
              <div className="mb-2 bg-black/20 border-l-2 border-emerald-400/50 rounded-r-lg p-2 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-emerald-400 truncate">{message.replyPreview.senderDisplayName}</span>
                <span className="text-xs text-white/60 truncate leading-tight italic">{message.replyPreview.content}</span>
              </div>
            )}

            <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
              {isDeleted ? "This message was deleted" : (message.content || message.text || '')}
            </p>

            <div className={`flex items-center gap-1.5 mt-1.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] font-medium ${isCurrentUser ? 'text-white/60' : 'text-[#8b949e]'}`}>
                {formatTime(message.createdAt || message.timestamp)}
              </span>
              {message.isEdited && !isDeleted && <span className="text-[10px] italic opacity-60">Edited</span>}
              {isCurrentUser && !isDeleted && <StatusIcon status={message.status || 'sent'} />}
            </div>
          </div>

          {reactionEntries.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {reactionEntries.map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(emoji)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-xs transition-all ${
                    users.includes('current') 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-emerald-900/20 shadow-lg' 
                      : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/30'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="font-bold">{users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
