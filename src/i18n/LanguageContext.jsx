import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { en } from "./en";
import { el } from "./el";

const DICTS = { en, el };
const STORAGE_KEY = "sec-portfolio-lang";

const LanguageContext = createContext(null);

function resolve(dict, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), dict);
}

// A value counts as "untranslated" when it's missing or still carries a
// TODO_EL marker — in either case we serve the English source instead.
function isUntranslated(value) {
  return value === undefined || (typeof value === "string" && value.startsWith("TODO_EL"));
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "el" ? "el" : "en";
  });

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const toggle = useCallback(
    () => setLang((current) => (current === "en" ? "el" : "en")),
    []
  );

  // t("section.key") → localized value with per-key fallback to English.
  const t = useCallback(
    (path) => {
      const localized = resolve(DICTS[lang], path);
      return isUntranslated(localized) ? resolve(en, path) : localized;
    },
    [lang]
  );

  // tr(value) → localizes an inline field carried by the data files. Bare
  // strings pass through; a { en, el } pair resolves to the active language,
  // falling back to English when the Greek side is missing or still TODO_EL.
  const tr = useCallback(
    (value) => {
      if (value == null || typeof value === "string") return value;
      if (typeof value === "object" && ("en" in value || "el" in value)) {
        const localized = value[lang];
        return isUntranslated(localized) ? value.en : localized;
      }
      return value;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle, t, tr }),
    [lang, toggle, t, tr]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
