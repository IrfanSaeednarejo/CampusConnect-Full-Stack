import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  applyThemeToDocument,
  bootstrapTheme,
  DARK_THEME,
  getEffectiveTheme,
  getStoredTheme,
  getSystemTheme,
  isValidThemePreference,
  LIGHT_THEME,
  persistTheme,
  resolveInitialThemePreference,
  SYSTEM_THEME,
  THEME_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
} from "../utils/themeHelpers";
import { selectUser } from "../redux/slices/authSlice";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const user = useSelector(selectUser);
  const [themePreference, updateThemePreference] = useState(() => resolveInitialThemePreference());
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());
  const hasStoredThemeRef = useRef(Boolean(getStoredTheme()));
  const lastSyncedUserThemeRef = useRef(null);
  const effectiveTheme = getEffectiveTheme(themePreference, systemTheme);

  const setThemePreference = (nextThemePreference) => {
    if (typeof nextThemePreference === "function") {
      updateThemePreference((currentPreference) => {
        const resolvedPreference = nextThemePreference(currentPreference);
        if (isValidThemePreference(resolvedPreference)) {
          hasStoredThemeRef.current = true;
        }
        return isValidThemePreference(resolvedPreference) ? resolvedPreference : currentPreference;
      });
      return;
    }

    if (isValidThemePreference(nextThemePreference)) {
      hasStoredThemeRef.current = true;
      updateThemePreference(nextThemePreference);
    }
  };

  useLayoutEffect(() => {
    applyThemeToDocument(effectiveTheme);
    persistTheme(themePreference);
  }, [effectiveTheme, themePreference]);

  useEffect(() => {
    const preferredTheme = user?.preferences?.theme;
    if (!isValidThemePreference(preferredTheme)) {
      return;
    }

    if (hasStoredThemeRef.current) {
      lastSyncedUserThemeRef.current = preferredTheme;
      return;
    }

    if (lastSyncedUserThemeRef.current === preferredTheme) {
      return;
    }

    lastSyncedUserThemeRef.current = preferredTheme;
    hasStoredThemeRef.current = true;

    if (preferredTheme !== themePreference) {
      updateThemePreference(preferredTheme);
    }
  }, [themePreference, user?.preferences?.theme]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? DARK_THEME : LIGHT_THEME);
    };

    updateSystemTheme();

    if (themePreference !== SYSTEM_THEME) {
      return undefined;
    }

    const handleSystemThemeChange = () => {
      updateSystemTheme();
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, [themePreference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key && event.key !== THEME_STORAGE_KEY && event.key !== LEGACY_THEME_STORAGE_KEY) {
        return;
      }

      hasStoredThemeRef.current = Boolean(getStoredTheme());
      setThemePreference(resolveInitialThemePreference());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(() => {
    return {
      themePreference,
      effectiveTheme,
      setThemePreference,
      setTheme: setThemePreference,
      toggleTheme: () =>
        setThemePreference((currentPreference) =>
          getEffectiveTheme(currentPreference, systemTheme) === DARK_THEME ? LIGHT_THEME : DARK_THEME,
        ),
      isDark: effectiveTheme === DARK_THEME,
      isLight: effectiveTheme === LIGHT_THEME,
      isSystem: themePreference === SYSTEM_THEME,
      systemTheme,
    };
  }, [effectiveTheme, systemTheme, themePreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

export { bootstrapTheme };
