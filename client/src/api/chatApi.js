import api from './axios';

export const getMyChats = () =>
  api.get('/chats');

export const createOrGetDM = (participantId) =>
  api.post('/chats/dm', { participantId });

export const getChatById = (chatId) =>
  api.get(`/chats/${chatId}`);

export const updateGroupChat = (chatId, data) =>
  api.patch(`/chats/${chatId}`, data);

export const markChatAsRead = (chatId) =>
  api.patch(`/chats/${chatId}/read`);

export const addMemberToChat = (chatId, userId) =>
  api.post(`/chats/${chatId}/members`, { userId });

export const removeMemberFromChat = (chatId, userId) =>
  api.delete(`/chats/${chatId}/members/${userId}`);

export const getChatMessages = (chatId, params = {}) =>
  api.get(`/chats/${chatId}/messages`, { params });

export const sendMessage = (chatId, data) =>
  api.post(`/chats/${chatId}/messages`, data);

export const editMessage = (chatId, msgId, data) =>
  api.patch(`/chats/${chatId}/messages/${msgId}`, data);

export const deleteMessage = (chatId, msgId) =>
  api.delete(`/chats/${chatId}/messages/${msgId}`);

export const toggleReaction = (chatId, msgId, emoji) =>
  api.post(`/chats/${chatId}/messages/${msgId}/react`, { emoji });
