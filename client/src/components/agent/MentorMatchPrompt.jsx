import React, { useState } from "react";
import { useAgent } from "@/contexts/AgentContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";

export default function MentorMatchPrompt() {
  const { isActive, conversation, startAgent, stopAgent, addMessage, clearConversation } = useAgent();
  const { showSuccess, showError, showInfo } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);

  const questions = [
    "What subjects do you need help with?",
    "What are your learning goals?",
    "How many hours per week can you study?",
  ];

  const handleStartMatching = () => {
    startAgent("mentoring");
    addMessage("Let's find the perfect mentor for you! I'll ask a few questions.", "agent");
    addMessage(questions[0], "agent");
    setCurrentStep(0);
    showSuccess("Mentor matching started!");
  };

  const handleAnswerQuestion = (answer) => {
    addMessage(answer, "user");
    setCurrentStep(currentStep + 1);

    if (currentStep + 1 < questions.length) {
      setTimeout(() => {
        addMessage(questions[currentStep + 1], "agent");
      }, 600);
    } else {
      setTimeout(() => {
        addMessage(
          "Perfect! I've found 3 great mentors for you based on your needs. Check the Mentors page to connect!",
          "agent"
        );
        showSuccess("Mentors matched! Check the Mentors section.");
      }, 600);
    }
  };

  if (!isActive) {
    return (
      <div className="p-4 border border-border rounded-lg bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-text-primary font-semibold mb-1">Find Your Mentor</h3>
            <p className="text-text-secondary text-sm">AI-powered mentor matching for your needs.</p>
          </div>
          <button
            onClick={handleStartMatching}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Find Mentor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-semibold">Mentor Matching</h3>
        <button
          onClick={() => {
            stopAgent();
            clearConversation();
            setCurrentStep(0);
            showInfo("Mentor matching closed.");
          }}
          className="px-3 py-1 bg-danger text-white rounded text-xs font-medium hover:bg-[#f85149] transition-colors"
        >
          Close
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4 text-xs text-text-secondary">
        Question {currentStep + 1} of {questions.length}
      </div>

      {/* Conversation */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.sender === "user"
                  ? "bg-primary text-white"
                  : "bg-[#30363d] text-text-primary"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Answer Buttons */}
      {currentStep < questions.length && (
        <div className="space-y-2">
          {currentStep === 0 && (
            <>
              <button
                onClick={() => handleAnswerQuestion("Computer Science and Mathematics")}
                className="w-full px-3 py-2 text-left bg-background border border-border rounded text-text-primary text-sm hover:border-primary transition-colors"
              >
                Computer Science &amp; Math
              </button>
              <button
                onClick={() => handleAnswerQuestion("Physics and Chemistry")}
                className="w-full px-3 py-2 text-left bg-background border border-border rounded text-text-primary text-sm hover:border-primary transition-colors"
              >
                Physics &amp; Chemistry
              </button>
            </>
          )}
          {currentStep === 1 && (
            <>
              <button
                onClick={() => handleAnswerQuestion("Improve my grades and understand concepts better")}
                className="w-full px-3 py-2 text-left bg-background border border-border rounded text-text-primary text-sm hover:border-primary transition-colors"
              >
                Improve grades
              </button>
              <button
                onClick={() => handleAnswerQuestion("Prepare for exams and competitions")}
                className="w-full px-3 py-2 text-left bg-background border border-border rounded text-text-primary text-sm hover:border-primary transition-colors"
              >
                Exam preparation
              </button>
            </>
          )}
          {currentStep === 2 && (
            <>
              <button
                onClick={() => handleAnswerQuestion("5-10 hours per week")}
                className="w-full px-3 py-2 text-left bg-background border border-border rounded text-text-primary text-sm hover:border-primary transition-colors"
              >
                5-10 hours
              </button>
              <button
                onClick={() => handleAnswerQuestion("10+ hours per week")}
                className="w-full px-3 py-2 text-left bg-background border border-border rounded text-text-primary text-sm hover:border-primary transition-colors"
              >
                10+ hours
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
