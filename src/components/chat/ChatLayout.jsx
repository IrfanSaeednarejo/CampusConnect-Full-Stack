import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './Chatwindow';
import Button from '../common/Button';
import Modal from '../common/Modal';

/**
 * Advanced Chat Layout Component - Main chat application layout
 * Manages multiple chat windows, sidebar, and overall chat state
 */
const ChatLayout = React.forwardRef(({
  currentUser,
  chats = [],
  activeChat,
  messages = [],
  onlineUsers = [],
  onChatSelect,
  onSendMessage,
  onLoadMoreMessages,
  onMessageReply,
  onMessageReact,
  onMessageEdit,
  onMessageDelete,
  onTyping,
  onStopTyping,
  typingUsers = [],
  onNewChat,
  onSearchChats,
  searchQuery = '',
  filters = ['all', 'unread', 'groups', 'direct'],
  activeFilter = 'all',
  onFilterChange,
  loading = false,
  className = '',
  ...props
}, ref) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatWindows, setChatWindows] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState('direct');

  // Initialize with active chat if provided
  useEffect(() => {
    if (activeChat && !chatWindows.find(cw => cw.id === activeChat.id)) {
      setChatWindows([{
        id: activeChat.id,
        chat: activeChat,
        isMinimized: false,
        position: { x: 320, y: 100 }
      }]);
    }
  }, [activeChat]);

  // Handle chat window management
  const handleChatSelect = (chat) => {
    const existingWindow = chatWindows.find(cw => cw.id === chat.id);

    if (existingWindow) {
      // Bring existing window to front
      if (existingWindow.isMinimized) {
        setMinimizedChats(prev => prev.filter(id => id !== chat.id));
        setChatWindows(prev => prev.map(cw =>
          cw.id === chat.id ? { ...cw, isMinimized: false } : cw
        ));
      }
      onChatSelect?.(chat);
    } else {
      // Create new chat window
      const newWindow = {
        id: chat.id,
        chat,
        isMinimized: false,
        position: {
          x: 320 + (chatWindows.length * 30),
          y: 100 + (chatWindows.length * 30)
        }
      };
      setChatWindows(prev => [...prev, newWindow]);
      onChatSelect?.(chat);
    }
  };

  // Handle chat window minimization
  const handleMinimizeChat = (chatId, minimized) => {
    if (minimized) {
      setMinimizedChats(prev => [...prev, chatId]);
    } else {
      setMinimizedChats(prev => prev.filter(id => id !== chatId));
    }

    setChatWindows(prev => prev.map(cw =>
      cw.id === chatId ? { ...cw, isMinimized: minimized } : cw
    ));
  };

  // Handle chat window close
  const handleCloseChat = (chatId) => {
    setChatWindows(prev => prev.filter(cw => cw.id !== chatId));
    setMinimizedChats(prev => prev.filter(id => id !== chatId));
  };

  // Handle new chat creation
  const handleNewChat = (chatData) => {
    onNewChat?.(chatData);
    setShowNewChatModal(false);
  };

  // Get active chat window
  const activeChatWindow = chatWindows.find(cw => cw.id === activeChat?.id && !cw.isMinimized);

  // Layout animation variants
  const layoutVariants = {
    sidebarExpanded: {
      marginLeft: 320,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    sidebarCollapsed: {
      marginLeft: 72,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <div
      ref={ref}
      className={`h-screen bg-gray-100 flex ${className}`}
      {...props}
    >
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChat?.id}
        currentUser={currentUser}
        onChatSelect={handleChatSelect}
        onNewChat={() => setShowNewChatModal(true)}
        onSearch={onSearchChats}
        searchQuery={searchQuery}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        showOnlineStatus={true}
        className={sidebarCollapsed ? 'w-18' : 'w-80'}
      />

      {/* Main Content Area */}
      <motion.div
        className="flex-1 relative overflow-hidden"
        variants={layoutVariants}
        animate={sidebarCollapsed ? 'sidebarCollapsed' : 'sidebarExpanded'}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Chat Windows */}
        <div className="relative h-full p-4">
          <AnimatePresence>
            {chatWindows.map((chatWindow) => (
              <motion.div
                key={chatWindow.id}
                className="absolute"
                style={{
                  left: chatWindow.position.x,
                  top: chatWindow.position.y,
                  zIndex: chatWindow.id === activeChat?.id ? 10 : 1
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: chatWindow.isMinimized ? 0.8 : 1,
                  opacity: chatWindow.isMinimized ? 0.7 : 1
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                drag={!chatWindow.isMinimized}
                dragConstraints={{
                  left: 0,
                  top: 0,
                  right: window.innerWidth - 400,
                  bottom: window.innerHeight - 200
                }}
                onDragEnd={(event, info) => {
                  setChatWindows(prev => prev.map(cw =>
                    cw.id === chatWindow.id
                      ? { ...cw, position: { x: cw.position.x + info.offset.x, y: cw.position.y + info.offset.y } }
                      : cw
                  ));
                }}
              >
                <ChatWindow
                  chat={chatWindow.chat}
                  currentUser={currentUser}
                  messages={messages.filter(m => m.chatId === chatWindow.id)}
                  onlineUsers={onlineUsers}
                  onSendMessage={(messageData) => onSendMessage({ ...messageData, chatId: chatWindow.id })}
                  onLoadMoreMessages={() => onLoadMoreMessages(chatWindow.id)}
                  onMessageReply={onMessageReply}
                  onMessageReact={onMessageReact}
                  onMessageEdit={onMessageEdit}
                  onMessageDelete={onMessageDelete}
                  onTyping={() => onTyping(chatWindow.id)}
                  onStopTyping={() => onStopTyping(chatWindow.id)}
                  typingUsers={typingUsers.filter(user => user.chatId === chatWindow.id).map(u => u.name)}
                  isMinimized={chatWindow.isMinimized}
                  onMinimize={(minimized) => handleMinimizeChat(chatWindow.id, minimized)}
                  onClose={() => handleCloseChat(chatWindow.id)}
                  onMaximize={(fullscreen) => {
                    // Handle fullscreen logic
                    console.log('Toggle fullscreen:', fullscreen);
                  }}
                  loading={loading}
                  hasMoreMessages={true} // This would come from props
                  className="shadow-2xl"
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {chatWindows.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-blue-600 text-4xl">
                  chat_bubble_outline
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to Chat
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Start a conversation by selecting a chat from the sidebar or create a new one.
              </p>
              <Button onClick={() => setShowNewChatModal(true)} size="lg">
                Start New Chat
              </Button>
            </motion.div>
          )}
        </div>

        {/* Minimized Chat Bar */}
        <AnimatePresence>
          {minimizedChats.length > 0 && (
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {minimizedChats.map((chatId) => {
                const chat = chats.find(c => c.id === chatId);
                if (!chat) return null;

                return (
                  <button
                    key={chatId}
                    onClick={() => handleMinimizeChat(chatId, false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {chat.type === 'direct'
                        ? chat.participants.find(p => p.id !== currentUser.id)?.name
                        : chat.name
                      }
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Start New Chat"
        size="md"
      >
        <div className="space-y-6">
          {/* Chat Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chat Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNewChatType('direct')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  newChatType === 'direct'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-2xl">
                    person
                  </span>
                  <div>
                    <div className="font-medium">Direct Message</div>
                    <div className="text-sm text-gray-500">Chat with one person</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setNewChatType('group')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  newChatType === 'group'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-2xl">
                    group
                  </span>
                  <div>
                    <div className="font-medium">Group Chat</div>
                    <div className="text-sm text-gray-500">Chat with multiple people</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* User/Participant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {newChatType === 'direct' ? 'Select User' : 'Add Participants'}
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <div className="text-center text-gray-500">
                User selection component would go here
              </div>
            </div>
          </div>

          {/* Chat Details */}
          {newChatType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Group Details
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Group name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Group description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="ghost" onClick={() => setShowNewChatModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleNewChat}>
            {newChatType === 'direct' ? 'Start Chat' : 'Create Group'}
          </Button>
        </div>
      </Modal>
    </div>
  );
});

ChatLayout.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string
  }).isRequired,
  chats: PropTypes.array,
  activeChat: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.oneOf(['direct', 'group']),
    name: PropTypes.string,
    avatar: PropTypes.string,
    participants: PropTypes.array
  }),
  messages: PropTypes.array,
  onlineUsers: PropTypes.array,
  onChatSelect: PropTypes.func,
  onSendMessage: PropTypes.func,
  onLoadMoreMessages: PropTypes.func,
  onMessageReply: PropTypes.func,
  onMessageReact: PropTypes.func,
  onMessageEdit: PropTypes.func,
  onMessageDelete: PropTypes.func,
  onTyping: PropTypes.func,
  onStopTyping: PropTypes.func,
  typingUsers: PropTypes.array,
  onNewChat: PropTypes.func,
  onSearchChats: PropTypes.func,
  searchQuery: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.string),
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string
};

ChatLayout.displayName = 'ChatLayout';

export default ChatLayout;