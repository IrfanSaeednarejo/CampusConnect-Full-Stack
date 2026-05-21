export default function SectionHeader({
  title,
  subtitle,
  align = "left",
  maxWidth = "max-w-[720px]",
  isDark = true,
}) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left";

  return (
    <div className={`flex flex-col gap-2 ${alignClass}`}>
      <h1
        className={`tracking-light text-2xl md:text-4xl font-bold md:font-black leading-tight transition-colors duration-300 ${
          isDark ? "text-[#e6edf3]" : "text-[#1A202C]"
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`text-sm md:text-base font-normal leading-normal transition-colors duration-300 ${
            isDark ? "text-[#8b949e]" : "text-[#4A5568]"
          } ${maxWidth}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
