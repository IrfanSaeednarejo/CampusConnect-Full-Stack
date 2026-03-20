import api from './axios';

/**
 * AI Agent API functions
 */

// Send message to Study Assistant Agent
export const sendToStudyAssistant = async (message, context = {}) => {
  try {
    const response = await api.post('/agents/study-assistant', { message, context });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send message to Mentor Match Agent
export const sendToMentorMatch = async (message, preferences = {}) => {
  try {
    const response = await api.post('/agents/mentor-match', { message, preferences });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send message to Wellbeing Agent
export const sendToWellbeingAgent = async (message, mood = null) => {
  try {
    const response = await api.post('/agents/wellbeing', { message, mood });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send message to Feedback Agent
export const sendToFeedbackAgent = async (message, feedbackType = 'general') => {
  try {
    const response = await api.post('/agents/feedback', { message, feedbackType });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get agent conversation history
export const getAgentConversationHistory = async (userId, agentType) => {
  try {
    const response = await api.get(`/agents/${agentType}/history/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Clear agent conversation history
export const clearAgentHistory = async (userId, agentType) => {
  try {
    const response = await api.delete(`/agents/${agentType}/history/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get AI recommendations
export const getAIRecommendations = async (userId, type = 'general') => {
  try {
    const response = await api.get(`/agents/recommendations/${userId}`, {
      params: { type },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Submit feedback on AI response
export const submitAIFeedback = async (messageId, feedback) => {
  try {
    const response = await api.post(`/agents/feedback/response/${messageId}`, feedback);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
