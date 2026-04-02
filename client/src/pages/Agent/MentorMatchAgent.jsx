import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AgentHeader from "../../components/agent/AgentHeader";
import AgentInputBar from "../../components/agent/AgentInputBar";
import AgentMessageList from "../../components/agent/AgentMessageList";
import { useAgent } from "../../contexts/AgentContext.jsx";

export default function MentorMatchAgent() {
  const navigate = useNavigate();
  const { addMessage } = useAgent();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState("initial"); // initial, interests, goals, result
  const [userProfile, setUserProfile] = useState({
    interests: [],
    goals: [],
  });
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome! I'm your Mentor Match agent. I'll help you find the perfect mentor based on your interests and goals. Let's get started! What are your main academic or professional interests?",
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

  const mentors = [
    {
      name: "Dr. Sarah Chen",
      expertise: ["Computer Science", "AI", "Machine Learning"],
      bio: "PhD in CS, 10+ years industry experience",
      specialization: "AI & ML",
      availability: "Weekends",
    },
    {
      name: "Prof. James Wilson",
      expertise: ["Business", "Entrepreneurship", "Leadership"],
      bio: "MBA, founded 2 successful startups",
      specialization: "Business & Startups",
      availability: "Evenings",
    },
    {
      name: "Dr. Amira Patel",
      expertise: ["Medicine", "Health Sciences", "Research"],
      bio: "MD, active researcher in medical field",
      specialization: "Healthcare & Medicine",
      availability: "Flexible",
    },
    {
      name: "Prof. Marcus Brown",
      expertise: ["Literature", "Writing", "Communications"],
      bio: "Published author and journalist",
      specialization: "Writing & Communications",
      availability: "Mornings",
    },
  ];

  const generateResponse = (text, currentStage) => {
    const lower = text.toLowerCase();

    if (currentStage === "initial") {
      setUserProfile((prev) => ({
        ...prev,
        interests: text,
      }));
      setStage("goals");
      return "That's great! So you're interested in " + text + ". Now, what are your specific goals? Are you looking for career guidance, academic improvement, skill development, or something else?";
    }

    if (currentStage === "goals") {
      setUserProfile((prev) => ({
        ...prev,
        goals: text,
      }));
      setStage("result");
      return "Perfect! Based on your interests in " + userProfile.interests + " and your goal of " + text + ", I've found some excellent mentors for you. Here are my top recommendations...";
    }

    return "That's helpful information. You can explore the mentor profiles below and send connection requests to those who match your interests!";
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
      const response = generateResponse(input, stage);
      const agentMessage = {
        id: Date.now() + 1,
        text: response,
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      addMessage(response, "agent");
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-background text-text-primary flex flex-col">
      {/* Header */}
      <AgentHeader
        title="Mentor Match"
        subtitle="Find your perfect mentor"
        onBack={() => navigate("/student/dashboard")}
        badge={<span className="text-lg">👥</span>}
        badgeClassName="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center"
      />

      {/* Messages Container */}
      <AgentMessageList
        messages={messages}
        isTyping={isTyping}
        endRef={messagesEndRef}
      >
        {stage === "result" && (
          <div className="mt-6 space-y-3">
            <p className="text-text-secondary text-sm font-semibold">Recommended Mentors:</p>
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="bg-surface border border-border rounded-lg p-4 hover:border-primary transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-text-primary">{mentor.name}</h3>
                    <p className="text-sm text-text-secondary">{mentor.specialization}</p>
                    <p className="text-xs text-text-secondary mt-1">{mentor.bio}</p>
                  </div>
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                    {mentor.availability}
                  </span>
                </div>
                <button className="mt-3 w-full bg-primary hover:bg-primary-hover text-white py-2 rounded transition text-sm">
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        )}
      </AgentMessageList>

      {/* Input Area */}
      {stage !== "result" && (
        <AgentInputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder="Type your response..."
          disabled={isTyping}
        />
      )}

      {stage === "result" && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-secondary">
            💡 Select a mentor above and click "Request Mentorship" to get started
          </p>
        </div>
      )}
    </div>
  );
}
