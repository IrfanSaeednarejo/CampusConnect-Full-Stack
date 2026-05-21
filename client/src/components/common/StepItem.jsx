export default function StepItem({ number, title, description, isDark = true }) {
  return (
    <div className="flex items-start gap-3 mt-4 first:mt-0">
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
          isDark
            ? "bg-[#161b22] border-[#30363d] text-[#3fb950]"
            : "bg-white border-[#E2E8F0] text-[#1E40AF]"
        }`}
      >
        {number}
      </div>
      <div className="flex flex-col gap-0.5">
        <h2
          className={`text-sm font-bold leading-tight transition-colors duration-300 ${
            isDark ? "text-[#e6edf3]" : "text-[#1A202C]"
          }`}
        >
          {title}
        </h2>
        <p
          className={`text-xs font-normal leading-normal transition-colors duration-300 ${
            isDark ? "text-[#8b949e]" : "text-[#4A5568]"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
