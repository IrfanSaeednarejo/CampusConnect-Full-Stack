import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Avatar from "../../components/common/Avatar";

const CONVERSATIONS = [
    {
      id: 1,
      name: "Dr. Eleanor Vance",
      role: "Mentor",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAdf4p9Oa3sUtHU97_JrIHfi9U9en2p8eAg82AiEya3YUsg1nvhRaz27B_VPRCn65q9PVw1svI8WYHurayOAJf8MDgDbyS1ABF1HSHTbZ_cY0RPaVXz-5SqTyTjrnEwpJNufCQfKHzD0ivJYHfcpjHk-LcfbV-66j0j3aAiRHo8-i77Qpn-hDfdfNQ3sGw5Y5Ph8hzkSAcW9JvbfOnRIyX86Vp97wo9VQ63YIhJ2stI8tO_67MfdTciNcq7p2z3S628JTiCbPfV-iA",
      lastMessage: "Sounds good, I'll review it t...",
      lastMessageTime: "10:42 AM",
      isOnline: true,
      unread: false,
    },
    {
      id: 2,
      name: "CS Study Group",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDIq99hp2zdix3NgnES42V1J4sd-QDrkPRIMTOP5h-ePBhMnHv6_uVswBSpAdQkWG4r3X8D6hKPISk8dhnx0K3hrSlE1C_VCY1UqX2ZR4w56RYaTAOA2xlFKdc1VATtnp0OhAtFwSL7Q7a0o2FLfNSao-cEoUpoGNsCokGfFchox3tsG8VEVu_C4bSG9FtTDWiWd34jR44aULFxtabbrxfYKrDnmph-uCnaWyPUc0Mk2DgQWRwi3lJ66oGkvEDZcOItiWmI08GuEeI",
      lastMessage: "You: Don't forget the deadline...",
      lastMessageTime: "",
      isOnline: false,
      unread: true,
    },
    {
      id: 3,
      name: "Maria Garcia",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBI9EO31qKnUUeET_RGFA6VXCaVUdJ0ipJARSlIpL9Zi3wg8kHaF2FF1YNvx4XvnR5V9pBz914-zjjGbWc5ljHuJIdwv2EDT4pml2QV5MjFxMM_1ie_kIw6TunmXontttd94SCBCCHE2Y8oOJhtapmMNu5dZ5zeTG3lMiX1HPvL4uzZl4DoOyEjHKZMTrDHh7VEJ6DmT-lwLx656wI3FCbKXVnhuYR3zkRLGDmftG9JiRlz_W7CG5O-UPoaL7_9BGsJ_HMyU1BckLE",
      lastMessage: "Can we reschedule our meeting...",
      lastMessageTime: "Yesterday",
      isOnline: false,
      unread: false,
    },
    {
      id: 4,
      name: "John Doe",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCN0YuVJj6qvP6MoEEOJSKSXZJDYtFsKQDs9-NuTj0tXxG5Tx_8wC8pjkPDCdqswfuCmJdlS62K9Te6ttY6JDCoiLK9N2BOkcp96cDgGDunhecQhasspDv9Oabl2lRXci7WkpdRdBdmIZZz9tNNaAHJniDc7Wgm2_4E-ahguFys3po0nkUsFUUS6M8exmNqQz9k0Msr8FMZrUPB0pQnaMW0MUSxVgCIHVGV2OEhup8uu7wwm8P5yBPc8AIcHu9b8WZ1bycnFB7CdHk",
      lastMessage: "Perfect, thank you!",
      lastMessageTime: "Sun",
      isOnline: false,
      unread: false,
    },
  ];

const MESSAGES = [
  {
    id: 1,
    sender: "Dr. Eleanor Vance",
    content:
      "Hi Alex, I've received your project proposal. It looks promising. Could you elaborate on the methodology section?",
    timestamp: "9:18 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content:
      "Of course, Dr. Vance. I'm planning to use a mixed-methods approach, combining quantitative surveys with qualitative interviews to get a comprehensive view. I can send over a more detailed outline.",
    timestamp: "9:25 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Dr. Eleanor Vance",
    content:
      "Sounds good, I'll review it this afternoon. Let's schedule a brief meeting for tomorrow to discuss it further.",
    timestamp: "10:42 AM",
    isOwn: false,
  },
];

