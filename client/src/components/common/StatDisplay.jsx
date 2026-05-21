export default function StatDisplay({
  stat,
  label,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`rounded-2xl border p-6 text-center transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#161b22]"
          : "border-[#DCE4EE] bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      } ${className}`}
    >
      <p
        className={`mb-2 text-3xl font-bold transition-colors duration-300 ${
          isDark ? "text-[#3fb950]" : "text-[#1D4ED8]"
        }`}
      >
        {stat}
      </p>
      <p
        className={`text-sm transition-colors duration-300 ${
          isDark ? "text-[#8b949e]" : "text-[#526277]"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
