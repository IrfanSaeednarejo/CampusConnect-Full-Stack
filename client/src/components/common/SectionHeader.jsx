export default function SectionHeader({
  title,
  subtitle,
  align = "left",
  maxWidth = "max-w-2xl",
}) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left";

  return (
    <div className={`flex flex-col gap-2 ${alignClass}`}>
      <h1 className="text-text-primary tracking-light text-2xl md:text-4xl font-bold md:font-black leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p
          className={`text-text-secondary text-sm md:text-base font-normal leading-normal ${maxWidth}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
