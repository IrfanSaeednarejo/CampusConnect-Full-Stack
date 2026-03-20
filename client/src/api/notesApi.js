import api from './axios';

/**
 * Notes API functions
 */

// Get all notes for user
export const getUserNotes = async (userId, filters = {}) => {
  try {
    const response = await api.get(`/users/${userId}/notes`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get note by ID
export const getNoteById = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new note
export const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update note
export const updateNote = async (noteId, noteData) => {
  try {
    const response = await api.patch(`/notes/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete note
export const deleteNote = async (noteId) => {
  try {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Share note with users
export const shareNote = async (noteId, userIds) => {
  try {
    const response = await api.post(`/notes/${noteId}/share`, { userIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get shared notes
export const getSharedNotes = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/notes/shared`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search notes
export const searchNotes = async (userId, query) => {
  try {
    const response = await api.get(`/users/${userId}/notes/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get tasks
export const getUserTasks = async (userId, filters = {}) => {
  try {
    const response = await api.get(`/users/${userId}/tasks`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.patch(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle task completion
export const toggleTaskCompletion = async (taskId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
