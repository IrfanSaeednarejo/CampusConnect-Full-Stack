import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAgent } from "../../contexts/AgentContext.jsx";
import AgentHeader from "../../components/agent/AgentHeader";
import AgentInputBar from "../../components/agent/AgentInputBar";
import AgentMessageList from "../../components/agent/AgentMessageList";

export default function StudyAssistantAgent() {
  const navigate = useNavigate();
  const { addMessage } = useAgent();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your Study Assistant. I can help you with concepts, explain topics, suggest study strategies, and answer questions. What would you like to learn about today?",
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

  const agentResponses = {
    math: "Great question about math! Here are some key concepts: 1) Break down complex problems into smaller parts 2) Practice regularly with varied problems 3) Understand the 'why' behind formulas, not just memorize. Would you like help with a specific math topic?",
    physics:
      "Physics is fascinating! Key tips: 1) Understand the fundamentals and principles 2) Draw diagrams to visualize concepts 3) Practice problem-solving with real-world examples 4) Group concepts together. What area of physics interests you?",
    chemistry:
      "Chemistry requires understanding both theory and practice. Tips: 1) Master the periodic table basics 2) Understand bonding and molecular structures 3) Practice balancing equations 4) Use models and visualizations. What's your focus area?",
    study:
      "Effective study strategies: 1) Active recall - test yourself frequently 2) Spaced repetition - review over time 3) Pomodoro technique - 25 min study, 5 min break 4) Teach concepts to others 5) Create mind maps. Which technique would you like to try?",
    exam:
      "Exam preparation tips: 1) Start early - don't cram! 2) Review past papers 3) Create study guides 4) Form study groups 5) Practice under timed conditions 6) Get enough sleep before the exam. What subject are you preparing for?",
  };

  const generateResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("math") || lower.includes("algebra") || lower.includes("calculus"))
      return agentResponses.math;
    if (lower.includes("physics") || lower.includes("force") || lower.includes("energy"))
      return agentResponses.physics;
    if (lower.includes("chemistry") || lower.includes("reaction") || lower.includes("element"))
      return agentResponses.chemistry;
    if (lower.includes("study") || lower.includes("learn") || lower.includes("improve"))
      return agentResponses.study;
    if (lower.includes("exam") || lower.includes("test") || lower.includes("prepare"))
      return agentResponses.exam;
    return "That's a great question! Based on what you're asking, I'd suggest: 1) Break it down into smaller parts 2) Create a study plan 3) Practice with examples 4) Review regularly. Can you provide more specific details?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    addMessage(input, "user");
    setInput("");

    // Simulate agent typing
    setIsTyping(true);
    setTimeout(() => {
      const agentMessage = {
        id: Date.now() + 1,
        text: generateResponse(input),
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      addMessage(agentMessage.text, "agent");
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Header */}
      <AgentHeader
        title="Study Assistant"
        subtitle="AI-powered study helper"
        onBack={() => navigate("/student/dashboard")}
        badge={<span className="text-lg">📚</span>}
        badgeClassName="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
      />

      {/* Messages Container */}
      <AgentMessageList
        messages={messages}
        isTyping={isTyping}
        endRef={messagesEndRef}
      />

      {/* Input Area */}
      <AgentInputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder="Ask a question or describe what you want to learn..."
        disabled={isTyping}
        helperText="💡 Tip: Ask about any subject, study strategies, or exam preparation"
      />
    </div>
  );
}
