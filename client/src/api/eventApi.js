import api from './axios';

/**
 * Event API functions
 */

// Get all events
export const getAllEvents = async (filters = {}) => {
  try {
    const response = await api.get('/events', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.patch(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete event
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Register for event
export const registerForEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unregister from event
export const unregisterFromEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get event attendees
export const getEventAttendees = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/attendees`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's registered events
export const getUserEvents = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/events`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get upcoming events
export const getUpcomingEvents = async (limit = 10) => {
  try {
    const response = await api.get('/events/upcoming', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search events
export const searchEvents = async (query, filters = {}) => {
  try {
    const response = await api.get('/events/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
