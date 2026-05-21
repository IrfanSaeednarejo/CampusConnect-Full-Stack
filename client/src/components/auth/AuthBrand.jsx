import useHomeTheme from "../../hooks/useHomeTheme";

export default function AuthBrand({
  title = "Welcome back to CampusNexus",
  subtitle = "Learn, connect, and grow with your campus community.",
  compact = false,
}) {
  const isDark = useHomeTheme();

  return (
    <div className={`flex flex-col items-center text-center ${compact ? "gap-3" : "gap-4"}`}>
      <div
        className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_42px_rgba(15,23,42,0.08)] ${
          isDark
            ? "border-border-dark bg-surface-dark"
            : "border-border-light bg-surface-light"
        }`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black tracking-[0.14em] text-white">
          CN
        </span>
        <div className="text-left">
          <p className={`text-lg font-black leading-none ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
            CampusNexus
          </p>
          <p className={`mt-1 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Learn. Connect. Grow.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h1
          className={`text-3xl font-black leading-tight tracking-[-0.04em] md:text-[2.2rem] ${
            isDark ? "text-text-primary-dark" : "text-text-primary-light"
          }`}
        >
          {title}
        </h1>
        <p
          className={`mx-auto max-w-md text-sm leading-relaxed md:text-base ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
