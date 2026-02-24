import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAgent } from "../../contexts/AgentContext.jsx";
import AgentHeader from "../../components/agent/AgentHeader";
import AgentInputBar from "../../components/agent/AgentInputBar";
import AgentMessageList from "../../components/agent/AgentMessageList";

export default function FeedbackAgent() {
  const navigate = useNavigate();
  const { addMessage } = useAgent();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState("category"); // category, details, rating, complete
  const [feedback, setFeedback] = useState({
    category: "",
    details: "",
    rating: 0,
  });
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to Feedback Portal! Your feedback helps us improve. What area would you like to provide feedback about? (e.g., Platform, Features, User Experience, Performance, Other)",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const feedbackPrompts = {
    category:
      "Thanks! Now please describe your feedback in detail. What specific issue or suggestion do you have?",
    details:
      "Great feedback! Now, on a scale of 1-10, how satisfied are you with the overall platform? (1 = Very Dissatisfied, 10 = Very Satisfied)",
    rating:
      "Thank you for the detailed feedback! We really appreciate it. Is there anything else you'd like to add?",
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    addMessage(input, "user");
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      let nextStage = stage;
      let agentResponse = "";

      if (stage === "category") {
        setFeedback((prev) => ({ ...prev, category: input }));
        nextStage = "details";
        agentResponse = feedbackPrompts.category;
      } else if (stage === "details") {
        setFeedback((prev) => ({ ...prev, details: input }));
        nextStage = "rating";
        agentResponse = feedbackPrompts.rating;
      } else if (stage === "rating") {
        const ratingMatch = input.match(/\d+/);
        const rating = ratingMatch ? parseInt(ratingMatch[0]) : 5;
        setFeedback((prev) => ({ ...prev, rating: Math.min(10, Math.max(1, rating)) }));
        nextStage = "complete";
        agentResponse =
          "Perfect! Your feedback has been recorded. Thank you so much for helping us improve. Your input is invaluable! 🎉";
      }

      setStage(nextStage);
      const agentMessage = {
        id: Date.now() + 1,
        text: agentResponse,
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      addMessage(agentResponse, "agent");
      setIsTyping(false);
    }, 1200);
  };

  const handleRating = (rate) => {
    setFeedback((prev) => ({ ...prev, rating: rate }));
  };

  return (
    <div className="h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Header */}
      <AgentHeader
        title="Feedback Portal"
        subtitle="Help us improve the platform"
        onBack={() => navigate("/student/dashboard")}
        badge={<span className="text-lg">📝</span>}
        badgeClassName="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center"
      />

      {/* Progress Bar */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-[#8b949e] mb-2">
          <span>Progress</span>
          <span>
            {stage === "complete" ? 4 : stage === "rating" ? 3 : stage === "details" ? 2 : 1}/4
          </span>
        </div>
        <div className="w-full bg-[#161b22] rounded-full h-2">
          <div
            className="bg-[#238636] h-2 rounded-full transition-all duration-300"
            style={{
              width: `${stage === "complete" ? 100 : stage === "rating" ? 75 : stage === "details" ? 50 : 25}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Messages Container */}
      <AgentMessageList
        messages={messages}
        isTyping={isTyping}
        endRef={messagesEndRef}
      >
        {stage === "complete" && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-[#238636] rounded-lg p-4 rounded-bl-none">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="text-[#238636] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#238636]">Thank you!</h3>
                  <p className="text-sm text-[#c9d1d9] mt-1">
                    Your feedback has been successfully submitted. We'll use it to continue improving
                    the platform.
                  </p>
                  <div className="mt-3 bg-[#0d1117] rounded p-3 text-xs">
                    <p className="text-[#8b949e]">📊 Your feedback summary:</p>
                    <p className="text-[#c9d1d9] mt-2">
                      <strong>Category:</strong> {feedback.category}
                    </p>
                    <p className="text-[#c9d1d9] mt-1">
                      <strong>Rating:</strong> {feedback.rating}/10
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AgentMessageList>

      {/* Input Area */}
      {stage !== "complete" && (
        <div className="p-4 border-t border-[#30363d]">
          {stage === "rating" && (
            <div className="mb-4">
              <p className="text-sm text-[#8b949e] mb-2">Select a rating:</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      handleRating(rate);
                      setTimeout(() => {
                        const msg = {
                          id: Date.now(),
                          text: rate.toString(),
                          sender: "user",
                          timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, msg]);
                        setIsTyping(true);
                        setTimeout(() => {
                          setStage("complete");
                          const agentMsg = {
                            id: Date.now() + 1,
                            text: "Perfect! Your feedback has been recorded. Thank you so much for helping us improve. Your input is invaluable! 🎉",
                            sender: "agent",
                            timestamp: new Date(),
                          };
                          setMessages((prev) => [...prev, agentMsg]);
                          setIsTyping(false);
                        }, 1200);
                      }, 300);
                    }}
                    className={`px-3 py-2 rounded text-sm font-bold transition ${
                      feedback.rating === rate
                        ? "bg-[#238636] text-white"
                        : "bg-[#161b22] border border-[#30363d] text-[#c9d1d9] hover:border-[#238636]"
                    }`}
                  >
                    {rate}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AgentInputBar
            value={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder={
              stage === "rating"
                ? "Or type a number (1-10)..."
                : "Type your response..."
            }
            disabled={isTyping}
            containerClassName="p-0 border-0"
          />
        </div>
      )}

      {stage === "complete" && (
        <div className="p-4 border-t border-[#30363d] text-center">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
