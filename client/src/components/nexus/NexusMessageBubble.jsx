import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NexusActionCard from './NexusActionCard';

function NexusAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3fb950] to-[#238636] flex items-center justify-center shrink-0 text-sm font-bold text-white shadow-md shadow-green-500/20">
      N
    </div>
  );
}

export default function NexusMessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-none bg-[#238636] text-white shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          <span className="text-[10px] opacity-60 mt-1 block text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5">
      <NexusAvatar />
      <div className="max-w-[80%]">
        <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-[#161b22] border border-[#30363d] shadow-sm">
          <div className="text-sm text-[#e6edf3] leading-relaxed prose prose-invert prose-sm max-w-none
            [&_strong]:text-[#3fb950] [&_code]:text-[#f97316] [&_code]:bg-[#0d1117] [&_code]:px-1 [&_code]:rounded
            [&_a]:text-[#58a6ff] [&_a:hover]:underline
            [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-1
            [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          <span className="text-[10px] text-[#8b949e] mt-1.5 block">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {message.intent && message.actionTaken && (
          <NexusActionCard intent={message.intent} actionTaken={message.actionTaken} />
        )}
      </div>
    </div>
  );
}
