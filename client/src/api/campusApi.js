import api from './axios';

const BASE = '/campuses';

export const getAllCampuses = (params = {}) =>
  api.get(BASE, { params });

export const getCampusById = (id) =>
  api.get(`${BASE}/id/${id}`);

export const getCampusBySlug = (slug) =>
  api.get(`${BASE}/${slug}`);

export const createCampus = (formData) =>
  api.post(BASE, formData);

export const updateCampus = (slug, data) =>
  api.patch(`${BASE}/${slug}`, data);

export const deleteCampus = (slug) =>
  api.delete(`${BASE}/${slug}`);

export const updateCampusStatus = (slug, data) =>
  api.patch(`${BASE}/${slug}/status`, data);

export const assignCampusAdmin = (slug, data) =>
  api.patch(`${BASE}/${slug}/admin`, data);

export const removeCampusAdmin = (slug, data) =>
  api.delete(`${BASE}/${slug}/admin`, { data });

export const updateCampusLogo = (slug, formData) =>
  api.patch(`${BASE}/${slug}/logo`, formData);

export const updateCampusCoverImage = (slug, formData) =>
  api.patch(`${BASE}/${slug}/cover`, formData);

export const getCampusStats = (slug) =>
  api.get(`${BASE}/${slug}/stats`);

export const getCampusUsers = (slug, params = {}) =>
  api.get(`${BASE}/${slug}/users`, { params });

export const getCampusSocieties = (slug, params = {}) =>
  api.get(`${BASE}/${slug}/societies`, { params });

export const getFacilitiesList = () =>
  api.get(`${BASE}/facilities`);
