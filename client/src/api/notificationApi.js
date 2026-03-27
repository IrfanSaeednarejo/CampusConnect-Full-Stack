import api from './axios';

const BASE = '/notifications';

export const getMyNotifications = (params = {}) =>
  api.get(BASE, { params });

export const getUnreadCount = () =>
  api.get(`${BASE}/unread-count`);

export const markAsRead = (id) =>
  api.patch(`${BASE}/${id}/read`);

export const markAllAsRead = () =>
  api.patch(`${BASE}/read-all`);

export const deleteNotification = (id) =>
  api.delete(`${BASE}/${id}`);
