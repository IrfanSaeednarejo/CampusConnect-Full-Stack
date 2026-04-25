import api from './axios';

export const sendMessage = (data) => api.post('/nexus/chat', data);
export const startConversation = () => api.post('/nexus/conversations');
export const getConversations = (params) => api.get('/nexus/conversations', { params });
export const getConversation = (id) => api.get(`/nexus/conversations/${id}`);
export const deleteConversation = (id) => api.delete(`/nexus/conversations/${id}`);
export const getActionLog = (params) => api.get('/nexus/actions', { params });
