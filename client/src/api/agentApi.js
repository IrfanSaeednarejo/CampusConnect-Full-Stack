import api from './axios';

export const askAI = (data) => api.post('/ai/ask', data);