export default function DirectMessages() {
  const [activeConversation, setActiveConversation] = useState(1);
  const [messageInput, setMessageInput] = useState("");

  const currentConversation = CONVERSATIONS.find(
    (c) => c.id === activeConversation,
  );

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Unified Sidebar */}
      <Sidebar />

      {/* Conversations List */}
      <div className="flex w-full max-w-sm flex-col border-r border-border bg-background">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">Messages</h2>
        </div>
        <div className="p-4">
          <label className="flex flex-col w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-10">
              <div className="text-text-secondary flex bg-surface items-center justify-center pl-3 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-lg">
                  search
                </span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-primary focus:outline-0 focus:ring-0 border-none bg-surface h-full placeholder:text-text-secondary pl-2 text-sm font-normal"
                placeholder="Search messages or users"
              />
            </div>
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`flex items-center gap-4 px-4 py-3 justify-between cursor-pointer transition-colors ${
                activeConversation === conv.id
                  ? "bg-surface border-l-4 border-primary"
                  : "hover:bg-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12"
                    style={{ backgroundImage: `url("${conv.image}")` }}
                  />
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-[#0bda43] border-2 border-[#161b22]"></span>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-text-primary text-base font-medium leading-normal truncate">
                    {conv.name}
                  </p>
                  <p
                    className={`text-sm font-normal leading-normal truncate ${
                      conv.unread
                        ? "text-primary font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {conv.unread ? (
                  <div className="flex size-6 items-center justify-center">
                    <div className="size-2 rounded-full bg-primary"></div>
                  </div>
                ) : (
                  <p className="text-text-secondary text-xs font-normal">
                    {conv.lastMessageTime}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <main className="flex flex-1 flex-col bg-surface">
        {/* Chat Header */}
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                src={currentConversation.image}
                size="10"
              />
              {currentConversation.isOnline && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-[#0bda43] border-2 border-[#161b22]"></span>
              )}
            </div>
            <div className="flex flex-col">
              <a
                className="text-text-primary text-base font-bold leading-normal hover:underline"
                href="#"
              >
                {currentConversation.name}
              </a>
              <p className="text-text-secondary text-sm font-normal">
                {currentConversation.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <button className="text-text-secondary p-2 rounded-lg hover:bg-background transition-colors">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-center text-xs text-text-secondary">
            You started this conversation. Today at 9:15 AM
          </p>
          {MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}
            >
              <Avatar
                src={msg.isOwn
                  ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoxLTTrXW-T5H3x-Jgzydn8t8XdyIJVagvsz7DlvZWrAckYGstaVyVVaHHHQleF3-MjQlf_ktrpP45InsJAHYfslBxVuraB3fAqZ78QYauEpxaQEkDDfGRAIyW2qzy7dGFQFZ3Ru97bJX2LRoIngCZWDrCx-ctVur2wvuN0qIClxG5B9ceUOLkBEDHBKVANqfd8HsJwTyOA7I5VB2kdlDuud7SNAu1FwQKy4sxesPWeAApiK4QbpcqijACDfzapHYW5fQIzsDUA2o'
                  : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVPRlwN0iWS-QE9DbJbb4QcJ3MXFDiur8e8YkPE1mj3Sw8Qzb5z-uKZW0IK4YxJo6m0xj8NAhuRP0Z7u0LK3xzZ86dd7vVDE-SuKiqnamJDsWiqD_0Es70ODY56NZkpfT8Xr4aol-5HEB7cgObFFaPbiAruKOTmVYsWSY-gNH-8HjDG4K2ljbB4PgMji9VKoWz5n7T_ehfMrPnn5PTfRn7JbmC1QB0KdHzkReTyiL4xUy8X72qaz4B97ugBJEQuS8J6HHedlmVd3c'}
                size="8"
              />
              <div
                className={`flex flex-col items-${msg.isOwn ? "end" : "start"} gap-1 max-w-lg`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    msg.isOwn
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-background text-text-primary rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className="text-xs text-text-secondary">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <footer className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-background rounded-lg p-2 border border-border focus-within:border-primary transition-colors">
            <button className="text-text-secondary p-2 rounded-lg hover:bg-surface transition-colors">
              <span className="material-symbols-outlined">add_reaction</span>
            </button>
            <button className="text-text-secondary p-2 rounded-lg hover:bg-surface transition-colors">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary border-none focus:ring-0 text-sm"
              placeholder="Type a message..."
            />
            <button className="flex items-center justify-center size-8 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
