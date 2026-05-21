export default function ValueCard({
  title,
  description,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#161b22]"
          : "border-[#DCE4EE] bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      } ${className}`}
    >
      <h3
        className={`mb-2 text-lg font-bold transition-colors duration-300 ${
          isDark ? "text-[#3fb950]" : "text-[#1D4ED8]"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed transition-colors duration-300 ${
          isDark ? "text-[#8b949e]" : "text-[#526277]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
