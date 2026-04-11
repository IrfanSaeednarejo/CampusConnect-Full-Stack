export default function AgentMessageList({
  messages,
  isTyping,
  endRef,
  className = "",
  children,
}) {
  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
              msg.sender === "user"
                ? "bg-primary text-white rounded-br-none"
                : "bg-surface text-text-primary border border-border rounded-bl-none"
            }`}
          >
            <p className="text-sm break-words">{msg.text}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {msg.timestamp?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-surface border border-border px-4 py-3 rounded-lg rounded-bl-none">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#475569] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#475569] rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-[#475569] rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}

      {children}
      <div ref={endRef} />
    </div>
  );
}
