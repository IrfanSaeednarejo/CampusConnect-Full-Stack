import { Send } from "lucide-react";

export default function AgentInputBar({
  value,
  onChange,
  onSend,
  placeholder,
  disabled,
  helperText,
  containerClassName = "p-4 border-t border-[#30363d]",
  inputClassName = "",
}) {
  const isSendDisabled = disabled || !value.trim();

  return (
    <div className={containerClassName}>
      <div className="flex gap-2 items-end">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyPress={(event) => event.key === "Enter" && onSend()}
          placeholder={placeholder}
          className={`flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636] ${inputClassName}`}
          disabled={disabled}
        />
        <button
          onClick={onSend}
          disabled={isSendDisabled}
          className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition"
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>
      {helperText && <p className="text-xs text-[#8b949e] mt-2">{helperText}</p>}
    </div>
  );
}
