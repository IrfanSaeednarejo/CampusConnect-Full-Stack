import React from 'react';
import AgentChatUI from '../../../components/agents/AgentChatUI';

export default function WellbeingAgentPage() {
  const agentConfig = {
    agentType: 'wellbeing',
    name: 'Wellbeing Support',
    subtitle: 'Your mental health and wellness companion',
    accentColor: 'green',
    icon: '🌱',
    welcomeMessage: "Hi there! 🌱 I'm your Wellbeing Support Assistant. This is a safe, judgment-free space. I'm here to listen and help with academic stress, anxiety, sleep, loneliness, or anything else on your mind. How are you feeling today?",
    suggestedStarters: [
      'I am feeling stressed about exams',
      'How do I deal with burnout?',
      'Tips for better sleep',
      'I feel lonely at university',
      'How to manage anxiety?',
    ],
  };

  return (
    <>
      <AgentChatUI agentConfig={agentConfig} />
    </>
  );
}
