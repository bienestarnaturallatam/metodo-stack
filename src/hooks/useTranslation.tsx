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
    const savedLang = localStorage.getItem('app-lang') as Lang;
    const savedCountry = localStorage.getItem('app-country');
    
    if (savedLang && ['es', 'en', 'pt'].includes(savedLang)) {
      setLangState(savedLang);
      if (savedCountry) {
        setCountry(savedCountry);
        setCurrency(savedCountry === 'PE' ? 'S/' : '$');
      }
    } else {
      // Auto-detect language and country based on IP
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const code = data.country_code;
          setCountry(code);
          localStorage.setItem('app-country', code);
          
          // Currency logic: S/ for Peru, $ for everything else
          const cur = code === 'PE' ? 'S/' : '$';
          setCurrency(cur);

          // Language logic
          if (['US', 'GB', 'CA', 'AU', 'NZ'].includes(code)) {
            setLangState('en');
            localStorage.setItem('app-lang', 'en');
          } else if (['BR', 'PT'].includes(code)) {
            setLangState('pt');
            localStorage.setItem('app-lang', 'pt');
          } else {
            setLangState('es');
            localStorage.setItem('app-lang', 'es');
          }
        })
        .catch(() => {
           setLangState('es');
           setCurrency('$');
        });
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('app-lang', l);
  };

  const t = (key: string, params?: Record<string, any>) => {
    const dict = translations[lang] || translations.es;
    
    // Support for nested keys (e.g., "recursos_guide.title")
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    // Fallback to Spanish if not found in current language
    if (value === undefined) {
      value = translations.es;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }

    // If still undefined, return original key
    if (value === undefined) return key;

    // Process parameters {key}
    if (params && typeof value === 'string') {
      let str = value;
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
      return str;
    }

    return value;
  };

  const translateText = async (text: string) => text;

  const months = (translations[lang] || translations.es).months || [];

  // Prevent flash of untranslated content by using isMounted
  if (!isMounted) return <div className="bg-black min-h-screen" />;

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
