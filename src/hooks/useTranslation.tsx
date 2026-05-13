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

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always Spanish — no logic, no storage, no network, absolute speed.
  const lang = 'es';
  const currency = 'S/'; // Default to S/ or $ as needed, but let's keep it simple.
  const country = 'PE';

  const t = (key: string, params?: Record<string, any>) => {
    const dict = translations.es;
    
    // Support for nested keys (e.g., "recursos_guide.title")
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
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
  const months = translations.es.months || [];

  return (
    <I18nContext.Provider value={{ lang, t, months, translateText, currency, country }}>
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
