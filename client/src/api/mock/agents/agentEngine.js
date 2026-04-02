import axiosInstance from '../../axios';
import { SYSTEM_PROMPTS } from './systemPrompts';

// Temporary fallback messages
const FALLBACK_MESSAGES = {
  study: "I'm having trouble connecting right now. Please try again in a moment! Quick tip while you wait: try writing down the 3 most important things you need to study today.",
  mentor: "I'm temporarily unavailable. Please try again shortly. Quick action: open LinkedIn and update your headline while you wait — it takes 2 minutes and makes a big difference!",
  wellbeing: "I'm having a brief connection issue. Please try again. While you wait, try this: take 3 slow deep breaths. Breathe in for 4 counts, hold for 4, out for 4. 💙",
  feedback: "I'm temporarily unavailable. Please try again in a moment. Your feedback is important to us!",
};

export const getAgentResponse = async (agentType, userMessage, conversationHistory) => {
  const systemPrompt = SYSTEM_PROMPTS[agentType];
  if (!systemPrompt) {
    return { message: "Unknown agent type.", followUps: [] };
  }

  // Determine provider from frontend env if set, else backend defaults to gemini
  const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';

  try {
    const response = await axiosInstance.post('/ai/chat', {
      provider,
      systemPrompt,
      userMessage,
      history: conversationHistory
    });

    return { message: response.data.data.response, followUps: [] };
  } catch (error) {
    console.error(`[AgentEngine] Backend API error:`, error);
    return {
      message: FALLBACK_MESSAGES[agentType] || FALLBACK_MESSAGES.study,
      followUps: [],
      isError: true,
      errorDetail: error.message || String(error),
    };
  }
};
