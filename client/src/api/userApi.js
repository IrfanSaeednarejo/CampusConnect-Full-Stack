import api from './axios';

export const getCurrentUser = () => api.get('/users/current-user');
export const getUserProfile = (userId) => api.get(`/users/profile/${userId}`);
export const updateAccount = (data) => api.patch('/users/update-account', data);
export const updateAcademic = (data) => api.patch('/users/update-academic', data);
export const updatePreferences = (data) => api.patch('/users/update-preferences', data);
export const updateSocialLinks = (socialLinks) => api.patch('/users/update-social-links', { socialLinks });
export const updateInterests = (interests) => api.patch('/users/update-interests', { interests });
export const updateAvatar = (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return api.patch('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const updateCoverImage = (file) => {
  const fd = new FormData();
  fd.append('coverImage', file);
  return api.patch('/users/cover-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const changePassword = (data) => api.patch('/users/change-password', data);
export const deleteAccount = (password) => api.delete('/users/delete-account', { data: { password } });
export const sendVerificationEmail = () => api.post('/users/send-verification-email');
export const searchUsers = (q, page = 1, limit = 20) => api.get('/users/search', { params: { q, page, limit } });
export const getMySocieties = () => api.get('/users/me/societies');
export const updateOnboarding = (data) => api.patch('/users/update-onboarding', data);
