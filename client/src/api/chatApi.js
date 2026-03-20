import api from './axios';

/**
 * Chat API functions
 */

// Get user's conversations
export const getUserConversations = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/conversations`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get conversation by ID
export const getConversationById = async (conversationId) => {
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get conversation messages
export const getConversationMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send message
export const sendMessage = async (conversationId, messageData) => {
  try {
    const response = await api.post(`/conversations/${conversationId}/messages`, messageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new conversation
export const createConversation = async (participantIds) => {
  try {
    const response = await api.post('/conversations', { participants: participantIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete conversation
export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await api.patch(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get group chats
export const getGroupChats = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/group-chats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create group chat
export const createGroupChat = async (groupData) => {
  try {
    const response = await api.post('/group-chats', groupData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add member to group chat
export const addGroupMember = async (groupId, userId) => {
  try {
    const response = await api.post(`/group-chats/${groupId}/members`, { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove member from group chat
export const removeGroupMember = async (groupId, userId) => {
  try {
    const response = await api.delete(`/group-chats/${groupId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Upload file to conversation
export const uploadChatFile = async (conversationId, formData) => {
  try {
    const response = await api.post(`/conversations/${conversationId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
