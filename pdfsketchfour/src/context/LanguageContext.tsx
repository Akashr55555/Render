import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, Language } from '../i18n/languages';
import { translations, getTranslation } from '../i18n/translations';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: LANGUAGES[0],
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const savedCode = localStorage.getItem('pdfsketch_language');
      if (savedCode) {
        const found = LANGUAGES.find((l) => l.code === savedCode);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return LANGUAGES[0]; // English default
  });

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('pdfsketch_language', lang.code);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string): string => {
    return getTranslation(currentLanguage.code, key);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
