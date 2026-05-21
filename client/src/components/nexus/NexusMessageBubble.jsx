import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useHomeTheme from "../../hooks/useHomeTheme";
import NexusActionCard from "./NexusActionCard";

function NexusAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
      N
    </div>
  );
}

export default function NexusMessageBubble({ message }) {
  const isDark = useHomeTheme();
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-none bg-primary px-4 py-3 text-white">
          <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          <span className="mt-1 block text-right text-[10px] opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5">
      <NexusAvatar />
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl rounded-bl-none border px-4 py-3 ${
            isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"
          }`}
        >
          <div
            className={`prose prose-sm max-w-none leading-relaxed ${
              isDark ? "prose-invert text-text-primary-dark" : "prose-slate text-text-primary-light"
            } [&_a]:text-sky-600 [&_a:hover]:underline [&_code]:rounded [&_code]:px-1 [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm ${
              isDark
                ? "[&_strong]:text-primary [&_code]:bg-background-dark [&_code]:text-orange-400 [&_pre]:bg-background-dark [&_pre]:border-border-dark [&_pre]:text-text-primary-dark [&_table]:border-border-dark [&_th]:border-border-dark [&_td]:border-border-dark"
                : "[&_strong]:text-primary [&_code]:bg-surface-muted [&_code]:text-orange-600 [&_pre]:bg-surface-muted [&_pre]:border-border-light [&_pre]:text-text-primary-light [&_table]:border-border-light [&_th]:border-border-light [&_td]:border-border-light"
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
          <span className={`mt-1.5 block text-[10px] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {message.intent && message.actionTaken && (
          <NexusActionCard intent={message.intent} actionTaken={message.actionTaken} />
        )}
      </div>
    </div>
  );
}
