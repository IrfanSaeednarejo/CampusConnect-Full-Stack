import React from 'react';
import AgentChatUI from '../../../components/agents/AgentChatUI';

export default function FeedbackAgentPage() {
  const agentConfig = {
    agentType: 'feedback',
    name: 'Feedback Portal',
    subtitle: 'Share your campus experience anonymously',
    accentColor: 'orange',
    icon: '📝',
    welcomeMessage: "Welcome to the CampusConnect Feedback Portal! 📝 Your feedback is completely anonymous and helps us improve campus life at IBA Sukkur. What would you like to give feedback about?",
    suggestedStarters: [
      'Give feedback on a course',
      'Rate a faculty member',
      'Feedback on campus facilities',
      'Share thoughts on student societies',
      'Feedback on this app',
    ],
  };

  return (
    <>
      <AgentChatUI agentConfig={agentConfig} />
    </>
  );
}
