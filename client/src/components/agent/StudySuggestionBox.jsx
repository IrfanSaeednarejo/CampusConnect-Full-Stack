import React, { useEffect } from "react";
import { useAgent } from "@/contexts/AgentContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";

export default function StudySuggestionBox() {
  const { isActive, currentMode, conversation, startAgent, stopAgent, addMessage, clearConversation } = useAgent();
  const { showSuccess, showError, showInfo } = useNotification();

  const isStudyMode = isActive && currentMode === "study";

  const handleActivateStudyAgent = () => {
    startAgent("study");
    addMessage("Study mode activated. Ask me about study materials, exam prep, or learning resources!", "agent");
    showSuccess("Study Agent activated!");
  };

  const handleDeactivate = () => {
    stopAgent();
    clearConversation();
    showInfo("Study Agent deactivated.");
  };

  const handleSendMessage = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const userMessage = e.target.value;
      addMessage(userMessage, "user");
      
      // Simulate agent response
      setTimeout(() => {
        const suggestions = [
          "Consider breaking down the topic into smaller subtopics for better understanding.",
          "Try the Pomodoro technique for focused study sessions.",
          "Review your notes from last week to reinforce learning.",
          "Group study with peers can help clarify difficult concepts.",
          "Use active recall by testing yourself on the material.",
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        addMessage(randomSuggestion, "agent");
      }, 800);
      
      e.target.value = "";
    }
  };

  if (!isStudyMode) {
    return (
      <div className="flex items-center justify-center p-6 border border-border rounded-lg bg-surface gap-4">
        <div className="flex-1">
          <h3 className="text-text-primary font-semibold mb-2">Study Suggestions</h3>
          <p className="text-text-secondary text-sm">Get AI-powered study recommendations tailored to your subjects.</p>
        </div>
        <button
          onClick={handleActivateStudyAgent}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Activate
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-surface">
      <div className="flex items-center justify-between">
        <h3 className="text-text-primary font-semibold">Study Agent</h3>
        <button
          onClick={handleDeactivate}
          className="px-3 py-1 bg-danger text-white rounded text-xs font-medium hover:bg-[#DC2626] transition-colors"
        >
          Deactivate
        </button>
      </div>

      {/* Conversation History */}
      <div className="h-64 overflow-y-auto bg-background rounded p-3 space-y-3 border border-border">
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary text-sm">
            Start a conversation with your Study Agent
          </div>
        ) : (
          conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-[#C7D2FE] text-text-primary"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <input
        type="text"
        placeholder="Ask your study question..."
        onKeyPress={handleSendMessage}
        className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
