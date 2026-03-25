import api from './axios';

export const getUserProfile = (userId) =>
  api.get(`/users/profile/${userId}`);

export const changePassword = (data) =>
  api.patch('/users/change-password', data);

export const updateAccountDetails = (data) =>
  api.patch('/users/update-account', data);

export const updateAcademicInfo = (data) =>
  api.patch('/users/update-academic', data);

export const updatePreferences = (data) =>
  api.patch('/users/update-preferences', data);

export const updateSocialLinks = (socialLinks) =>
  api.patch('/users/update-social-links', { socialLinks });

export const updateInterests = (interests) =>
  api.patch('/users/update-interests', { interests });

export const updateAvatar = (formData) =>
  api.patch('/users/avatar', formData);

export const updateCoverImage = (formData) =>
  api.patch('/users/cover-image', formData);

export const deleteAccount = (data) =>
  api.delete('/users/delete-account', { data });

export const searchUsers = (params) =>
  api.get('/users/search', { params });

export const getUserSocieties = (userId) =>
  api.get(userId ? `/users/${userId}/societies` : '/users/me/societies');
