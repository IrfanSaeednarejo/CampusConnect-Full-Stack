import api from './axios';

export const getNetworkState = () => api.get('/network/state');
export const getSuggestedMembers = (limit = 10) => api.get('/network/suggested', { params: { limit } });
export const sendConnectionRequest = (targetUserId) => api.post('/network/request', { targetUserId });
export const respondToConnectionRequest = (connectionId, action) => api.patch(`/network/request/${connectionId}/respond`, { action });
export const cancelConnectionRequest = (connectionId) => api.delete(`/network/request/${connectionId}/cancel`);
export const removeConnection = (connectionId) => api.delete(`/network/${connectionId}`);
