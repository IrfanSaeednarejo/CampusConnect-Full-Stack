import api from './axios';

export const notesApi = {
  // Get all notes
  getAll: async () => {
    const response = await api.get('/notes');
    return response.data;
  },

  // Upload a new note
  upload: async (payload) => {
    const response = await api.post('/notes', payload);
    return response.data;
  },

  // Delete a note
  delete: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },

  // Toggle share status
  toggleShare: async (noteId) => {
    const response = await api.patch(`/notes/${noteId}/share`);
    return response.data;
  },

  // Increment download count
  incrementDownload: async (noteId) => {
    const response = await api.patch(`/notes/${noteId}/download`);
    return response.data;
  }
};
