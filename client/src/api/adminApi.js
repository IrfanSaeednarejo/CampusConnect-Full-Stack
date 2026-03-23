import api from './axios';

/**
 * Admin API functions
 */

// Get all users (with pagination and filters)
export const getAllUsers = async (page = 1, limit = 20, filters = {}) => {
  try {
    const response = await api.get('/admin/users', {
      params: { page, limit, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user by ID (admin view)
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user (admin)
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete user (admin)
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Suspend user
export const suspendUser = async (userId, reason, duration) => {
  try {
    const response = await api.post(`/admin/users/${userId}/suspend`, { reason, duration });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unsuspend user
export const unsuspendUser = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/unsuspend`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get pending mentor applications
export const getPendingMentorApplications = async () => {
  try {
    const response = await api.get('/admin/mentor-applications/pending');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve mentor application
export const approveMentorApplication = async (applicationId) => {
  try {
    const response = await api.post(`/admin/mentor-applications/${applicationId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject mentor application
export const rejectMentorApplication = async (applicationId, reason) => {
  try {
    const response = await api.post(`/admin/mentor-applications/${applicationId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get pending society approvals
export const getPendingSocietyApprovals = async () => {
  try {
    const response = await api.get('/admin/societies/pending');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve society
export const approveSociety = async (societyId) => {
  try {
    const response = await api.post(`/admin/societies/${societyId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject society
export const rejectSociety = async (societyId, reason) => {
  try {
    const response = await api.post(`/admin/societies/${societyId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get system analytics
export const getSystemAnalytics = async (period = '30d') => {
  try {
    const response = await api.get('/admin/analytics', {
      params: { period },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get system health
export const getSystemHealth = async () => {
  try {
    const response = await api.get('/admin/system/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get system logs
export const getSystemLogs = async (page = 1, limit = 50, filters = {}) => {
  try {
    const response = await api.get('/admin/logs', {
      params: { page, limit, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Export reports
export const exportReports = async (reportType, filters = {}) => {
  try {
    const response = await api.get(`/admin/reports/export/${reportType}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get content moderation queue
export const getModerationQueue = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/admin/moderation/queue', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Moderate content
export const moderateContent = async (contentId, action, reason) => {
  try {
    const response = await api.post(`/admin/moderation/${contentId}`, { action, reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get disputes
export const getDisputes = async (status = 'pending') => {
  try {
    const response = await api.get('/admin/disputes', {
      params: { status },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Resolve dispute
export const resolveDispute = async (disputeId, resolution) => {
  try {
    const response = await api.post(`/admin/disputes/${disputeId}/resolve`, resolution);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
