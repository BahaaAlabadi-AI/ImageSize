import { useState, useEffect, createContext, useContext } from 'react';
import { en } from './en';
import { ar } from './ar';

export type Language = 'en' | 'ar';
export type TranslationType = typeof en;

interface I18nContextType {
  lang: Language;
  t: TranslationType;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const translations = { en, ar };

export const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  t: en,
  dir: 'ltr',
  setLang: () => {},
  toggleLang: () => {},
});

export function useTranslation() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('img_tool_lang');
    if (saved === 'en' || saved === 'ar') return saved;
    return navigator.language.startsWith('ar') ? 'ar' : 'en';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem('img_tool_lang', lang);
  }, [lang, dir]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <I18nContext.Provider value={{ lang, t, dir, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}
