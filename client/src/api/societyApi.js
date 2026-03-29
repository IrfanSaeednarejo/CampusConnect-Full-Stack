import api from './axios';

/**
 * Society API functions
 */

// Get all societies
export const getAllSocieties = async (filters = {}) => {
  try {
    const response = await api.get('/societies', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get society by ID
export const getSocietyById = async (societyId) => {
  try {
    const response = await api.get(`/societies/${societyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new society
export const createSociety = async (societyData) => {
  try {
    const response = await api.post('/societies/create-society', societyData, {
      headers: societyData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update society
export const updateSociety = async (societyId, societyData) => {
  try {
    const response = await api.patch(`/societies/update/${societyId}`, societyData, {
      headers: societyData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete society
export const deleteSociety = async (societyId) => {
  try {
    const response = await api.delete(`/societies/delete/${societyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Join society
export const joinSociety = async (societyId) => {
  try {
    const response = await api.post(`/societies/${societyId}/join`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Leave society
export const leaveSociety = async (societyId) => {
  try {
    const response = await api.post(`/societies/${societyId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get society members
export const getSocietyMembers = async (societyId, params = {}) => {
  try {
    const response = await api.get(`/societies/${societyId}/members`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get society events
export const getSocietyEvents = async (societyId) => {
  try {
    const response = await api.get(`/societies/${societyId}/events`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's societies
export const getUserSocieties = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/societies`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get member requests (society head only) — uses the /members endpoint with status=pending
export const getMemberRequests = async (societyId) => {
  try {
    const response = await api.get(`/societies/${societyId}/members`, { params: { status: 'pending' } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve member request
export const approveMemberRequest = async (societyId, requestId) => {
  try {
    const response = await api.post(`/societies/${societyId}/member-requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject member request
export const rejectMemberRequest = async (societyId, requestId) => {
  try {
    const response = await api.post(`/societies/${societyId}/member-requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve society member (real backend endpoint)
export const approveSocietyMember = async (societyId, memberId) => {
  try {
    const response = await api.patch(`/societies/${societyId}/members/${memberId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject society member (real backend endpoint)
export const rejectSocietyMember = async (societyId, memberId) => {
  try {
    const response = await api.patch(`/societies/${societyId}/members/${memberId}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get society analytics (society head only)
export const getSocietyAnalytics = async (societyId) => {
  try {
    const response = await api.get(`/societies/${societyId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search societies
export const searchSocieties = async (query, filters = {}) => {
  try {
    const response = await api.get('/societies/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
