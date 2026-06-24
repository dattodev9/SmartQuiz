// ============================================================
// Smart Quiz — i18n React Hook
// Provides translations via React Context
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Locale, type Translations, getTranslations } from '../lib/i18n';

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'vi',
  t: getTranslations('vi'),
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');
  const [t, setT] = useState<Translations>(getTranslations('vi'));

  // Load saved locale on mount
  useEffect(() => {
    chrome.storage.local.get(['locale'], (result) => {
      const saved = (result.locale as Locale) || 'vi';
      setLocaleState(saved);
      setT(getTranslations(saved));
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setT(getTranslations(newLocale));
    chrome.storage.local.set({ locale: newLocale });
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
