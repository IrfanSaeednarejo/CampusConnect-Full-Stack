import api from './axios';

/**
 * Notification API functions
 */

// Get all notifications for user
export const getUserNotifications = async (userId, filters = {}) => {
  try {
    const response = await api.get(`/users/${userId}/notifications`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await api.patch(`/users/${userId}/notifications/read-all`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete all notifications
export const deleteAllNotifications = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/notifications`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get unread notification count
export const getUnreadCount = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/notifications/unread-count`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send notification (admin or system)
export const sendNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
