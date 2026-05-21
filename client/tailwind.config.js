/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        "success-hover": "rgb(var(--color-success-hover) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        "warning-hover": "rgb(var(--color-warning-hover) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        "danger-hover": "rgb(var(--color-danger-hover) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          light: "rgb(var(--color-background-light) / <alpha-value>)",
          dark: "rgb(var(--color-background-dark) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          light: "rgb(var(--color-surface-light) / <alpha-value>)",
          dark: "rgb(var(--color-surface-dark) / <alpha-value>)",
          muted: "rgb(var(--color-surface-muted) / <alpha-value>)",
        },
        "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
        container: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          light: "rgb(var(--color-surface-light) / <alpha-value>)",
          dark: "rgb(var(--color-surface-dark) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          light: "rgb(var(--color-border-light) / <alpha-value>)",
          dark: "rgb(var(--color-border-dark) / <alpha-value>)",
        },
        text: {
          DEFAULT: "rgb(var(--color-text-primary) / <alpha-value>)",
          light: "rgb(var(--color-text-primary-light) / <alpha-value>)",
          dark: "rgb(var(--color-text-primary-dark) / <alpha-value>)",
          primary: {
            DEFAULT: "rgb(var(--color-text-primary) / <alpha-value>)",
            light: "rgb(var(--color-text-primary-light) / <alpha-value>)",
            dark: "rgb(var(--color-text-primary-dark) / <alpha-value>)",
          },
          secondary: {
            DEFAULT: "rgb(var(--color-text-secondary) / <alpha-value>)",
            light: "rgb(var(--color-text-secondary-light) / <alpha-value>)",
            dark: "rgb(var(--color-text-secondary-dark) / <alpha-value>)",
          },
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
