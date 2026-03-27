import api from './axios';

const BASE = '/files';

export const uploadFile = (formData) =>
  api.post(`${BASE}/upload`, formData);

export const getFiles = (params = {}) =>
  api.get(BASE, { params });

export const getFileById = (fileId) =>
  api.get(`${BASE}/${fileId}`);

export const deleteFile = (fileId) =>
  api.delete(`${BASE}/${fileId}`);
