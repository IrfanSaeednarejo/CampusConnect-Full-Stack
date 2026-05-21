import en from "./en";
import ur from "./ur";

export const SUPPORTED_LANGUAGES = ["en", "ur"];
export const LANGUAGE_STORAGE_KEY = "campusnexus-language";

export const messages = { en, ur };

export const isValidLanguage = (value) => SUPPORTED_LANGUAGES.includes(value);

export const normalizeLanguage = (value) => (isValidLanguage(value) ? value : "en");

export const interpolate = (template, values = {}) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value ?? ""),
    template,
  );

export const translate = (language, key, values = {}) => {
  const normalized = normalizeLanguage(language);
  const catalog = messages[normalized] || messages.en;
  const fallback = messages.en[key] || key;
  const template = catalog[key] || fallback;
  return interpolate(template, values);
};
