import Button from "./Button";

export default function SocietyCardSimple({
  name,
  category,
  members,
  description,
  head,
  onJoin,
  onLearnMore,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/50 hover:bg-[#21262d]"
          : "border-[#DCE4EE] bg-white/90 hover:border-[#93C5FD] hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      <div>
        <h2
          className={`text-lg font-bold leading-tight transition-colors duration-300 ${
            isDark ? "text-[#e6edf3]" : "text-[#162033]"
          }`}
        >
          {name}
        </h2>
        <p
          className={`mt-1 text-sm font-semibold transition-colors duration-300 ${
            isDark ? "text-[#3fb950]" : "text-[#1D4ED8]"
          }`}
        >
          {category}
        </p>
      </div>

      <p
        className={`text-sm leading-relaxed transition-colors duration-300 ${
          isDark ? "text-[#8b949e]" : "text-[#526277]"
        }`}
      >
        {description}
      </p>

      <div
        className={`flex flex-col gap-2 border-t pt-3 text-sm transition-colors duration-300 ${
          isDark ? "border-[#30363d] text-[#8b949e]" : "border-[#E2E8F0] text-[#526277]"
        }`}
      >
        <p>{members} members</p>
        <p>Head: {head}</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          className={`h-8 flex-1 px-3 text-xs ${
            !isDark
              ? "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-[0_8px_18px_rgba(29,78,216,0.16)]"
              : ""
          }`}
          onClick={onJoin}
        >
          Join
        </Button>
        <Button
          variant="secondary"
          className={`h-8 flex-1 px-3 text-xs ${
            !isDark
              ? "border-[#D6DEE8] bg-white text-[#162033] hover:bg-[#F8FAFC]"
              : ""
          }`}
          onClick={onLearnMore}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
