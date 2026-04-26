import api from './axios';

export const sendMessage       = (data)         => api.post('/nexus/chat', data);
export const startConversation = ()             => api.post('/nexus/conversations');
export const getConversations  = (params)       => api.get('/nexus/conversations', { params });
export const getConversation   = (id)           => api.get(`/nexus/conversations/${id}`);
export const deleteConversation= (id)           => api.delete(`/nexus/conversations/${id}`);
export const getActionLog      = (params)       => api.get('/nexus/actions', { params });
export const generateDraft     = (data)         => api.post('/nexus/draft', data);

// ── Post AI Assist ────────────────────────────────────────────────────────────
export const aiDraftPost       = (topic, tone)  => api.post('/nexus/post/draft',    { topic, tone });
export const aiImprovePost     = (body, tone)   => api.post('/nexus/post/improve',  { body, tone });
export const aiSuggestHashtags = (body)         => api.post('/nexus/post/hashtags', { body });
export const aiGeneratePoll    = (question)     => api.post('/nexus/post/poll',     { question });
export const aiModeratePost    = (body)         => api.post('/nexus/post/moderate', { body });
