import React, { useState } from "react";
import { useAgent } from "@/contexts/AgentContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";

export default function WellbeingCheckin() {
  const { isActive, conversation, startAgent, stopAgent, addMessage, clearConversation } = useAgent();
  const { showSuccess, showInfo } = useNotification();
  const [mood, setMood] = useState(null);

  const moods = [
    { emoji: "😊", label: "Great", value: "great" },
    { emoji: "😌", label: "Good", value: "good" },
    { emoji: "😐", label: "Neutral", value: "neutral" },
    { emoji: "😟", label: "Stressed", value: "stressed" },
  ];

  const handleStartCheckin = () => {
    startAgent("wellbeing");
    addMessage("How are you feeling today? Let's check in on your wellbeing.", "agent");
    showSuccess("Wellbeing check-in started!");
  };

  const handleSelectMood = (selectedMood) => {
    setMood(selectedMood);
    const moodLabel = moods.find((m) => m.value === selectedMood)?.label || selectedMood;
    addMessage(moodLabel, "user");

    // Generate response based on mood
    setTimeout(() => {
      const responses = {
        great: "That's wonderful! Keep up the positive energy!",
        good: "Glad you're doing well! Remember to take breaks.",
        neutral: "That's okay. Maybe take a short walk or meditate?",
        stressed: "Let's help you manage stress. Try deep breathing or talk to a counselor.",
      };
      addMessage(responses[selectedMood], "agent");
      showSuccess("Thanks for sharing! Remember to take care of yourself.");
    }, 600);
  };

  if (!isActive) {
    return (
      <div className="p-4 border border-[#30363d] rounded-lg bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#c9d1d9] font-semibold mb-1">Wellbeing Check-in</h3>
            <p className="text-[#8b949e] text-sm">Take a moment to check your mental health.</p>
          </div>
          <button
            onClick={handleStartCheckin}
            className="px-4 py-2 bg-[#238636] text-white rounded-md text-sm font-medium hover:bg-[#2ea043] transition-colors"
          >
            Check In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-[#30363d] rounded-lg bg-[#161b22]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#c9d1d9] font-semibold">Wellbeing Check-in</h3>
        <button
          onClick={() => {
            stopAgent();
            clearConversation();
            setMood(null);
            showInfo("Check-in closed.");
          }}
          className="px-3 py-1 bg-[#da3633] text-white rounded text-xs font-medium hover:bg-[#f85149] transition-colors"
        >
          Close
        </button>
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
                  ? "bg-[#238636] text-white"
                  : "bg-[#30363d] text-[#c9d1d9]"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Mood Selection */}
      {!mood && (
        <div className="grid grid-cols-4 gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => handleSelectMood(m.value)}
              className="flex flex-col items-center gap-1 p-3 bg-[#0d1117] border border-[#30363d] rounded hover:border-[#238636] transition-colors"
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-[#8b949e]">{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Wellbeing Tips */}
      {mood && (
        <div className="mt-4 p-3 bg-[#0d1117] rounded border border-[#30363d]">
          <p className="text-[#c9d1d9] text-sm font-medium mb-2">Quick Tips:</p>
          <ul className="text-[#8b949e] text-xs space-y-1">
            <li>• Take regular breaks during study sessions</li>
            <li>• Practice 5-minute mindfulness or breathing exercises</li>
            <li>• Connect with friends and peers</li>
            <li>• Maintain a healthy sleep schedule</li>
            <li>• Reach out to campus counseling if needed</li>
          </ul>
        </div>
      )}
    </div>
  );
}
