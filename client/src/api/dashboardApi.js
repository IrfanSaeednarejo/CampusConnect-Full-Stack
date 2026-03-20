import api from './axios';

/**
 * Dashboard API functions
 */

// Get student dashboard data
export const getStudentDashboard = async (userId) => {
  try {
    const response = await api.get(`/dashboard/student/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mentor dashboard data
export const getMentorDashboard = async (userId) => {
  try {
    const response = await api.get(`/dashboard/mentor/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get society dashboard data
export const getSocietyDashboard = async (userId) => {
  try {
    const response = await api.get(`/dashboard/society/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get admin dashboard data
export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/dashboard/admin');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get dashboard statistics
export const getDashboardStats = async (userId, role) => {
  try {
    const response = await api.get(`/dashboard/${role}/${userId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get recent activity
export const getRecentActivity = async (userId, limit = 10) => {
  try {
    const response = await api.get(`/users/${userId}/activity`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
