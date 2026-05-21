import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Avatar from "../../components/common/Avatar";
import IconButton from "../../components/common/IconButton";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

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
  const isDark = useHomeTheme();
  const [activeConversation, setActiveConversation] = useState(1);
  const [messageInput, setMessageInput] = useState("");

  const currentConversation = CONVERSATIONS.find((c) => c.id === activeConversation);

  return (
    <div className={`flex h-screen w-full ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
      <Sidebar />

      <div className={`flex w-full max-w-sm flex-col border-r ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-surface-light"}`}>
        <div className={`border-b p-4 ${isDark ? "border-border-dark" : "border-border-light"}`}>
          <h2 className={`text-xl font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>Messages</h2>
        </div>
        <div className="p-4">
          <label className="flex w-full flex-col">
            <div className="flex h-10 w-full flex-1 items-stretch rounded-lg">
              <div className={`flex items-center justify-center rounded-l-lg border border-r-0 pl-3 ${isDark ? "border-border-dark bg-surface-dark text-text-secondary-dark" : "border-border-light bg-surface-muted text-text-secondary-light"}`}>
                <span className="material-symbols-outlined text-lg">search</span>
              </div>
              <input
                className={`form-input flex h-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border-none pl-2 text-sm font-normal focus:outline-0 focus:ring-0 ${
                  isDark
                    ? "bg-surface-dark text-text-primary-dark placeholder:text-text-secondary-dark"
                    : "bg-surface-muted text-text-primary-light placeholder:text-text-secondary-light"
                }`}
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
              className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-3 transition-colors ${
                activeConversation === conv.id
                  ? isDark
                    ? "border-l-4 border-primary bg-surface-dark"
                    : "border-l-4 border-primary bg-primary/5"
                  : isDark
                    ? "hover:bg-surface-dark"
                    : "hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="aspect-square h-12 w-12 rounded-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${conv.image}")` }}
                  />
                  {conv.isOnline && (
                    <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success border-2 ${isDark ? "border-surface-dark" : "border-white"}`}></span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`truncate text-base font-medium ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{conv.name}</p>
                  <p className={`truncate text-sm font-normal ${conv.unread ? "font-medium text-primary" : isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {conv.unread ? (
                  <div className="flex h-6 w-6 items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                ) : (
                  <p className={`text-xs font-normal ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{conv.lastMessageTime}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className={`flex flex-1 flex-col ${isDark ? "bg-surface-dark" : "bg-surface-light"}`}>
        <header className={`flex items-center justify-between border-b p-4 ${isDark ? "border-border-dark" : "border-border-light"}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={currentConversation.image} size="10" />
              {currentConversation.isOnline && (
                <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success border-2 ${isDark ? "border-surface-dark" : "border-white"}`}></span>
              )}
            </div>
            <div className="flex flex-col">
              <a className={`text-base font-bold leading-normal hover:underline ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`} href="#">
                {currentConversation.name}
              </a>
              <p className={`text-sm font-normal ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                {currentConversation.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <IconButton icon="more_horiz" label="Conversation options" variant="ghost" size="sm" />
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <p className={`text-center text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            You started this conversation. Today at 9:15 AM
          </p>
          {MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar
                src={
                  msg.isOwn
                    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAoxLTTrXW-T5H3x-Jgzydn8t8XdyIJVagvsz7DlvZWrAckYGstaVyVVaHHHQleF3-MjQlf_ktrpP45InsJAHYfslBxVuraB3fAqZ78QYauEpxaQEkDDfGRAIyW2qzy7dGFQFZ3Ru97bJX2LRoIngCZWDrCx-ctVur2wvuN0qIClxG5B9ceUOLkBEDHBKVANqfd8HsJwTyOA7I5VB2kdlDuud7SNAu1FwQKy4sxesPWeAApiK4QbpcqijACDfzapHYW5fQIzsDUA2o"
                    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBVPRlwN0iWS-QE9DbJbb4QcJ3MXFDiur8e8YkPE1mj3Sw8Qzb5z-uKZW0IK4YxJo6m0xj8NAhuRP0Z7u0LK3xzZ86dd7vVDE-SuKiqnamJDsWiqD_0Es70ODY56NZkpfT8Xr4aol-5HEB7cgObFFaPbiAruKOTmVYsWSY-gNH-8HjDG4K2ljbB4PgMji9VKoWz5n7T_ehfMrPnn5PTfRn7JbmC1QB0KdHzkReTyiL4xUy8X72qaz4B97ugBJEQuS8J6HHedlmVd3c"
                }
                size="8"
              />
              <div className={`flex max-w-lg flex-col gap-1 ${msg.isOwn ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-xl p-3 ${
                    msg.isOwn
                      ? "rounded-tr-sm bg-primary text-white"
                      : isDark
                        ? "rounded-tl-sm bg-background-dark text-text-primary-dark"
                        : "rounded-tl-sm bg-surface-muted text-text-primary-light"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        <footer className={`border-t p-4 ${isDark ? "border-border-dark" : "border-border-light"}`}>
          <div className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${isDark ? "border-border-dark bg-background-dark focus-within:border-primary" : "border-border-light bg-surface-muted focus-within:border-primary"}`}>
            <IconButton icon="add_reaction" label="Add reaction" variant="ghost" size="sm" />
            <IconButton icon="attach_file" label="Attach file" variant="ghost" size="sm" />
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className={`flex-1 border-none bg-transparent text-sm focus:ring-0 ${isDark ? "text-text-primary-dark placeholder:text-text-secondary-dark" : "text-text-primary-light placeholder:text-text-secondary-light"}`}
              placeholder="Type a message..."
            />
            <button className={getButtonClassName({ variant: "primary", size: "iconSm" })}>
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
