'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import translationsData from '@/lib/translations.json';

type Lang = 'es' | 'en' | 'pt';

const translations = translationsData as any;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string>) => any;
  months: string[];
  translateText: (text: string) => Promise<string>;
  currency: string;
  country: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');
  const [currency, setCurrency] = useState('$');
  const [country, setCountry] = useState('PE');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('app-lang') as Lang;
    
    if (saved && ['es', 'en', 'pt'].includes(saved)) {
      setLangState(saved);
      if (saved === 'en' || saved === 'pt' || saved === 'es') setCurrency('$');
    } else {
      // Auto-detect language based on IP
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const code = data.country_code;
          setCountry(code);
          if (code === 'US') {
            setLangState('en');
            setCurrency('$');
          } else if (code === 'BR' || code === 'PT') {
            setLangState('pt');
            setCurrency('$');
          } else {
            setLangState('es');
            setCurrency('$');
          }
        })
        .catch(() => setLangState('es'));
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('app-lang', l);
    setCurrency('$');
  };

  const t = (key: string, params?: Record<string, string>) => {
    const dict = translations[lang] || translations.es;
    let text = dict[key] || translations.es[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const translateText = async (text: string) => text;

  const months = (translations[lang] || translations.es).months || [];

  if (!isMounted) return null;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, months, translateText, currency, country }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
