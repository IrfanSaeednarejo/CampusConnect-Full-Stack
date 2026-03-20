import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAgent } from "../../contexts/AgentContext.jsx";
import AgentHeader from "../../components/agent/AgentHeader";
import AgentInputBar from "../../components/agent/AgentInputBar";
import AgentMessageList from "../../components/agent/AgentMessageList";

export default function WellbeingAgent() {
  const navigate = useNavigate();
  const { addMessage } = useAgent();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [moodLevel, setMoodLevel] = useState(5);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! 💚 I'm here to support your mental health and wellbeing. How are you feeling today? Remember, it's okay to not be okay. I'm here to listen and help however I can.",
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

  const wellnessResponses = {
    stress:
      "Stress is common, especially during demanding times. Here are some helpful strategies: 1) Take deep breaths - try the 4-7-8 technique 2) Break tasks into smaller steps 3) Take short walks 4) Practice progressive muscle relaxation 5) Talk to someone you trust. Would you like me to guide you through a breathing exercise?",
    anxiety:
      "Anxiety can feel overwhelming, but there are proven techniques: 1) Grounding techniques - notice 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste 2) Progressive muscle relaxation 3) Journaling your thoughts 4) Limiting caffeine 5) Regular exercise. You're doing great by reaching out!",
    sleep:
      "Sleep is crucial for wellbeing. Tips: 1) Keep a consistent sleep schedule 2) Avoid screens 30 min before bed 3) Create a calm environment 4) Try relaxation techniques 5) Limit caffeine and heavy meals. If sleep issues persist, consider talking to a healthcare professional.",
    motivation:
      "Loss of motivation is valid. Let's help: 1) Break goals into tiny, achievable steps 2) Celebrate small wins 3) Find your 'why' - what really matters to you? 4) Try the 2-minute rule - just start for 2 minutes 5) Practice self-compassion. What would help motivate you right now?",
    academic:
      "Academic pressure can be intense. Remember: 1) Your grades don't define your worth 2) Seek help when struggling - tutors, professors, counselors 3) Prioritize self-care 4) Balance work with rest 5) Connect with peers. You're doing your best, and that's enough!",
    social:
      "Feeling isolated? These can help: 1) Reach out to one friend 2) Join clubs or groups matching your interests 3) Attend campus events 4) Practice self-compassion if socializing is hard 5) It's okay to need alone time too. Connection matters - you're not alone.",
  };

  const generateResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("stress") || lower.includes("overwhelmed")) return wellnessResponses.stress;
    if (lower.includes("anxiety") || lower.includes("nervous") || lower.includes("worry"))
      return wellnessResponses.anxiety;
    if (lower.includes("sleep") || lower.includes("tired") || lower.includes("insomnia"))
      return wellnessResponses.sleep;
    if (lower.includes("motivation") || lower.includes("unmotivated") || lower.includes("lazy"))
      return wellnessResponses.motivation;
    if (
      lower.includes("academic") ||
      lower.includes("grades") ||
      lower.includes("exam") ||
      lower.includes("study")
    )
      return wellnessResponses.academic;
    if (lower.includes("lonely") || lower.includes("isolated") || lower.includes("social"))
      return wellnessResponses.social;
    return "I hear you. What you're feeling is valid. Remember: 1) You're not alone 2) Seeking support is strength, not weakness 3) Small steps matter 4) You deserve care and compassion 5) It's okay to struggle. Would you like to talk more about what's on your mind?";
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

  const getMoodColor = (level) => {
    if (level <= 2) return "text-red-500";
    if (level <= 4) return "text-yellow-500";
    if (level <= 7) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <div className="h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Header */}
      <AgentHeader
        title="Wellbeing Support"
        subtitle="Your mental health companion"
        onBack={() => navigate("/student/dashboard")}
        badge={<Heart size={20} />}
        badgeClassName={`w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center ${getMoodColor(moodLevel)}`}
      />

      {/* Mood Check-In */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <label className="text-sm text-[#8b949e] whitespace-nowrap">
            How are you feeling?
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={moodLevel}
            onChange={(e) => setMoodLevel(Number(e.target.value))}
            className="flex-1"
          />
          <span className={`text-sm font-bold ${getMoodColor(moodLevel)}`}>
            {moodLevel}/10
          </span>
        </div>
        <p className="text-xs text-[#8b949e] mt-2">
          1 = Not great | 5 = Okay | 10 = Excellent
        </p>
      </div>

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
        placeholder="Share how you're feeling or what's on your mind..."
        disabled={isTyping}
        helperText="💚 This is a safe space. Tips: stress, anxiety, sleep, motivation, grades, social"
      />
    </div>
  );
}
