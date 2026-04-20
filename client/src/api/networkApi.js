import api from './axios';

export const getNetworkState = () => api.get('/network/state');
export const getSuggestedMembers = (limit = 10) => api.get('/network/suggested', { params: { limit } });
export const getMutualConnections = (targetUserId, limit = 3) => api.get(`/network/mutual/${targetUserId}`, { params: { limit } });
export const getConnectionStatus = (targetUserId) => api.get(`/network/status/${targetUserId}`);
export const sendConnectionRequest = (targetUserId) => api.post('/network/request', { targetUserId });
export const respondToConnectionRequest = (connectionId, action) => api.patch(`/network/request/${connectionId}/respond`, { action });
export const cancelConnectionRequest = (connectionId) => api.delete(`/network/request/${connectionId}/cancel`);
export const removeConnection = (connectionId) => api.delete(`/network/${connectionId}`);
