import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentResponse } from '../../api/mock/agents/agentEngine';

const COLOR_MAP = {
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', hover: 'hover:bg-blue-700', border: 'border-blue-200', lightBg: 'bg-blue-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', hover: 'hover:bg-purple-700', border: 'border-purple-200', lightBg: 'bg-purple-50' },
  green: { bg: 'bg-primary', text: 'text-green-600', hover: 'hover:bg-primary-hover', border: 'border-green-200', lightBg: 'bg-green-50' },
  orange: { bg: 'bg-orange-600', text: 'text-orange-600', hover: 'hover:bg-orange-700', border: 'border-orange-200', lightBg: 'bg-orange-50' },
  default: { bg: 'bg-primary', text: 'text-primary', hover: 'hover:bg-primary-hover', border: 'border-primary', lightBg: 'bg-primary/10' },
};

// ── AI Status Detection (dev-only indicator) ──────────────
const isRealAI = !!(
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_OPENAI_API_KEY ||
  import.meta.env.VITE_GROQ_API_KEY
);

export default function AgentChatUI({ agentConfig }) {
  const navigate = useNavigate();
  const { agentType, name, subtitle, accentColor, icon, welcomeMessage, suggestedStarters } = agentConfig;
  
  const colorTheme = COLOR_MAP[accentColor] || COLOR_MAP.default;
  const storageKey = `agent_chat_${agentType}`;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const lastUserMessageRef = useRef(null); // Track last user message for retry

  // Load chat history
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeWelcome();
      }
    } else {
      initializeWelcome();
    }
  }, [agentType]);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initializeWelcome = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'agent',
        content: welcomeMessage,
        timestamp: new Date().toISOString(),
        followUps: [],
      }
    ]);
  };

  const handleClear = () => {
    localStorage.removeItem(storageKey);
    initializeWelcome();
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isTyping) return;

    // Store last user message for retry functionality
    lastUserMessageRef.current = textToSend.trim();

    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
      followUps: [],
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // Call Engine
    try {
      const history = [...messages, newUserMsg];
      const response = await getAgentResponse(agentType, newUserMsg.content, history);
      
      const newAgentMsg = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.message,
        timestamp: new Date().toISOString(),
        followUps: response.followUps || [],
        isError: response.isError || false, // Error flag from engine
      };
      
      setMessages(prev => [...prev, newAgentMsg]);
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
        followUps: [],
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Retry: remove error bubble and resend last user message ──
  const handleRetry = () => {
    if (!lastUserMessageRef.current || isTyping) return;

    // Remove the last error message
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].isError) {
        newMsgs.pop();
      }
      // Also remove the last user message so handleSend can re-add it
      if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'user') {
        newMsgs.pop();
      }
      return newMsgs;
    });

    // Resend after state update
    setTimeout(() => {
      handleSend(lastUserMessageRef.current);
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isChatEmpty = messages.length <= 1; // Only welcome message
  const lastMessage = messages[messages.length - 1];
  const activeFollowUps = lastMessage?.role === 'agent' ? lastMessage.followUps : [];

  return (
    <div className="flex flex-col h-screen w-full bg-background font-sans">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-enter { animation: fadeInUp 0.3s ease-out forwards; }
        
        @keyframes bounceDelay {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .dot-1 { animation: bounceDelay 1.4s infinite ease-in-out both; animation-delay: -0.32s; }
        .dot-2 { animation: bounceDelay 1.4s infinite ease-in-out both; animation-delay: -0.16s; }
        .dot-3 { animation: bounceDelay 1.4s infinite ease-in-out both; }
      `}</style>

      {/* FIXED TOP BAR */}
      <header className="h-[60px] flex-shrink-0 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-text-secondary hover:text-text-primary transition-colors py-2 pr-4 font-medium"
        >
          <span className="material-symbols-outlined text-xl mr-1">arrow_back</span>
          Back
        </button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h1 className="font-bold text-text-primary leading-tight">{name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-text-secondary">{subtitle}</p>
            {/* AI Status Indicator — dev only */}
            {import.meta.env.DEV && (
              <span className={`
                text-xs px-2 py-0.5 rounded-full font-medium
                ${isRealAI
                  ? 'bg-green-900/50 text-green-400 border border-green-700'
                  : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                }
              `}>
                {isRealAI
                  ? `🟢 ${import.meta.env.VITE_AI_PROVIDER || 'AI'} connected`
                  : '🟡 Mock responses'
                }
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={handleClear}
          className="text-text-secondary hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
          title="Clear Chat"
        >
          <span className="material-symbols-outlined text-xl">delete_sweep</span>
        </button>
      </header>

      {/* MESSAGE THREAD AREA */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
          
          {/* EMPTY STATE */}
          {isChatEmpty && (
            <div className="flex flex-col items-center justify-center mt-10 mb-8 msg-enter">
              <div className={`w-20 h-20 rounded-full ${colorTheme.lightBg} flex items-center justify-center text-4xl mb-4 shadow-sm`}>
                {icon}
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">{name}</h2>
              <p className="text-text-secondary mb-8 text-center">{subtitle}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {suggestedStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(starter)}
                    className={`text-left px-4 py-3 rounded-xl border border-border bg-surface hover:border-[#475569] hover:shadow-sm transition-all text-sm text-text-primary`}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isError = msg.isError === true;
            
            return (
              <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} msg-enter`} style={{ animationDelay: `${Math.min(0.2, (messages.length - idx) * 0.05)}s` }}>
                {!isUser && (
                  <div className={`w-8 h-8 rounded-full ${colorTheme.bg} text-text-primary flex items-center justify-center text-sm flex-shrink-0 mr-3 mt-1 shadow-sm`}>
                    {icon}
                  </div>
                )}
                
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[75%]`}>
                  <div className={`
                    px-4 py-3 shadow-sm text-[15px] leading-relaxed
                    ${isUser 
                      ? `${colorTheme.bg} text-text-primary rounded-2xl rounded-br-sm` 
                      : isError
                        ? 'bg-red-900/20 text-text-primary border border-red-800/50 rounded-2xl rounded-bl-sm'
                        : 'bg-surface text-text-primary border border-border rounded-2xl rounded-bl-sm'
                    }
                  `}>
                    {/* Error icon prefix */}
                    {isError && !isUser && (
                      <span className="text-red-400 mr-1">⚠️</span>
                    )}
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-1 mx-1">
                    <span className="text-xs text-text-secondary">{formatTime(msg.timestamp)}</span>
                    {/* Retry button for error messages */}
                    {isError && !isUser && (
                      <button
                        onClick={handleRetry}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        ↺ Try again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* TYPING INDICATOR */}
          {isTyping && (
            <div className="flex w-full justify-start msg-enter">
              <div className={`w-8 h-8 rounded-full ${colorTheme.bg} text-text-primary flex items-center justify-center text-sm flex-shrink-0 mr-3 mt-1 shadow-sm`}>
                {icon}
              </div>
              <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm flex gap-1 items-center h-[46px]">
                <div className={`w-2 h-2 rounded-full ${colorTheme.bg} opacity-60 dot-1`}></div>
                <div className={`w-2 h-2 rounded-full ${colorTheme.bg} opacity-60 dot-2`}></div>
                <div className={`w-2 h-2 rounded-full ${colorTheme.bg} opacity-60 dot-3`}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* FIXED BOTTOM INPUT BAR */}
      <div className="bg-surface border-t border-border w-full flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col gap-3">
          
          {/* FOLLOW UPS */}
          {!isTyping && activeFollowUps.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {activeFollowUps.map((fst, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(fst)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full border ${colorTheme.border} ${colorTheme.lightBg} ${colorTheme.text} text-sm font-medium hover:brightness-95 transition-all`}
                >
                  {fst}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 bg-background border border-border rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              placeholder="Ask me anything..."
              className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-text-primary placeholder-[#475569]"
              rows={1}
              style={{
                height: inputText.length === 0 ? '40px' : 'auto'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                ${!inputText.trim() || isTyping 
                  ? 'bg-[#C7D2FE] text-text-secondary cursor-not-allowed' 
                  : `${colorTheme.bg} text-text-primary shadow-md transform hover:scale-105 active:scale-95`
                }
              `}
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-text-tertiary">CampusConnect AI Assistant can make mistakes. Verify important information.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
