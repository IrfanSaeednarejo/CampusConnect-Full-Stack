export default function LegalIntro({
  title,
  subtitle,
  meta,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  metaClassName = "",
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <h1 className={`text-4xl font-black tracking-tight ${titleClassName}`}>
        {title}
      </h1>
      {subtitle && (
        <p className={`text-base ${subtitleClassName}`}>{subtitle}</p>
      )}
      {meta && (
        <p className={`text-sm ${metaClassName}`}>{meta}</p>
      )}
    </div>
  );
}
