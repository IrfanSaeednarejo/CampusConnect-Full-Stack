export default function FeatureCard({ icon, title, description, isDark = true }) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div
        className={`text-3xl transition-colors duration-300 ${
          isDark ? "text-[#3fb950]" : "text-[#1E40AF]"
        }`}
      >
        {icon}
      </div>
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
  );
}
