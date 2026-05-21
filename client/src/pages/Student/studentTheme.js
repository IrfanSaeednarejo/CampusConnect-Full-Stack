export function getStudentTheme(isDark) {
  return {
    isDark,
    page: isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light",
    shell: isDark ? "bg-background-dark" : "bg-background-light",
    header:
      isDark
        ? "border-border-dark bg-background-dark/80"
        : "border-border-light bg-surface-light/85 shadow-[0_10px_32px_rgba(15,23,42,0.06)]",
    card:
      isDark
        ? "border-border-dark bg-surface-dark shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
        : "border-border-light bg-surface-light shadow-[0_16px_40px_rgba(15,23,42,0.08)]",
    subtleCard:
      isDark
        ? "border-border-dark bg-container-dark"
        : "border-border-light bg-slate-50/80",
    elevatedCard:
      isDark
        ? "border-border-dark bg-surface-dark shadow-[0_18px_44px_rgba(0,0,0,0.24)]"
        : "border-border-light bg-surface-light shadow-[0_20px_48px_rgba(15,23,42,0.10)]",
    text: isDark ? "text-text-primary-dark" : "text-text-primary-light",
    muted: isDark ? "text-text-secondary-dark" : "text-text-secondary-light",
    icon: isDark ? "text-text-secondary-dark" : "text-slate-400",
    divider: isDark ? "border-border-dark" : "border-border-light",
    field:
      isDark
        ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
        : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light",
    navLink:
      isDark
        ? "text-text-primary-dark hover:text-white"
        : "text-slate-600 hover:text-text-primary-light",
    iconButton:
      isDark
        ? "border border-border-dark bg-surface-dark text-text-primary-dark hover:bg-slate-800"
        : "border border-border-light bg-surface-light text-slate-600 hover:bg-slate-50 hover:text-text-primary-light",
    primaryButton:
      isDark
        ? "btn-primary"
        : "btn-primary",
    secondaryButton:
      isDark
        ? "btn-secondary"
        : "btn-secondary",
    tabActive:
      isDark
        ? "border-primary bg-primary/10 text-primary"
        : "border-border-light bg-surface-light text-text-primary-light shadow-sm",
    tabInactive:
      isDark
        ? "border-transparent bg-container-dark text-text-secondary-dark hover:bg-surface-dark hover:text-text-primary-dark"
        : "border-transparent bg-slate-100 text-text-secondary-light hover:bg-slate-200 hover:text-slate-700",
    badge:
      isDark
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-primary/20 bg-primary/5 text-primary",
    badgeMuted:
      isDark
        ? "border-border-dark bg-background-dark text-text-secondary-dark"
        : "border-border-light bg-surface-light text-text-secondary-light",
    hero:
      isDark
        ? "border-border-dark bg-container-dark"
        : "border-border-light bg-surface-light",
  };
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
