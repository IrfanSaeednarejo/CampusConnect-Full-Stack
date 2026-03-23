import api from './axios';

/**
 * Mentoring API functions
 */

// Get all mentors
export const getAllMentors = async (filters = {}) => {
  try {
    const response = await api.get('/mentors', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mentor by ID
export const getMentorById = async (mentorId) => {
  try {
    const response = await api.get(`/mentors/${mentorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Apply to become a mentor
export const applyAsMentor = async (applicationData) => {
  try {
    const response = await api.post('/mentors/apply', applicationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update mentor profile
export const updateMentorProfile = async (mentorId, profileData) => {
  try {
    const response = await api.patch(`/mentors/${mentorId}`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mentor availability
export const getMentorAvailability = async (mentorId) => {
  try {
    const response = await api.get(`/mentors/${mentorId}/availability`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Set mentor availability
export const setMentorAvailability = async (mentorId, availabilityData) => {
  try {
    const response = await api.post(`/mentors/${mentorId}/availability`, availabilityData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Book mentoring session
export const bookSession = async (mentorId, sessionData) => {
  try {
    const response = await api.post(`/mentors/${mentorId}/sessions`, sessionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mentoring sessions (for student or mentor)
export const getMentoringSessions = async (userId, role = 'student') => {
  try {
    const endpoint = role === 'mentor' ? `/mentors/${userId}/sessions` : `/users/${userId}/sessions`;
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel mentoring session
export const cancelSession = async (sessionId, reason) => {
  try {
    const response = await api.patch(`/sessions/${sessionId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Complete mentoring session
export const completeSession = async (sessionId) => {
  try {
    const response = await api.patch(`/sessions/${sessionId}/complete`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Submit session feedback
export const submitSessionFeedback = async (sessionId, feedbackData) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mentor reviews
export const getMentorReviews = async (mentorId) => {
  try {
    const response = await api.get(`/mentors/${mentorId}/reviews`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mentor earnings
export const getMentorEarnings = async (mentorId) => {
  try {
    const response = await api.get(`/mentors/${mentorId}/earnings`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Request payout
export const requestPayout = async (mentorId, amount) => {
  try {
    const response = await api.post(`/mentors/${mentorId}/payout`, { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search mentors
export const searchMentors = async (query, filters = {}) => {
  try {
    const response = await api.get('/mentors/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
