import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import {
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  isValidLanguage,
  translate,
} from "../i18n";

const LanguageContext = createContext(null);

const getStoredLanguage = () => {
  if (typeof window === "undefined") return "en";
  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
};

const applyDocumentLanguage = (language) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = language === "ur" ? "ur" : "en";
  root.dir = "ltr";
  root.dataset.language = language;
  root.classList.toggle("lang-ur", language === "ur");
};

const resolveInitialLanguage = (userLanguage) => {
  if (isValidLanguage(userLanguage)) return userLanguage;
  return getStoredLanguage();
};

export const bootstrapLanguage = () => {
  applyDocumentLanguage(getStoredLanguage());
};

export function LanguageProvider({ children }) {
  const user = useSelector(selectUser);
  const userLanguage = user?.preferences?.language;
  const [language, setLanguageState] = useState(() => resolveInitialLanguage(userLanguage));
  const syncedUserLanguageRef = useRef(userLanguage);

  const persistLanguage = useCallback((value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
  }, []);

  const applyLanguage = useCallback(
    (value) => {
      const normalized = normalizeLanguage(value);
      persistLanguage(normalized);
      applyDocumentLanguage(normalized);
      return normalized;
    },
    [persistLanguage],
  );

  const setLanguage = useCallback(
    (value) => {
      const normalized = applyLanguage(value);
      setLanguageState((current) => (current === normalized ? current : normalized));
    },
    [applyLanguage],
  );

  useEffect(() => {
    applyLanguage(language);
  }, [applyLanguage, language]);

  useEffect(() => {
    if (!isValidLanguage(userLanguage)) return;
    if (syncedUserLanguageRef.current === userLanguage) return;
    syncedUserLanguageRef.current = userLanguage;
    setLanguageState((current) => {
      const normalized = normalizeLanguage(userLanguage);
      if (current === normalized) return current;
      applyLanguage(normalized);
      return normalized;
    });
  }, [applyLanguage, userLanguage]);

  const t = useCallback((key, values = {}) => translate(language, key, values), [language]);

  const value = useMemo(
    () => ({
      language,
      locale: language === "ur" ? "ur-PK" : "en-US",
      isUrdu: language === "ur",
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within a LanguageProvider");
  }
  return context;
};
