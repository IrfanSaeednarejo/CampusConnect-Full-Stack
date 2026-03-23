import api from './axios';

/**
 * Authentication API functions
 */

// User login
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// User signup/registration
export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify email with token
export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Refresh access token
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
