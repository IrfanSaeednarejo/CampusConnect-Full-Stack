import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendMessageThunk,
  addOptimisticUserMessage,
  selectActiveMessages,
  selectNexusStreaming,
  selectActiveConversationId,
  selectNexusError,
  fetchConversationsThunk,
} from '../../redux/slices/nexusSlice';
import NexusSidebar from './NexusSidebar';
import NexusMessageBubble from './NexusMessageBubble';
import NexusTypingIndicator from './NexusTypingIndicator';
import NexusInput from './NexusInput';

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3fb950] to-[#1a7f37] flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-green-500/20 mb-4">
        N
      </div>
      <h2 className="text-xl font-semibold text-[#e6edf3] mb-2">Hi, I'm Nexus</h2>
      <p className="text-sm text-[#8b949e] max-w-xs leading-relaxed mb-6">
        Your AI campus assistant. I can create notes & tasks, suggest mentors, explain topics, and more.
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm text-left">
        {[
          { icon: '📝', text: 'Save a note for me' },
          { icon: '✅', text: 'Create a study reminder' },
          { icon: '🎓', text: 'Find a web dev mentor' },
          { icon: '📖', text: 'Explain my OS notes' },
        ].map((s) => (
          <div key={s.text} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-xs text-[#8b949e]">
            <span>{s.icon}</span>
            <span>"{s.text}"</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NexusChat() {
  const dispatch = useDispatch();
  const messages = useSelector(selectActiveMessages);
  const isStreaming = useSelector(selectNexusStreaming);
  const conversationId = useSelector(selectActiveConversationId);
  const error = useSelector(selectNexusError);
  const bottomRef = useRef(null);

  // Load conversation list on mount
  useEffect(() => {
    dispatch(fetchConversationsThunk());
  }, [dispatch]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = (text) => {
    dispatch(addOptimisticUserMessage(text));
    dispatch(sendMessageThunk({ message: text, conversationId }));
  };

  return (
    <div className="flex h-full bg-[#0d1117]">
      {/* Left: Conversation list */}
      <NexusSidebar />

      {/* Right: Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-3 bg-[#0d1117]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3fb950] to-[#238636] flex items-center justify-center text-sm font-bold text-white shadow-md shadow-green-500/20">
            N
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e6edf3]">Nexus Assistant</p>
            <p className="text-[10px] text-[#8b949e]">Powered by Gemini 2.5 Flash</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
            <span className="text-xs text-[#8b949e]">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !isStreaming ? (
            <EmptyState />
          ) : (
            messages.map((msg, i) => (
              <NexusMessageBubble key={msg._id || i} message={msg} />
            ))
          )}
          {isStreaming && <NexusTypingIndicator />}

          {/* Error toast */}
          {error && (
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                ⚠️ {error}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <NexusInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
