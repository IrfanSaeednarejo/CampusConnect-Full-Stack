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
      <div className="p-4 border border-[#30363d] rounded-lg bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#c9d1d9] font-semibold mb-1">Share Your Feedback</h3>
            <p className="text-[#8b949e] text-sm">Help us improve your experience.</p>
          </div>
          <button
            onClick={handleActivateFeedback}
            className="px-4 py-2 bg-[#238636] text-white rounded-md text-sm font-medium hover:bg-[#2ea043] transition-colors"
          >
            Share Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-[#30363d] rounded-lg bg-[#161b22]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#c9d1d9] font-semibold">Feedback</h3>
        <button
          onClick={() => stopAgent()}
          className="px-3 py-1 bg-[#da3633] text-white rounded text-xs font-medium hover:bg-[#f85149] transition-colors"
        >
          Close
        </button>
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Tell us what you think..."
        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm placeholder:text-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#238636] min-h-[100px] resize-none"
      />

      <button
        onClick={handleSubmitFeedback}
        className="mt-3 px-4 py-2 bg-[#238636] text-white rounded-md text-sm font-medium hover:bg-[#2ea043] transition-colors w-full"
      >
        Submit Feedback
      </button>
    </div>
  );
}
