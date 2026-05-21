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
} from 'lucide-react';
import useHomeTheme from '../../hooks/useHomeTheme';
import { useLanguage } from "../../hooks/useLanguage";

const formatTime = (timestamp, locale) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const StatusIcon = ({ status, isDark }) => {
  const iconSize = 14;
  if (status === 'sending') return <Clock size={iconSize} className={isDark ? "text-[#8b949e]" : "text-slate-400"} />;
  if (status === 'sent') return <Check size={iconSize} className={isDark ? "text-[#8b949e]" : "text-slate-400"} />;
  if (status === 'failed') return <AlertCircle size={iconSize} className="text-red-500" />;
  if (status === 'delivered' || status === 'read') {
    return (
      <div className={`relative h-4 w-4 ${status === 'read' ? 'text-blue-500' : isDark ? 'text-[#8b949e]' : 'text-slate-400'}`}>
        <Check size={iconSize} className="absolute left-0 top-0" />
        <Check size={iconSize} className="absolute left-1.5 top-0" />
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
  isSearchMatch,
  isDark: controlledIsDark
}) => {
  const themeIsDark = useHomeTheme();
  const isDark = controlledIsDark ?? themeIsDark;
  const { t, locale } = useLanguage();
  const senderProfile = message.sender?.profile || {};
  const senderAvatar = senderProfile.avatar;
  const senderDisplayName = senderProfile.displayName || message.senderName || t("common.someone");

  const initials = senderDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const reactionEntries = Object.entries(message.reactions || {});
  const isDeleted = message.isDeleted || message.deleted;

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
    <div className={`group mb-4 flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} ${
      isSearchMatch ? `rounded-2xl p-1 ring-2 ${isDark ? 'ring-emerald-500/30' : 'ring-emerald-400/40'}` : ''
    }`}>
      <div className={`flex max-w-[85%] items-end gap-2 md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && (
          <div className={`mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-bold text-white shadow-sm ${
            avatarGradients[userColor] || avatarGradients.blue
          } ${isDark ? 'border-white/10' : 'border-white/70'}`}>
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderDisplayName} className="h-full w-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
        )}

        <div className={`group/bubble relative flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {!isDeleted && (
            <div className={`absolute -top-9 z-10 flex items-center gap-1 rounded-lg border p-1 opacity-0 shadow-xl transition-all duration-200 group-hover/bubble:opacity-100 ${
              isCurrentUser ? 'right-0' : 'left-0'
            } ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]'}`}>
              <button
                onClick={onReply}
                className={`rounded-md p-1.5 transition-colors ${
                  isDark ? 'text-[#8b949e] hover:bg-[#1f2937] hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={t("chat.reply")}
              >
                <Reply size={14} />
              </button>
              {isCurrentUser && (
                <>
                  <button
                    onClick={onEdit}
                    className={`rounded-md p-1.5 transition-colors ${
                      isDark ? 'text-[#8b949e] hover:bg-[#1f2937] hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={t("chat.edit")}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete?.(true)}
                    className={`rounded-md p-1.5 transition-colors ${
                      isDark ? 'text-[#8b949e] hover:bg-red-500/10 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                    title={t("chat.deleteForAll")}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              {!isCurrentUser && (
                <button
                  onClick={() => onDelete?.(false)}
                  className={`rounded-md p-1.5 transition-colors ${
                    isDark ? 'text-[#8b949e] hover:bg-red-500/10 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                  }`}
                  title={t("chat.deleteForMe")}
                >
                  <Trash size={14} />
                </button>
              )}
              <button
                onClick={() => onReact?.('👍')}
                className={`rounded-md p-1.5 transition-colors ${
                  isDark ? 'text-[#8b949e] hover:bg-emerald-500/10 hover:text-emerald-500' : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
                title={t("chat.react")}
              >
                <Smile size={14} />
              </button>
            </div>
          )}

          <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isDeleted
              ? isDark
                ? 'border border-dashed border-[#30363d] bg-[#0d1117] text-[#484f58] italic'
                : 'border border-dashed border-slate-200 bg-slate-50 text-slate-400 italic'
              : isCurrentUser
                ? 'rounded-br-none bg-primary text-white'
                : isDark
                  ? 'rounded-bl-none border border-[#30363d] bg-[#161b22] text-[#c9d1d9]'
                  : 'rounded-bl-none border border-slate-200 bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
          }`}>
            {message.forwarded && (
              <span className={`mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-tight opacity-80 ${
                isDark ? 'text-[#8b949e]' : 'text-slate-400'
              }`}>
                <Forward size={10} /> {t("chat.forwarded")}
              </span>
            )}

            {message.replyPreview && (
              <div className={`mb-2 flex flex-col gap-0.5 rounded-r-lg border-l-2 p-2 ${
                isDark ? 'border-emerald-400/50 bg-black/20' : 'border-emerald-400 bg-emerald-50/70'
              }`}>
                <span className="truncate text-[10px] font-bold text-emerald-400">{message.replyPreview.senderDisplayName}</span>
                <span className={`truncate text-xs italic leading-tight ${
                  isCurrentUser ? 'text-white/70' : isDark ? 'text-white/60' : 'text-slate-500'
                }`}>
                  {message.replyPreview.content}
                </span>
              </div>
            )}

            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
              {isDeleted ? t("chat.deleted") : (message.content || message.text || '')}
            </p>

            <div className={`mt-1.5 flex items-center gap-1.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] font-medium ${
                isCurrentUser ? 'text-white/60' : isDark ? 'text-[#8b949e]' : 'text-slate-400'
              }`}>
                {formatTime(message.createdAt || message.timestamp, locale)}
              </span>
              {message.isEdited && !isDeleted && <span className="text-[10px] italic opacity-60">{t("chat.edited")}</span>}
              {isCurrentUser && !isDeleted && <StatusIcon status={message.status || 'sent'} isDark={isDark} />}
            </div>
          </div>

          {reactionEntries.length > 0 && (
            <div className={`mt-1 flex flex-wrap gap-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {reactionEntries.map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(emoji)}
                  className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-all ${
                    users.includes('current')
                      ? isDark
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-900/20'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                      : isDark
                        ? 'border-[#30363d] bg-[#161b22] text-[#8b949e] hover:border-[#8b949e]/30'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
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
