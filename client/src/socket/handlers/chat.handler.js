import {
  newMessage,
  applyEditMessage,
  toggleReaction,
  setTypingStatus,
  updateMessageStatus,
  setConnectionStatus,
  incrementUnread,
  updateConversationMeta,
} from '../../redux/slices/chatSlice';

let getState = null;

export const injectGetState = (fn) => {
  getState = fn;
};

export const registerChatHandlers = (socket, dispatch) => {
  // ─── message:new ───────────────────────────────────────────────────────────
  socket.on('message:new', (message) => {
    const chatId = message.chat?.toString() || message.chatId?.toString();
    if (!chatId) return;

    // Add to message history
    dispatch(newMessage({ conversationId: chatId, message }));

    // Update conversation meta (last message preview, timestamp)
    dispatch(updateConversationMeta({
      chatId,
      lastMessage: message.content || message.text || '',
      lastMessageAt: message.createdAt || new Date().toISOString(),
    }));

    // Increment unread count if conversation is not currently open
    const currentState = getState?.();
    const selectedId = currentState?.chat?.selectedConversationId;
    const currentUserId = currentState?.auth?.user?._id?.toString();
    const senderId = message.sender?._id?.toString() || message.sender?.toString();

    // Only increment if not from self and not currently viewing
    if (senderId !== currentUserId && chatId !== selectedId) {
      dispatch(incrementUnread({ chatId }));

      // Emit delivery receipt back to sender via socket
      if (socket.connected) {
        socket.emit('message:delivered', { messageId: message._id, chatId });
      }
    }
  });

  // ─── message:updated (edit) ────────────────────────────────────────────────
  socket.on('message:updated', (data) => {
    dispatch(applyEditMessage({
      conversationId: data.chatId,
      messageId: data.messageId,
      text: data.content,
    }));
  });

  // ─── message:reaction:update ───────────────────────────────────────────────
  socket.on('message:reaction:update', (data) => {
    dispatch(toggleReaction({
      conversationId: data.chatId,
      messageId: data.messageId,
      reactions: data.reactions,
      fromServer: true,
    }));
  });

  // ─── message:delivered ────────────────────────────────────────────────────
  socket.on('message:delivered', (data) => {
    dispatch(updateMessageStatus({
      conversationId: data.chatId,
      messageId: data.messageId,
      status: 'delivered',
    }));
  });

  // ─── message:seen ────────────────────────────────────────────────────────
  socket.on('message:seen', (data) => {
    if (Array.isArray(data.messageIds)) {
      data.messageIds.forEach((msgId) => {
        dispatch(updateMessageStatus({
          conversationId: data.chatId,
          messageId: msgId,
          status: 'read',
        }));
      });
    }
  });

  // ─── chat:read (unread count sync) ────────────────────────────────────────
  socket.on('chat:read', (data) => {
    dispatch(setChatRead({ conversationId: data.chatId }));
  });

  // ─── typing indicators ───────────────────────────────────────────────────
  socket.on('typing:start', (data) => {
    dispatch(setTypingStatus({
      conversationId: data.chatId,
      isTyping: true,
      userName: data.displayName || data.userId,
    }));
  });

  socket.on('typing:stop', (data) => {
    dispatch(setTypingStatus({
      conversationId: data.chatId,
      isTyping: false,
      userName: null,
    }));
  });

  // ─── connection state ─────────────────────────────────────────────────────
  socket.on('connect', () => {
    dispatch(setConnectionStatus({ isConnected: true }));
  });

  socket.on('disconnect', () => {
    dispatch(setConnectionStatus({ isConnected: false }));
  });
};

export const unregisterChatHandlers = (socket) => {
  const events = [
    'message:new', 'message:updated', 'message:reaction:update',
    'message:delivered', 'message:seen',
    'typing:start', 'typing:stop',
    'connect', 'disconnect',
  ];
  events.forEach((e) => socket.off(e));
};
