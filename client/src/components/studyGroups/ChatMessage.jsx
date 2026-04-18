export default function ChatMessage({ message, isOwn }) {
  const initials = message.author ? message.author[0].toUpperCase() : "?";

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0 mt-1">
        {message.avatar ? (
          <img 
            src={message.avatar} 
            alt={message.author} 
            className="w-8 h-8 rounded-full object-cover border border-[#30363d]" 
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-[10px] font-bold text-white uppercase border border-[#238636]/50">
            {initials}
          </div>
        )}
      </div>

      <div className="flex flex-col max-w-[80%]">
        {!isOwn && (
          <span className="text-[11px] font-bold text-[#8b949e] mb-1 ml-1 uppercase tracking-wider">
            {message.author}
          </span>
        )}
        
        <div
          className={`px-4 py-2.5 shadow-sm ${
            isOwn
              ? "bg-[#238636] text-white rounded-2xl rounded-tr-none"
              : "bg-[#1c2128] text-[#c9d1d9] border border-[#30363d] rounded-2xl rounded-tl-none"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
          <div
            className={`text-[10px] mt-1.5 flex items-center gap-1 ${
              isOwn ? "text-white/70 justify-end" : "text-[#8b949e] justify-start"
            }`}
          >
            <span>{message.timestamp}</span>
            {isOwn && <span className="material-symbols-outlined text-[12px]">done_all</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
