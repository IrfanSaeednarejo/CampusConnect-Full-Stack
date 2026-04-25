import { useDispatch, useSelector } from 'react-redux';
import {
  selectConversations,
  selectActiveConversationId,
  selectConversationsLoading,
  fetchConversationThunk,
  deleteConversationThunk,
  startConversationThunk,
} from '../../redux/slices/nexusSlice';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NexusSidebar() {
  const dispatch = useDispatch();
  const conversations = useSelector(selectConversations);
  const activeId = useSelector(selectActiveConversationId);
  const loading = useSelector(selectConversationsLoading);

  const handleNew = () => dispatch(startConversationThunk());
  const handleSelect = (id) => { if (id !== activeId) dispatch(fetchConversationThunk(id)); };
  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) dispatch(deleteConversationThunk(id));
  };

  return (
    <div className="w-64 shrink-0 flex flex-col border-r border-[#21262d] bg-[#0d1117]">
      {/* Header */}
      <div className="p-3 border-b border-[#21262d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3fb950] to-[#238636] flex items-center justify-center text-xs font-bold text-white">N</div>
          <span className="text-sm font-semibold text-[#e6edf3]">Nexus</span>
        </div>
        <button
          onClick={handleNew}
          id="nexus-new-chat-btn"
          title="New conversation"
          className="p-1.5 rounded-lg text-[#8b949e] hover:bg-[#21262d] hover:text-[#3fb950] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <svg className="w-5 h-5 animate-spin text-[#3fb950]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-[#8b949e]">No conversations yet.</p>
            <p className="text-xs text-[#8b949e] mt-1">Start a new chat above!</p>
          </div>
        )}

        {conversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => handleSelect(conv._id)}
            className={`group flex items-start gap-2 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors
              ${conv._id === activeId
                ? 'bg-[#238636]/15 border border-[#238636]/30'
                : 'hover:bg-[#21262d] border border-transparent'
              }`}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${conv._id === activeId ? 'text-[#3fb950]' : 'text-[#e6edf3]'}`}>
                {conv.title}
              </p>
              <p className="text-[10px] text-[#8b949e] mt-0.5">
                {formatDate(conv.updatedAt)} · {conv.messageCount || 0} msg{conv.messageCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(e, conv._id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#8b949e] hover:text-red-400 transition-all shrink-0 mt-0.5"
              title="Delete conversation"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
