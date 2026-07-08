import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en.json";
import translationES from "./locales/es.json";
import translationFR from "./locales/fr.json";
import translationDE from "./locales/de.json";
import translationHI from "./locales/hi.json";


const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  fr: { translation: translationFR },
  de: { translation: translationDE },
  hi: { translation: translationHI }
};

i18next
  .use(LanguageDetector) // Auto-detects the browser's language setting
  .use(initReactI18next) //  It connects the core translation library (i18next) to React.
  .init({
    resources,
    fallbackLng: "en", // Default language if auto-detect fails
    debug: false,      
    interpolation: {
      escapeValue: false // React already escapes values to prevent XSS
    }
  });

export default i18next;
