export default function ChatMessage({ message, isOwn }) {
  return (
    <div className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-xs font-bold text-white">
            {message.avatar}
          </div>
        </div>
      )}
      <div
        className={`max-w-xs lg:max-w-md ${
          isOwn
            ? "bg-[#238636] text-white rounded-l-lg rounded-tr-lg"
            : "bg-[#161b22] text-[#c9d1d9] rounded-r-lg rounded-tl-lg"
        } px-4 py-2`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold text-[#79c0ff] mb-1">
            {message.author}
          </p>
        )}
        <p className="text-sm break-words">{message.message}</p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? "text-white/70" : "text-[#8b949e]"
          }`}
        >
          {message.timestamp}
        </p>
      </div>
      {isOwn && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-xs font-bold text-white">
            {message.avatar}
          </div>
        </div>
      )}
    </div>
  );
}
