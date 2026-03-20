import api from './axios';

/**
 * User API functions
 */

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.patch(`/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Upload user avatar
export const uploadAvatar = async (userId, formData) => {
  try {
    const response = await api.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete user account
export const deleteUserAccount = async (userId, password) => {
  try {
    const response = await api.delete(`/users/${userId}`, {
      data: { password },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user settings
export const getUserSettings = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/settings`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user settings
export const updateUserSettings = async (userId, settings) => {
  try {
    const response = await api.patch(`/users/${userId}/settings`, settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user notifications preferences
export const getNotificationPreferences = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/notification-preferences`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const response = await api.patch(`/users/${userId}/notification-preferences`, preferences);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user privacy settings
export const getPrivacySettings = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/privacy-settings`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (userId, settings) => {
  try {
    const response = await api.patch(`/users/${userId}/privacy-settings`, settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search users
export const searchUsers = async (query, filters = {}) => {
  try {
    const response = await api.get('/users/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all users (admin only)
export const getAllUsers = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/users', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Complete onboarding
export const completeOnboarding = async (userId, onboardingData) => {
  try {
    const response = await api.post(`/users/${userId}/complete-onboarding`, onboardingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
