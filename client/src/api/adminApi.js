import api from './axios';

/**
 * Admin API functions — aligned with backend /api/v1/admin/* endpoints
 */

// ────────────── PLATFORM STATS ──────────────
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// ────────────── USER MANAGEMENT ──────────────
export const getAllUsers = async (page = 1, limit = 20, filters = {}) => {
  const response = await api.get('/admin/users', {
    params: { page, limit, ...filters },
  });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserRoles = async (userId, roles) => {
  const response = await api.patch(`/admin/users/${userId}/roles`, { roles });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const suspendUser = async (userId, reason) => {
  const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
  return response.data;
};

export const unsuspendUser = async (userId) => {
  const response = await api.post(`/admin/users/${userId}/unsuspend`);
  return response.data;
};

// ────────────── MENTOR VERIFICATION ──────────────
export const getPendingMentorApplications = async () => {
  const response = await api.get('/admin/mentor-applications/pending');
  return response.data;
};

export const approveMentorApplication = async (userId) => {
  const response = await api.post(`/admin/mentor-applications/${userId}/approve`);
  return response.data;
};

export const rejectMentorApplication = async (userId, reason) => {
  const response = await api.post(`/admin/mentor-applications/${userId}/reject`, { reason });
  return response.data;
};

// ────────────── SOCIETY HEAD VERIFICATION ──────────────
export const getPendingSocietyHeadApplications = async () => {
  const response = await api.get('/admin/society-head-applications/pending');
  return response.data;
};

export const approveSocietyHeadApplication = async (userId) => {
  const response = await api.post(`/admin/society-head-applications/${userId}/approve`);
  return response.data;
};

export const rejectSocietyHeadApplication = async (userId, reason) => {
  const response = await api.post(`/admin/society-head-applications/${userId}/reject`, { reason });
  return response.data;
};

// ────────────── SOCIETY OVERSIGHT ──────────────
export const getAdminSocieties = async (page = 1, limit = 20, search = '') => {
  const response = await api.get('/admin/societies', {
    params: { page, limit, search },
  });
  return response.data;
};

export const deleteAdminSociety = async (societyId) => {
  const response = await api.delete(`/admin/societies/${societyId}`);
  return response.data;
};
