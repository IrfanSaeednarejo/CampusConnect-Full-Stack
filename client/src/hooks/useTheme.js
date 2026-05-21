import { useThemeContext } from "../contexts/ThemeContext";

export const useTheme = () => {
  const {
    themePreference,
    effectiveTheme,
    setThemePreference,
    toggleTheme,
    isDark,
    isLight,
    isSystem,
    systemTheme,
  } = useThemeContext();

  return {
    theme: themePreference,
    themePreference,
    effectiveTheme,
    systemTheme,
    setThemePreference,
    setTheme: setThemePreference,
    toggleTheme,
    setLightTheme: () => setThemePreference("light"),
    setDarkTheme: () => setThemePreference("dark"),
    setSystemTheme: () => setThemePreference("system"),
    isDark,
    isLight,
    isSystem,
  };
};
