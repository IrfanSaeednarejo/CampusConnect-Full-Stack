import {
  newMessage,
  applyEditMessage,
  toggleReaction,
  setTypingStatus,
  updateMessageStatus,
  setConnectionStatus,
  setChatRead,
} from '../../redux/slices/chatSlice';


export const registerChatHandlers = (socket, dispatch) => {
  socket.on('message:new', (message) => {
    const chatId = message.chat?.toString() || message.chatId;
    if (chatId) {
      dispatch(newMessage({ conversationId: chatId, message }));
      if (message?._id) {
        socket.emit('message:delivered', { messageId: message._id, chatId });
      }
    }
  });
  socket.on('message:updated', (data) => {
    dispatch(applyEditMessage({
      conversationId: data.chatId,
      messageId: data.messageId,
      text: data.content,
    }));
  });

  socket.on('message:reaction:update', (data) => {
    dispatch(toggleReaction({
      conversationId: data.chatId,
      messageId: data.messageId,
      reactions: data.reactions,
      fromServer: true,
    }));
  });

  socket.on('message:delivered', (data) => {
    dispatch(updateMessageStatus({
      conversationId: data.chatId,
      messageId: data.messageId,
      status: 'delivered',
    }));
  });

  socket.on('message:seen', (data) => {
    if (data.messageIds) {
      data.messageIds.forEach((msgId) => {
        dispatch(updateMessageStatus({
          conversationId: data.chatId,
          messageId: msgId,
          status: 'read',
        }));
      });
    }
  });

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

  socket.on('chat:read', (data) => {
    if (data?.chatId) {
      dispatch(setChatRead({ conversationId: data.chatId }));
    }
  });

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
    'typing:start', 'typing:stop', 'chat:read',
  ];
  events.forEach((e) => socket.off(e));
};
