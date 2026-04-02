import React from 'react';
import AgentChatUI from '../../../components/agents/AgentChatUI';

export default function MentorAgentPage() {
  const agentConfig = {
    agentType: 'mentor',
    name: 'Mentor Assistant',
    subtitle: 'Career guidance and professional growth',
    accentColor: 'purple',
    icon: '🎯',
    welcomeMessage: "Hello! 🎯 I'm your Career Mentor Assistant. I can help you with career planning, resume writing, interview preparation, LinkedIn optimization, and navigating the job market in Pakistan and beyond. What would you like guidance on?",
    suggestedStarters: [
      'How do I find a good mentor?',
      'Tips for interview preparation',
      'How to write a strong resume?',
      'How to use LinkedIn effectively?',
      'Help me plan my career path',
    ],
  };

  return (
    <>
      <AgentChatUI agentConfig={agentConfig} />
    </>
  );
}
