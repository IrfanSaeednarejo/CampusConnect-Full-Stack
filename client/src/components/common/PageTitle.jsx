import useHomeTheme from "../../hooks/useHomeTheme";

export default function PageTitle({ title, subtitle, isDark }) {
  const themeIsDark = useHomeTheme();
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : themeIsDark;

  return (
    <div className="flex flex-col gap-2">
      <p
        className={`text-3xl font-bold leading-tight tracking-[-0.033em] sm:text-4xl ${
          resolvedIsDark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </p>
      {subtitle && (
        <p
          className={`text-base font-normal leading-normal ${
            resolvedIsDark ? "text-white/60" : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
