import api from './axios';

const BASE = '/societies';

export const getSocieties = (params = {}) => api.get(BASE, { params });
export const getSocietyById = (id) => api.get(`${BASE}/${id}`);
export const getSocietyStats = (id) => api.get(`${BASE}/${id}/stats`);
export const getSocietyMembers = (id, params = {}) => api.get(`${BASE}/${id}/members`, { params });
export const getMySocieties = (userId) => api.get(`/users/${userId}/societies`);

export const createSociety = (formData) => api.post(`${BASE}/create-society`, formData);
export const updateSociety = (id, formData) => api.patch(`${BASE}/update/${id}`, formData);
export const deleteSociety = (id) => api.delete(`${BASE}/delete/${id}`);

export const joinSociety = (id) => api.post(`${BASE}/${id}/join`);
export const leaveSociety = (id) => api.post(`${BASE}/${id}/leave`);

export const addMemberToSociety = (id, data) => api.post(`${BASE}/${id}/members/add`, data);
export const removeMemberFromSociety = (id, memberId) => api.delete(`${BASE}/${id}/members/remove/${memberId}`);
export const updateMemberRole = (id, memberId, data) => api.patch(`${BASE}/${id}/members/${memberId}/role`, data);
export const approveMember = (id, memberId) => api.patch(`${BASE}/${id}/members/${memberId}/approve`);
export const rejectMember = (id, memberId) => api.patch(`${BASE}/${id}/members/${memberId}/reject`);
