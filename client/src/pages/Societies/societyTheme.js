export function getSocietyTheme(isDark) {
  return {
    page: isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light",
    header:
      isDark
        ? "border-border-dark bg-background-dark/90"
        : "border-border-light bg-surface-light/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)]",
    hero:
      isDark
        ? "border-border-dark bg-container-dark"
        : "border-border-light bg-surface-light shadow-[0_16px_40px_rgba(15,23,42,0.08)]",
    card:
      isDark
        ? "border-border-dark bg-surface-dark"
        : "border-border-light bg-surface-light shadow-[0_12px_28px_rgba(15,23,42,0.06)]",
    subtle:
      isDark
        ? "border-border-dark bg-background-dark"
        : "border-border-light bg-slate-50",
    muted: isDark ? "text-text-secondary-dark" : "text-text-secondary-light",
    text: isDark ? "text-text-primary-dark" : "text-text-primary-light",
    divider: isDark ? "border-border-dark" : "border-border-light",
    field:
      isDark
        ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark focus:border-primary"
        : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light focus:border-info/40",
    info:
      isDark
        ? "border-info/30 bg-info/10 text-info"
        : "border-info/20 bg-info/5 text-info",
    error:
      isDark
        ? "border-danger/30 bg-danger/10 text-danger"
        : "border-danger/20 bg-danger/5 text-danger",
    badge:
      isDark
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-primary/20 bg-primary/5 text-primary",
    badgeMuted:
      isDark
        ? "border-border-dark bg-container-dark text-text-secondary-dark"
        : "border-border-light bg-slate-100 text-text-secondary-light",
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
        ? "bg-container-dark text-text-primary-dark border-border-dark"
        : "bg-surface-light text-text-primary-light border-border-light shadow-sm",
    tabInactive:
      isDark
        ? "bg-container-dark text-text-secondary-dark border-transparent hover:bg-surface-dark hover:text-text-primary-dark"
        : "bg-slate-100 text-text-secondary-light border-transparent hover:bg-slate-200 hover:text-slate-700",
  };
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
