import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import ChatLayout from './ChatLayout';
import { io } from 'socket.io-client';

/**
 * Advanced Chat Application Component - Main chat application entry point
 * Manages WebSocket connections, real-time messaging, and chat state
 */
const ChatApp = React.forwardRef(({
  currentUser,
  apiBaseUrl = '/api',
  socketUrl,
  onError,
  onMessage,
  onChatUpdate,
  className = '',
  ...props
}, ref) => {
  // State management
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Socket connection
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const socketUrlToUse = socketUrl || apiBaseUrl.replace('/api', '');

    const newSocket = io(socketUrlToUse, {
      auth: {
        userId: currentUser.id,
        token: localStorage.getItem('authToken') // Adjust based on your auth system
      },
      transports: ['websocket', 'polling']
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      onError?.(error);
    });

    // Chat events
    newSocket.on('chats:list', (chatsData) => {
      setChats(chatsData);
    });

    newSocket.on('chat:created', (newChat) => {
      setChats(prev => [newChat, ...prev]);
      onChatUpdate?.('created', newChat);
    });

    newSocket.on('chat:updated', (updatedChat) => {
      setChats(prev => prev.map(chat =>
        chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
      ));
      if (activeChat?.id === updatedChat.id) {
        setActiveChat(prev => ({ ...prev, ...updatedChat }));
      }
      onChatUpdate?.('updated', updatedChat);
    });

    // Message events
    newSocket.on('messages:list', ({ chatId, messages: newMessages }) => {
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.chatId !== chatId);
        return [...filtered, ...newMessages];
      });
    });

    newSocket.on('message:received', (message) => {
      setMessages(prev => [...prev, message]);
      onMessage?.('received', message);

      // Update chat's last message
      setChats(prev => prev.map(chat =>
        chat.id === message.chatId
          ? { ...chat, lastMessage: message, unreadCount: (chat.unreadCount || 0) + 1 }
          : chat
      ));
    });

    newSocket.on('message:sent', (message) => {
      setMessages(prev => prev.map(msg =>
        msg.tempId === message.tempId ? message : msg
      ));
      onMessage?.('sent', message);
    });

    newSocket.on('message:updated', (updatedMessage) => {
      setMessages(prev => prev.map(msg =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
      onMessage?.('updated', updatedMessage);
    });

    newSocket.on('message:deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      onMessage?.('deleted', messageId);
    });

    // Typing indicators
    newSocket.on('typing:start', ({ chatId, userId, userName }) => {
      setTypingUsers(prev => {
        const existing = prev.find(t => t.userId === userId && t.chatId === chatId);
        if (existing) return prev;
        return [...prev, { userId, userName, chatId, timestamp: Date.now() }];
      });
    });

    newSocket.on('typing:stop', ({ chatId, userId }) => {
      setTypingUsers(prev => prev.filter(t => !(t.userId === userId && t.chatId === chatId)));
    });

    // User presence
    newSocket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user:status', ({ userId, status }) => {
      setOnlineUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status } : user
      ));

      // Update participants in chats
      setChats(prev => prev.map(chat => ({
        ...chat,
        participants: chat.participants.map(participant =>
          participant.id === userId ? { ...participant, status } : participant
        )
      })));
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.id, apiBaseUrl, socketUrl, onError, onMessage, onChatUpdate]);

  // Load initial data
  useEffect(() => {
    if (isConnected && socket) {
      loadChats();
      loadOnlineUsers();
    }
  }, [isConnected, socket]);

  // Auto-clear typing indicators after 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(t =>
        Date.now() - t.timestamp < 3000
      ));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // API functions
  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/chats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load chats');

      const chatsData = await response.json();
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId, beforeMessageId = null) => {
    try {
      const url = new URL(`${apiBaseUrl}/chats/${chatId}/messages`);
      if (beforeMessageId) {
        url.searchParams.set('before', beforeMessageId);
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const messagesData = await response.json();

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.chatId !== chatId);
        return [...filtered, ...messagesData];
      });

      return messagesData;
    } catch (error) {
      console.error('Error loading messages:', error);
      onError?.(error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/users/online`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load online users');

      const usersData = await response.json();
      setOnlineUsers(usersData);
    } catch (error) {
      console.error('Error loading online users:', error);
      onError?.(error);
    }
  };

  // Event handlers
  const handleChatSelect = useCallback(async (chat) => {
    setActiveChat(chat);

    // Load messages for selected chat
    if (!messages.some(msg => msg.chatId === chat.id)) {
      await loadMessages(chat.id);
    }

    // Mark chat as read
    setChats(prev => prev.map(c =>
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    ));

    // Emit chat opened event
    socket?.emit('chat:opened', { chatId: chat.id });
  }, [messages, socket]);

  const handleSendMessage = useCallback(async (messageData) => {
    if (!socket || !activeChat) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      tempId,
      chatId: activeChat.id,
      sender: currentUser,
      content: messageData.content,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sending',
      attachments: messageData.attachments || []
    };

    // Add temporary message immediately
    setMessages(prev => [...prev, tempMessage]);

    // Send via socket
    socket.emit('message:send', {
      ...messageData,
      chatId: activeChat.id,
      tempId
    });
  }, [socket, activeChat, currentUser]);

  const handleLoadMoreMessages = useCallback(async (chatId) => {
    if (!messages.some(msg => msg.chatId === chatId)) return;

    const oldestMessage = messages
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];

    if (oldestMessage) {
      await loadMessages(chatId, oldestMessage.id);
    }
  }, [messages]);

  const handleMessageReply = useCallback((message) => {
    // Implementation for reply functionality
    console.log('Reply to message:', message);
  }, []);

  const handleMessageReact = useCallback((messageId, emoji) => {
    socket?.emit('message:react', { messageId, emoji });
  }, [socket]);

  const handleMessageEdit = useCallback((message) => {
    // Implementation for edit functionality
    console.log('Edit message:', message);
  }, []);

  const handleMessageDelete = useCallback((messageId) => {
    socket?.emit('message:delete', { messageId });
  }, [socket]);

  const handleTyping = useCallback(() => {
    if (activeChat) {
      socket?.emit('typing:start', { chatId: activeChat.id });
    }
  }, [socket, activeChat]);

  const handleStopTyping = useCallback(() => {
    if (activeChat) {
      socket?.emit('typing:stop', { chatId: activeChat.id });
    }
  }, [socket, activeChat]);

  const handleNewChat = useCallback(async (chatData) => {
    socket?.emit('chat:create', chatData);
  }, [socket]);

  const handleSearchChats = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // Connection status indicator
  const ConnectionStatus = () => (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          className="fixed top-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm">Reconnecting...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={ref} className={`relative h-screen ${className}`} {...props}>
      <ConnectionStatus />

      <ChatLayout
        currentUser={currentUser}
        chats={chats}
        activeChat={activeChat}
        messages={messages}
        onlineUsers={onlineUsers}
        onChatSelect={handleChatSelect}
        onSendMessage={handleSendMessage}
        onLoadMoreMessages={handleLoadMoreMessages}
        onMessageReply={handleMessageReply}
        onMessageReact={handleMessageReact}
        onMessageEdit={handleMessageEdit}
        onMessageDelete={handleMessageDelete}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        typingUsers={typingUsers}
        onNewChat={handleNewChat}
        onSearchChats={handleSearchChats}
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        loading={loading}
      />
    </div>
  );
});

ChatApp.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string
  }).isRequired,
  apiBaseUrl: PropTypes.string,
  socketUrl: PropTypes.string,
  onError: PropTypes.func,
  onMessage: PropTypes.func,
  onChatUpdate: PropTypes.func,
  className: PropTypes.string
};

ChatApp.displayName = 'ChatApp';

export default ChatApp;