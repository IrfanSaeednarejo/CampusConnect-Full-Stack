import api from './axios';

const BASE = '/admin';

export const getAllUsers = (params = {}) =>
  api.get(`${BASE}/users`, { params });

export const updateUserRole = (data) =>
  api.patch(`${BASE}/users/role`, data);

export const toggleUserSuspension = (userId) =>
  api.patch(`${BASE}/users/${userId}/suspend`);

export const getPendingSocieties = () =>
  api.get(`${BASE}/societies/pending`);

export const approveSociety = (societyId) =>
  api.patch(`/societies/${societyId}/approve`); // Society controller handles this

export const rejectSociety = (societyId) =>
  api.patch(`/societies/${societyId}/reject`); // Society controller handles this
