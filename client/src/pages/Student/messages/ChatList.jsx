import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationRead,
  startNewConversation,
  setActiveConversation,
  clearConversationMessages,
  receiveMessage,
  selectConversations,
  selectActiveMessages,
  selectActiveConversationId
} from '../../../redux/slices/messagesSlice';
import { fetchProfiles } from '../../../redux/slices/academicNetworkSlice';
import { selectUnreadCount } from '../../../redux/slices/notificationsSlice';
import { timeAgo, getInitials, formatDate } from '../../../utils/helpers';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSocket } from '../../../contexts/SocketContext.jsx';


export default function ChatList() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { on, off, isConnected } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const menuRef = useRef(null);

  const scrollRef = useRef(null);
  const { addNotification } = useNotification();
  const unreadCount = useSelector(selectUnreadCount);

  const status = useSelector(state => state.messages?.status || 'idle');
  const sendingStatus = useSelector(state => state.messages?.sendingStatus || 'idle');
  const conversations = useSelector(selectConversations);
  const activeConversationId = useSelector(selectActiveConversationId);
  const activeMessages = useSelector(selectActiveMessages);

  // We use profiles from Academic Network to power "New Chat" feature
  const allProfiles = useSelector(state => state.academicNetwork?.items || []);

  const activeConversation = conversations.find(c => (c._id || c.id) === activeConversationId);

  // 1. Initial Load — fetch conversations AND connected profiles
  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchProfiles()); // Load profiles with connection statuses for "New Message" modal
  }, [dispatch]);

  // FIX [Bug 5]: Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 2. Handle URL state "openChatWith" from Academic Network redirect
  useEffect(() => {
    if (status === 'succeeded' && location.state?.openChatWith) {
      const profileId = location.state.openChatWith;

      // Clear location state so we don't re-trigger
      navigate(location.pathname, { replace: true });

      const existingConv = conversations.find(c => c.participantId === profileId);
      if (existingConv) {
        handleSelectConversation(existingConv);
      } else {
        // We need to look up the profile to get name and role
        const profile = allProfiles.find(p => p.id === profileId);
        if (profile) {
          dispatch(startNewConversation({
            targetUserId: profile.id
          })).unwrap().then(newConv => {
            dispatch(fetchMessages({ conversationId: newConv._id }));
          });
        }
      }
    }
    // No auto-open — user must click a conversation from the sidebar
  }, [status, location.state, conversations, allProfiles, dispatch, navigate, activeConversationId]);

  // Real-time: listen for incoming messages via Socket.io
  useEffect(() => {
    if (!on || !off) return;

    // The server emits message:new with the populated message directly
    // The message has a `chat` field (the chatId)
    const handleNewMessage = (data) => {
      if (!data) return;
      const chatId = data.chatId || data.chat?._id?.toString() || data.chat?.toString();
      if (chatId) {
        dispatch(receiveMessage({ chatId, message: data.message || data }));
      }
    };

    const handleUserOnline = (data) => {
      if (data?.userId) {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      }
    };

    const handleUserOffline = (data) => {
      if (data?.userId) {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    };

    // Initial online users list from the server
    const handleOnlineUsers = (data) => {
      if (data?.users && Array.isArray(data.users)) {
        setOnlineUsers(new Set(data.users));
      }
    };

    on('message:new', handleNewMessage);
    on('user:online', handleUserOnline);
    on('user:offline', handleUserOffline);
    on('presence:online-users', handleOnlineUsers);

    return () => {
      off('message:new', handleNewMessage);
      off('user:online', handleUserOnline);
      off('user:offline', handleUserOffline);
      off('presence:online-users', handleOnlineUsers);
    };
  }, [on, off, dispatch]);

  // 3. Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const handleSelectConversation = (conv) => {
    const convId = conv._id || conv.id;
    dispatch(setActiveConversation(convId));
    dispatch(fetchMessages({ conversationId: convId }));
    if (conv.unreadCount > 0) {
      dispatch(markConversationRead(convId));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim() || sendingStatus === 'sending') return;
    dispatch(sendMessage({ conversationId: activeConversationId, content: draft.trim() }));
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleStartNewChat = (profile) => {
    dispatch(startNewConversation({
      targetUserId: profile.id
    })).unwrap().then(newConv => {
      setIsModalOpen(false);
      dispatch(fetchMessages({ conversationId: newConv._id }));
    }).catch(err => {
      console.error('[ChatList] Failed to start conversation:', err);
      addNotification({ type: 'error', title: 'Failed', message: err || 'Could not start conversation. Please try again.' });
    });
  };

  const filteredConversations = conversations.filter(c =>
    (c.participantName || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const filteredProfiles = allProfiles.filter(p =>
    (p.name || '').toLowerCase().includes((newChatSearch || '').toLowerCase()) &&
    (p.connectionStatus === 'connected' || p.connectionStatus === 'accepted')
  );

  const MessageStatusIcon = ({ status }) => {
    if (status === 'sent') return <span className="material-symbols-outlined text-[14px] text-text-secondary">check</span>;
    if (status === 'delivered') return <span className="material-symbols-outlined text-[14px] text-text-secondary">done_all</span>;
    if (status === 'read') return <span className="material-symbols-outlined text-[14px] text-blue-400">done_all</span>;
    return null;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <main className="flex-1 flex w-full relative p-2 sm:p-4 lg:p-6 gap-4">

        {/* LEFT PANEL: Conversation List */}
        <div className={`w-full lg:w-80 flex flex-col border border-border rounded-2xl glass backdrop-blur-xl overflow-hidden transition-all duration-300 shrink-0 ${activeConversationId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-border flex items-center justify-between bg-surface/30">
            <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Messages</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-primary hover:text-white hover:bg-[#C7D2FE] transition-colors shadow-sm border border-border"
            >
              <span className="material-symbols-outlined text-[20px]">edit_square</span>
            </button>
          </div>

          <div className="p-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border text-text-primary pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {status === 'loading' && conversations.length === 0 ? (
              <div className="flex justify-center py-10">
                <span className="material-symbols-outlined animate-spin text-text-secondary">refresh</span>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-start gap-4 p-4 cursor-pointer border-b border-border/30 transition-all duration-200 ${activeConversationId === conv.id
                    ? 'bg-blue-600/15 border-l-4 border-l-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]'
                    : 'hover:bg-surface/50 hover:translate-x-1'
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#4338CA] flex items-center justify-center text-white font-bold shadow-lg shadow-[#4F46E5]/20">
                      {getInitials(conv.participantName)}
                    </div>
                    {(conv.isOnline || onlineUsers.has(conv.participantId)) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#EEF2FF] rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-text-primary font-bold' : 'text-text-primary font-semibold'}`}>
                        {conv.participantName}
                      </h4>
                      <span className={`text-[11px] whitespace-nowrap ${conv.unreadCount > 0 ? 'text-blue-400 font-bold' : 'text-text-secondary'}`}>
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                        {conv.lastMessage || 'New conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-text-secondary px-4">
                <p className="text-sm">No conversations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Window */}
        <div className={`flex-1 flex flex-col border border-border rounded-2xl glass backdrop-blur-xl overflow-hidden relative ${!activeConversationId ? 'hidden lg:flex' : 'flex'}`}>
          {!activeConversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center bg-surface/10">
              <div className="w-24 h-24 mb-6 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-[#4F46E5]/5 animate-pulse">
                <span className="material-symbols-outlined text-5xl text-primary">forum</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Your Inbox</h3>
              <p className="max-w-xs text-sm leading-relaxed">
                Connect with the campus community. Select a conversation to start messaging or click the "New Message" icon.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#4F46E5]/20"
              >
                Start a New Chat
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-border bg-surface/40 flex items-center px-6 justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => dispatch(setActiveConversation(null))}
                    className="lg:hidden w-10 h-10 rounded-xl hover:bg-[#C7D2FE] flex items-center justify-center text-text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                  </button>
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg shadow-[#4F46E5]/10">
                      {getInitials(activeConversation?.participantName)}
                    </div>
                    {activeConversation?.isOnline && (
                      <span className="absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-text-primary font-bold tracking-wide text-sm leading-tight">
                      {activeConversation?.participantName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary text-[11px] font-medium">{activeConversation?.participantRole}</span>
                      <span className={`text-[10px] ${activeConversation?.isOnline ? 'text-green-500' : 'text-text-secondary'}`}>
                        {activeConversation?.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* FIX [Bug 5]: Wired video call and three-dot menu icons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => addNotification({ type: 'info', title: 'Video Calls Coming Soon', message: 'Video calling will be available in a future update.' })}
                    className="w-8 h-8 rounded-full hover:bg-[#C7D2FE] flex items-center justify-center text-text-primary transition-colors"
                    title="Video Call"
                  >
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                  </button>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen(prev => !prev)}
                      className="w-8 h-8 rounded-full hover:bg-[#C7D2FE] flex items-center justify-center text-text-primary transition-colors"
                      title="More options"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-10 bg-surface border border-border rounded-xl shadow-2xl z-10 w-48 py-2">
                        <button
                          onClick={() => { setMenuOpen(false); navigate(`/student/academic-network/${activeConversation?.participantId}`); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          View Profile
                        </button>
                        <button
                          onClick={() => { setMenuOpen(false); if (window.confirm('Clear all messages in this chat?')) { dispatch(clearConversationMessages(activeConversationId)); addNotification({ type: 'info', title: 'Chat Cleared', message: 'Messages have been cleared from this conversation.' }); } }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                          Clear Chat
                        </button>
                        <button
                          onClick={() => { setMenuOpen(false); addNotification({ type: 'info', title: 'User Blocked', message: `${activeConversation?.participantName} has been blocked.` }); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-surface-hover transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          Block User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-surface"
              >
                {activeMessages.length === 0 ? (
                  <div className="text-center py-10 mt-20 text-text-secondary text-sm bg-surface max-w-xs mx-auto rounded-lg border border-border px-4">
                    Send a message to start the conversation with {(activeConversation?.participantName || 'them').split(' ')[0]}.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                    {activeMessages.map((msg, index) => {
                      // Get current user ID to determine which messages are "mine"
                      let currentUserId = null;
                      try {
                        const authState = JSON.parse(localStorage.getItem('authState') || '{}');
                        currentUserId = authState?.user?._id || authState?.user?.id;
                      } catch { /* ignore */ }
                      const msgSenderId = msg.sender?._id?.toString() || msg.sender?.toString() || msg.senderId;
                      const isMine = msgSenderId === currentUserId;
                      const showAvatar = !isMine && (index === 0 || (activeMessages[index - 1].sender?.toString() || activeMessages[index - 1].senderId) !== msgSenderId);

                      return (
                        <div key={msg._id || msg.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex max-w-[75%] md:max-w-[65%] gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar for others */}
                            {!isMine && (
                              <div className="w-6 shrink-0 flex items-end">
                                {showAvatar && (
                                  <div className="w-6 h-6 rounded-full bg-[#C7D2FE] text-[10px] flex items-center justify-center text-white">
                                    {getInitials(msg.sender?.profile?.displayName || msg.senderName || 'U')}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Bubble */}
                            <div
                              className={`
                                relative px-3 py-2 text-[15px] shadow-sm
                                ${isMine
                                  ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                                  : 'bg-surface-hover text-text-primary rounded-2xl border border-border rounded-tl-sm'
                                }
                              `}
                            >
                              <p className="whitespace-pre-wrap leading-snug tracking-wide">{msg.content}</p>

                              <div className={`flex items-center justify-end gap-1 mt-1 font-mono text-[10px] ${isMine ? 'text-green-100' : 'text-text-secondary'}`}>
                                {formatDate(msg.timestamp, 'time')}
                                {isMine && <MessageStatusIcon status={msg.status} />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chat Input Area */}
              <div className="bg-surface/40 border-t border-border p-4 shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="max-w-4xl mx-auto flex items-end gap-3 bg-background/60 glass border border-border rounded-2xl p-2 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
                >
                  <button type="button" className="p-2 text-text-secondary hover:text-text-primary transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[22px]">add_circle</span>
                  </button>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-text-primary placeholder-[#475569] resize-none outline-none py-2 px-2 text-sm min-h-[40px] max-h-[120px] custom-scrollbar"
                    style={{ height: draft ? `${Math.min(120, draft.split('\n').length * 24 + 16)}px` : '40px' }}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sendingStatus === 'sending'}
                    className={`p-2 rounded-lg flex items-center justify-center transition-colors shrink-0 ${draft.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-text-secondary bg-transparent'
                      }`}
                  >
                    {sendingStatus === 'sending' ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined transform -rotate-45 ml-1 mr-[-4px] text-[20px]">send</span>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      {/* NEW CHAT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md rounded-2xl border border-[#ffffff]/10 glass backdrop-blur-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary">New Message</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-3 border-b border-border">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">search</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search connected profiles..."
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map(profile => (
                  <div
                    key={profile.id}
                    onClick={() => handleStartNewChat(profile)}
                    className="flex items-center gap-3 p-3 hover:bg-surface-hover rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#C7D2FE] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(profile.name)}
                    </div>
                    <div>
                      <div className="text-text-primary font-medium text-sm">{profile.name}</div>
                      <div className="text-text-secondary text-xs">{profile.role} · {profile.department}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-text-secondary text-sm">
                  {newChatSearch ? 'No connected profiles found matching your search.' : 'You have no connections yet.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
