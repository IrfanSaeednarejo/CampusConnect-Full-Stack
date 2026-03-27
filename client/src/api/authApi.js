import api from './axios';

export const register = (formData) =>
  api.post('/users/register', formData);

export const login = (credentials) =>
  api.post('/users/login', credentials);

export const logout = () =>
  api.post('/users/logout');

export const refreshToken = () =>
  api.post('/users/refresh-token');

export const checkAuth = () =>
  api.get('/users/current-user');

export const sendVerificationEmail = () =>
  api.post('/users/send-verification-email');

export const verifyEmail = (token) =>
  api.get(`/users/verify-email/${token}`);

export const forgotPassword = (email) =>
  api.post('/users/forgot-password', { email });

export const resetPassword = (token, data) =>
  api.post(`/users/reset-password/${token}`, data);

export const changePassword = (data) =>
  api.patch('/users/change-password', data);
