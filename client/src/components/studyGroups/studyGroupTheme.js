export function getStudyGroupTheme(isDark) {
  return {
    page: isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light",
    hero: isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-surface-light",
    surface: isDark
      ? "border-border-dark bg-surface-dark"
      : "border-border-light bg-surface-light",
    surfaceMuted: isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-slate-50",
    surfaceSoft: isDark ? "bg-background-dark" : "bg-slate-50",
    title: isDark ? "text-text-primary-dark" : "text-text-primary-light",
    text: isDark ? "text-text-primary-dark" : "text-slate-700",
    muted: isDark ? "text-text-secondary-dark" : "text-text-secondary-light",
    subtle: isDark ? "text-slate-500" : "text-slate-400",
    border: isDark ? "border-border-dark" : "border-border-light",
    divider: isDark ? "divide-border-dark" : "divide-border-light",
    hoverSurface: isDark ? "hover:bg-surface-dark" : "hover:bg-slate-50",
    iconAccent: "text-primary",
    accentSurface: isDark ? "border-primary/30 bg-primary/10" : "border-primary/20 bg-primary/5",
    accentSoft: isDark ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary",
    infoSurface: isDark ? "border-info/25 bg-info/10" : "border-info/20 bg-info/5",
    infoText: "text-info",
    warningSurface: isDark ? "border-warning/25 bg-warning/10" : "border-warning/20 bg-warning/5",
    warningText: "text-warning",
    dangerSurface: isDark ? "border-danger/25 bg-danger/10" : "border-danger/20 bg-danger/5",
    dangerText: "text-danger",
    input: isDark
      ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
      : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light focus:border-info/40 focus:ring-2 focus:ring-info/10",
    inputMuted: isDark
      ? "border-border-dark bg-surface-dark text-text-primary-dark placeholder:text-text-secondary-dark"
      : "border-border-light bg-slate-50 text-text-primary-light placeholder:text-text-secondary-light",
    buttonPrimary: "bg-primary text-white hover:bg-primary-hover",
    buttonSecondary: isDark
      ? "border-border-dark bg-surface-dark text-text-primary-dark hover:bg-slate-800"
      : "border-border-light bg-surface-light text-slate-700 hover:bg-slate-50",
    buttonDanger: isDark
      ? "border-danger/25 bg-danger/10 text-danger hover:bg-danger/15"
      : "border-danger/20 bg-danger/5 text-danger hover:bg-danger/10",
    tabActive: isDark
      ? "border-primary bg-surface-dark text-primary"
      : "border-border-light bg-surface-light text-text-primary-light shadow-sm",
    tabIdle: isDark
      ? "border-transparent text-text-secondary-dark hover:border-border-dark hover:bg-surface-dark hover:text-text-primary-dark"
      : "border-transparent text-text-secondary-light hover:border-border-light hover:bg-surface-light hover:text-text-primary-light",
  };
}

export const studyGroupPageTitle = "text-3xl font-bold tracking-tight";
export const studyGroupSectionEyebrow =
  "text-xs font-semibold uppercase tracking-[0.16em]";
export const studyGroupCardTitle = "text-lg font-medium";
