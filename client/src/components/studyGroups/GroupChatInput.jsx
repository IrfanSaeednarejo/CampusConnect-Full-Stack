export default function GroupChatInput({ message, setMessage, onSend }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-[#30363d] bg-[#0d1117] p-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 px-4 py-3 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] focus:border-[#238636] focus:outline-none focus:ring-1 focus:ring-[#238636] transition-colors resize-none"
            rows={2}
          />
          <button
            onClick={onSend}
            className="px-6 py-3 rounded-lg bg-[#238636] text-white font-semibold hover:bg-[#2ea043] transition-colors flex items-center gap-2 self-end flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
