import api from './axios';

const BASE = '/study-groups';
export const getStudyGroups = (params = {}) =>
  api.get(BASE, { params });

export const getMyStudyGroups = () =>
  api.get(`${BASE}/my`);

export const getStudyGroupById = (id) =>
  api.get(`${BASE}/${id}`);

export const createStudyGroup = (data) =>
  api.post(BASE, data);

export const updateStudyGroup = (id, data) =>
  api.patch(`${BASE}/${id}`, data);

export const deleteStudyGroup = (id) =>
  api.delete(`${BASE}/${id}`);

export const archiveStudyGroup = (id) =>
  api.patch(`${BASE}/${id}/archive`);


export const joinStudyGroup = (id) =>
  api.post(`${BASE}/${id}/join`);

export const leaveStudyGroup = (id) =>
  api.post(`${BASE}/${id}/leave`);

export const removeMember = (id, memberId) =>
  api.delete(`${BASE}/${id}/members/${memberId}`);

export const updateMemberRole = (id, memberId, data) =>
  api.patch(`${BASE}/${id}/members/${memberId}/role`, data);


export const getResources = (id) =>
  api.get(`${BASE}/${id}/resources`);

export const addResource = (id, formData) =>
  api.post(`${BASE}/${id}/resources`, formData);

export const removeResource = (id, resourceId) =>
  api.delete(`${BASE}/${id}/resources/${resourceId}`);


export const updateSchedule = (id, data) =>
  api.put(`${BASE}/${id}/schedule`, data);
