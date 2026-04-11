import React, { useState } from "react";
import { useAgent } from "@/contexts/AgentContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";

export default function FeedbackPrompt() {
  const { isActive, startAgent, stopAgent, addMessage } = useAgent();
  const { showSuccess, showError } = useNotification();
  const [feedback, setFeedback] = useState("");

  const handleActivateFeedback = () => {
    startAgent("feedback");
    addMessage("Feedback mode activated. Share your thoughts and I'll help improve your learning experience.", "agent");
    showSuccess("Feedback mode activated!");
  };

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      showError("Please enter your feedback.");
      return;
    }

    addMessage(feedback, "user");
    setFeedback("");

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "Thank you for your feedback! This helps us improve your learning experience.",
        "I appreciate your input. Your feedback is valuable for our continuous improvement.",
        "Got it! I'll take your feedback into consideration for better personalization.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, "agent");
    }, 600);

    showSuccess("Feedback submitted!");
  };

  if (!isActive) {
    return (
      <div className="p-4 border border-border rounded-lg bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-text-primary font-semibold mb-1">Share Your Feedback</h3>
            <p className="text-text-secondary text-sm">Help us improve your experience.</p>
          </div>
          <button
            onClick={handleActivateFeedback}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Share Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-semibold">Feedback</h3>
        <button
          onClick={() => stopAgent()}
          className="px-3 py-1 bg-danger text-white rounded text-xs font-medium hover:bg-[#DC2626] transition-colors"
        >
          Close
        </button>
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Tell us what you think..."
        className="w-full px-3 py-2 bg-background border border-border rounded text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
      />

      <button
        onClick={handleSubmitFeedback}
        className="mt-3 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors w-full"
      >
        Submit Feedback
      </button>
    </div>
  );
}
