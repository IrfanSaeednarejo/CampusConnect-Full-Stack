export const THEME_STORAGE_KEY = "theme";
export const LEGACY_THEME_STORAGE_KEY = "homeTheme";
export const DARK_THEME = "dark";
export const LIGHT_THEME = "light";
export const SYSTEM_THEME = "system";

export function isValidThemePreference(value) {
  return [LIGHT_THEME, DARK_THEME, SYSTEM_THEME].includes(value);
}

export function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return LIGHT_THEME;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME
    : LIGHT_THEME;
}

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return null;
  }

  const savedTheme =
    window.localStorage.getItem(THEME_STORAGE_KEY) ||
    window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);

  return isValidThemePreference(savedTheme) ? savedTheme : null;
}

export function getEffectiveTheme(themePreference, systemTheme = getSystemTheme()) {
  if (themePreference === DARK_THEME) {
    return DARK_THEME;
  }

  if (themePreference === LIGHT_THEME) {
    return LIGHT_THEME;
  }

  return systemTheme;
}

export function resolveInitialThemePreference() {
  return getStoredTheme() || SYSTEM_THEME;
}

export function resolveInitialTheme() {
  return getEffectiveTheme(resolveInitialThemePreference());
}

export function applyThemeToDocument(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === DARK_THEME);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
}

export function persistTheme(themePreference) {
  if (typeof window === "undefined") {
    return;
  }

  if (!isValidThemePreference(themePreference)) {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
}

export function bootstrapTheme() {
  const themePreference = resolveInitialThemePreference();
  const effectiveTheme = getEffectiveTheme(themePreference);
  applyThemeToDocument(effectiveTheme);
  persistTheme(themePreference);
  return { themePreference, effectiveTheme };
}
