/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--bg-background)",
          surface: "var(--bg-surface)",
        },
        surface: {
          DEFAULT: "var(--bg-surface)",
          hover: "var(--bg-surface-hover)",
          dark: "#161b22",
        },
        border: {
          DEFAULT: "var(--border-default)",
          hover: "var(--border-hover)",
          dark: "#30363d",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          "primary-dark": "#c9d1d9",
          "secondary-dark": "#8b949e",
        },
        primary: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
        },
        danger: {
          DEFAULT: "var(--accent-danger)",
          hover: "var(--accent-danger-hover)",
        },
        warning: {
          DEFAULT: "var(--accent-warning)",
        },
        // Legacy colors kept temporarily to prevent app crashes during transition
        "background-light": "#f6f8f7",
        "background-dark": "#0d1117",
        "dark-gray": "#161b22",
        "light-gray": "#8b949e",
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
