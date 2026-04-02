import React from 'react';
import AgentChatUI from '../../../components/agents/AgentChatUI';

export default function StudyAgentPage() {
  const agentConfig = {
    agentType: 'study',
    name: 'Study Assistant',
    subtitle: 'Your personal academic coach',
    accentColor: 'blue',
    icon: '📚',
    welcomeMessage: "Hi there! 👋 I'm your Study Assistant. I can help you create study schedules, prepare for exams, improve your productivity, and develop effective learning strategies. What would you like to work on today?",
    suggestedStarters: [
      'How do I create a study schedule?',
      'Help me prepare for exams',
      'What is the Pomodoro technique?',
      'How can I improve my focus?',
      'Best note-taking methods?',
    ],
  };

  return (
    <>
      <AgentChatUI agentConfig={agentConfig} />
    </>
  );
}
