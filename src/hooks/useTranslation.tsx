'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import translationsData from '@/lib/translations.json';

const translations = translationsData as any;

interface I18nContextType {
  lang: string;
  t: (key: string, params?: Record<string, any>) => any;
  months: string[];
  translateText: (text: string) => Promise<string>;
  currency: string;
  country: string;
  isPeru: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

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
  const [geo, setGeo] = useState({ country: 'PE', currency: 'S/.', isPeru: true });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const geoOverride = params.get('geo');

    if (geoOverride === 'pe') {
      setGeo({ country: 'PE', currency: 'S/.', isPeru: true });
      return;
    } else if (geoOverride === 'intl') {
      setGeo({ country: 'US', currency: 'USD $', isPeru: false });
      return;
    }

    const detectGeo = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const isPE = data.country_code === 'PE';
        setGeo({
          country: data.country_code || 'PE',
          currency: isPE ? 'S/.' : 'USD $',
          isPeru: isPE
        });
      } catch (e) {
        console.error('Geo detection failed', e);
      }
    };
    
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => detectGeo());
      } else {
        setTimeout(detectGeo, 1000);
      }
    }
  }, []);

  const lang = 'es';
  const { country, currency, isPeru } = geo;
  const t = getTranslation;
  const translateText = async (text: string) => text;
  const months = translations.es.months || [];

  return (
    <I18nContext.Provider value={{ lang, t, months, translateText, currency, country, isPeru }}>
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
      country: 'PE',
      isPeru: true
    };
  }
  return context;
}
