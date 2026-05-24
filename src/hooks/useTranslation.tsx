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

export function I18nProvider({ children, initialGeo }: { children: ReactNode, initialGeo?: string }) {
  const isIntl = initialGeo === 'intl';
  const defaultGeo = isIntl 
    ? { country: 'US', currency: 'USD $', isPeru: false } 
    : { country: 'PE', currency: 'S/.', isPeru: true };

  const [geo, setGeo] = useState(defaultGeo);

  useEffect(() => {
    // Client-side detection or URL override if not captured on server
    const params = new URLSearchParams(window.location.search);
    const geoOverride = params.get('geo') || initialGeo;

    if (geoOverride === 'pe') {
      setGeo({ country: 'PE', currency: 'S/.', isPeru: true });
      return;
    } else if (geoOverride === 'intl') {
      setGeo({ country: 'US', currency: 'USD $', isPeru: false });
      return;
    }

    const detectGeo = async () => {
      // 1. Detección instantánea local por Zona Horaria (Perú - America/Lima)
      // Esto funciona sin red, es inmediato y es inmune a adblockers o políticas CORS.
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone && timeZone.toLowerCase().includes('lima')) {
          setGeo({ country: 'PE', currency: 'S/.', isPeru: true });
          console.log('[Geo] Perú detectado instantáneamente mediante Zona Horaria:', timeZone);
          return;
        }
      } catch (e) {
        console.warn('[Geo] Detección por zona horaria local fallida:', e);
      }

      // Helper para fetch con timeout (evita llamadas colgadas en malas conexiones)
      const fetchWithTimeout = async (url: string, ms = 2500) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          return response;
        } catch (error) {
          clearTimeout(id);
          throw error;
        }
      };

      // 2. Cadena de contingencia con múltiples APIs de geolocalización
      const apis = [
        {
          url: 'https://ipwho.is/',
          parse: (data: any) => data?.success ? data?.country_code : null
        },
        {
          url: 'https://freeipapi.com/api/json',
          parse: (data: any) => data?.countryCode
        },
        {
          url: 'https://api.country.is/',
          parse: (data: any) => data?.country
        },
        {
          url: 'https://ipapi.co/json/',
          parse: (data: any) => data?.country_code
        }
      ];

      for (const api of apis) {
        try {
          console.log(`[Geo] Intentando geolocalización mediante: ${api.url}`);
          const res = await fetchWithTimeout(api.url, 2500);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const data = await res.json();
          const countryCode = api.parse(data);
          
          if (countryCode) {
            const isPE = countryCode.toUpperCase() === 'PE';
            setGeo({
              country: countryCode.toUpperCase(),
              currency: isPE ? 'S/.' : 'USD $',
              isPeru: isPE
            });
            console.log(`[Geo] Detección exitosa. País: ${countryCode} mediante ${api.url}`);
            return; // Éxito: romper la cadena
          }
        } catch (err: any) {
          console.warn(`[Geo] Proveedor temporalmente inaccesible (${api.url}):`, err.message || err);
        }
      }

      console.warn('[Geo] Todos los proveedores de geolocalización fallaron. Usando configuración por defecto (Perú).');
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
