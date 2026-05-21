import useHomeTheme from "../../hooks/useHomeTheme";

export default function Card({
  children,
  className = "",
  padding = "p-8",
  isDark,
}) {
  const themeIsDark = useHomeTheme();
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : themeIsDark;

  return (
    <div
      className={`rounded-[1.5rem] border transition-all duration-300 ${padding} ${
        resolvedIsDark
          ? "border-border-dark bg-surface-dark shadow-[0_18px_36px_rgba(0,0,0,0.14)]"
          : "border-border-light bg-surface-light shadow-[0_14px_32px_rgba(15,23,42,0.06)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
