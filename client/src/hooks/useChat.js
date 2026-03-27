import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSocket } from '../socket/socket';
import {
  fetchChats,
  fetchMessages,
  setSelectedConversation,
  closeConversation,
  addOptimisticMessage,
  replaceOptimisticMessage,
  markMessageFailed,
  setDraft,
  selectConversations,
  selectMessagesByConversation,
  selectUnreadByConversation,
  selectSelectedConversationId,
  selectTypingByConversation,
  selectChatLoading,
  selectChatConnection,
} from '../redux/slices/chatSlice';
import * as chatApi from '../api/chatApi';

export const useChat = () => {
  const dispatch = useDispatch();

  const conversations = useSelector(selectConversations);
  const messagesByConversation = useSelector(selectMessagesByConversation);
  const unreadByConversation = useSelector(selectUnreadByConversation);
  const selectedConversationId = useSelector(selectSelectedConversationId);
  const typingByConversation = useSelector(selectTypingByConversation);
  const loading = useSelector(selectChatLoading);
  const connection = useSelector(selectChatConnection);

  const activeMessages = useMemo(
    () => messagesByConversation[selectedConversationId] || [],
    [messagesByConversation, selectedConversationId]
  );

  const loadChats = useCallback(() => dispatch(fetchChats()), [dispatch]);

  const loadMessages = useCallback(
    (chatId, params = {}) => dispatch(fetchMessages({ chatId, params })),
    [dispatch]
  );
  const selectConversation = useCallback(
    (id) => dispatch(setSelectedConversation(id)),
    [dispatch]
  );

  const deselectConversation = useCallback(
    () => dispatch(closeConversation()),
    [dispatch]
  );
  const sendMessage = useCallback(
    async (chatId, content, type = 'text') => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const tempMessage = {
        _id: tempId,
        tempId,
        chat: chatId,
        content,
        type,
        status: 'sending',
        createdAt: new Date().toISOString(),
        sender: { _id: 'self' },
      };
      dispatch(addOptimisticMessage({ conversationId: chatId, message: tempMessage }));

      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('message:send', {
          chatId,
          content,
          type,
          idempotencyKey: tempId,
        }, (ack) => {
          if (ack?.success) {
            dispatch(replaceOptimisticMessage({
              conversationId: chatId,
              tempId,
              realMessage: ack.message,
            }));
          } else {
            dispatch(markMessageFailed({ conversationId: chatId, messageId: tempId }));
          }
        });
      } else {
        try {
          const { data } = await chatApi.sendMessage(chatId, { content, type });
          dispatch(replaceOptimisticMessage({
            conversationId: chatId,
            tempId,
            realMessage: data.data,
          }));
        } catch {
          dispatch(markMessageFailed({ conversationId: chatId, messageId: tempId }));
        }
      }
    },
    [dispatch]
  );

  const editMessage = useCallback(
    async (chatId, msgId, content) => {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('message:edit', { chatId, messageId: msgId, content });
      } else {
        await chatApi.editMessage(chatId, msgId, { content });
      }
    },
    []
  );

  const reactToMessage = useCallback(
    (chatId, msgId, emoji) => {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('message:react', { chatId, messageId: msgId, emoji });
      } else {
        chatApi.toggleReaction(chatId, msgId, emoji);
      }
    },
    []
  );

  const startTyping = useCallback(
    (chatId) => {
      const socket = getSocket();
      if (socket?.connected) socket.emit('typing:start', { chatId });
    },
    []
  );

  const stopTyping = useCallback(
    (chatId) => {
      const socket = getSocket();
      if (socket?.connected) socket.emit('typing:stop', { chatId });
    },
    []
  );

  const markAsRead = useCallback(
    (chatId, messageIds = []) => {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('message:seen', { chatId, messageIds });
      } else {
        chatApi.markChatAsRead(chatId);
      }
    },
    []
  );

  const updateDraft = useCallback(
    (conversationId, text) => dispatch(setDraft({ conversationId, text })),
    [dispatch]
  );

  return {
    conversations,
    activeMessages,
    unreadByConversation,
    selectedConversationId,
    typingByConversation,
    loading,
    connection,
    loadChats,
    loadMessages,
    selectConversation,
    deselectConversation,
    sendMessage,
    editMessage,
    reactToMessage,
    startTyping,
    stopTyping,
    markAsRead,
    updateDraft,
  };
};

export default useChat;
