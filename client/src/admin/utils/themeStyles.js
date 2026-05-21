export const getAdminThemeStyles = (isDark) => ({
  title: {
    color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
  },
  subtitle: {
    color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
  },
  panel: {
    background: isDark ? "rgb(var(--color-surface-dark))" : "rgb(var(--color-surface-light))",
    border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
    boxShadow: isDark ? "none" : "0 18px 42px rgba(15,23,42,0.08)",
  },
  inset: {
    background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))",
    border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
  },
  mutedPanel: {
    background: isDark ? "rgb(var(--color-surface-muted-dark))" : "rgb(var(--color-surface-muted-light))",
    border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
  },
  label: {
    color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
  },
  input: {
    background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))",
    border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
    color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
  },
  strong: {
    color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
  },
  muted: {
    color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
  },
  dangerPanel: {
    background: isDark ? "rgb(var(--color-surface-dark))" : "rgb(var(--color-surface-light))",
    border: `1px solid ${isDark ? "rgba(220,38,38,0.35)" : "rgba(220,38,38,0.22)"}`,
    boxShadow: isDark ? "none" : "0 18px 42px rgba(15,23,42,0.08)",
  },
});
