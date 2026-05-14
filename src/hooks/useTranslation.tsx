'use client';
import { createContext, useContext, ReactNode } from 'react';
import translationsData from '@/lib/translations.json';

const translations = translationsData as any;

interface I18nContextType {
  lang: string;
  t: (key: string, params?: Record<string, any>) => any;
  months: string[];
  translateText: (text: string) => Promise<string>;
  currency: string;
  country: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper to get translation value (ES only)
const getTranslation = (key: string, params?: Record<string, any>) => {
  const dict = translations.es;
  const keys = key.split('.');
  let value: any = dict;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  if (value === undefined) return key;
  if (params && typeof value === 'string') {
    let str = value;
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return str;
  }
  return value;
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = 'es';
  const currency = 'S/';
  const country = 'PE';
  const t = getTranslation;
  const translateText = async (text: string) => text;
  const months = translations.es.months || [];

  return (
    <I18nContext.Provider value={{ lang, t, months, translateText, currency, country }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  
  // Resilient fallback: If no provider, return default Spanish logic
  if (context === undefined) {
    return {
      lang: 'es',
      t: getTranslation,
      months: translations.es.months || [],
      translateText: async (text: string) => text,
      currency: 'S/',
      country: 'PE'
    };
  }
  return context;
}
