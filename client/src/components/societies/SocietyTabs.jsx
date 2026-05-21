import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getSocietyTheme } from "../../pages/Societies/societyTheme";

export default function SocietyTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  containerClassName = "",
}) {
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);

  return (
    <div className={cn("border-b", theme.header, containerClassName)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("flex flex-wrap gap-2 py-3", className)}>
          {tabs.map((tab) => {
            const value = typeof tab === "string" ? tab : tab.value;
            const label = typeof tab === "string" ? tab : tab.label;
            const badge = typeof tab === "string" ? null : tab.badge;
            const isActive = activeTab === value;

            return (
              <button
                key={value}
                onClick={() => onChange(value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium capitalize transition-colors",
                  isActive ? theme.tabActive : theme.tabInactive
                )}
              >
                <span>{label}</span>
                {badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      isActive ? theme.badge : theme.badgeMuted
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
