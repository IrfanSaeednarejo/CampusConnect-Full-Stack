import api from './axios';

/**
 * Study Group API functions
 */

// Get all study groups
export const getAllStudyGroups = async (filters = {}) => {
  try {
    const response = await api.get('/study-groups', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get study group by ID
export const getStudyGroupById = async (groupId) => {
  try {
    const response = await api.get(`/study-groups/${groupId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new study group
export const createStudyGroup = async (groupData) => {
  try {
    const response = await api.post('/study-groups', groupData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update study group
export const updateStudyGroup = async (groupId, groupData) => {
  try {
    const response = await api.patch(`/study-groups/${groupId}`, groupData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete study group
export const deleteStudyGroup = async (groupId) => {
  try {
    const response = await api.delete(`/study-groups/${groupId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Join study group
export const joinStudyGroup = async (groupId) => {
  try {
    const response = await api.post(`/study-groups/${groupId}/join`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Leave study group
export const leaveStudyGroup = async (groupId) => {
  try {
    const response = await api.delete(`/study-groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get study group members
export const getStudyGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/study-groups/${groupId}/members`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get study group resources
export const getStudyGroupResources = async (groupId) => {
  try {
    const response = await api.get(`/study-groups/${groupId}/resources`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Upload resource to study group
export const uploadResource = async (groupId, formData) => {
  try {
    const response = await api.post(`/study-groups/${groupId}/resources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete resource
export const deleteResource = async (groupId, resourceId) => {
  try {
    const response = await api.delete(`/study-groups/${groupId}/resources/${resourceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get study group discussions
export const getStudyGroupDiscussions = async (groupId) => {
  try {
    const response = await api.get(`/study-groups/${groupId}/discussions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Post discussion message
export const postDiscussionMessage = async (groupId, message) => {
  try {
    const response = await api.post(`/study-groups/${groupId}/discussions`, { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search study groups
export const searchStudyGroups = async (query, filters = {}) => {
  try {
    const response = await api.get('/study-groups/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
