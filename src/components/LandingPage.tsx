'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Zap, 
  Globe
} from 'lucide-react';

import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';

const MainSections = dynamic(() => import('@/components/MainSections'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-white" />
});

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup'), {
  ssr: false
});

export const WSP_GLOBAL_LINK = "https://wa.me/51989078285?text=Hola!%20Vengo%20de%20la%20p%C3%A1gina%20y%20quiero%20mi%20llave%20de%20acceso%20gratis%20por%203%20d%C3%ADas%20al%20M%C3%A9todo%20STACK.%20%F0%9F%8C%BF";

export default function LandingPage() {
  const { lang, setLang, t } = useTranslation();
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#00C853]/20">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-black/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">MÉTODO STACK</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full border border-black/5">
              <Globe className="w-3.5 h-3.5 text-[#00C853]" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as any)}
                aria-label="Seleccionar idioma"
                className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <a href="#hero" className="text-sm font-bold hover:text-[#00C853] transition-colors">{t('nav_home')}</a>
            <a href="#beneficios" className="text-sm font-bold hover:text-[#00C853] transition-colors">{t('nav_benefits')}</a>
            <a href="#precios" className="text-sm font-bold hover:text-[#00C853] transition-colors">{t('nav_pricing')}</a>
            <Link 
              href="/login" 
              className="px-6 py-2.5 border-2 border-black rounded-full text-sm font-black uppercase hover:bg-black hover:text-white transition-all"
            >
              {t('nav_login')}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="pt-24 sm:pt-32 pb-12 px-6 min-h-[70vh] flex flex-col justify-center">
        <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-[10px] font-black uppercase tracking-[0.2em] mb-4 animate-in fade-in">
              <Zap className="w-3 h-3 fill-[#00C853]" />
              {t('auth_tagline')}
            </div>
            
            <h1 className="hero-title text-[#111111]">
              {t('hero_title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-[#111111]/70 font-medium max-w-3xl mx-auto mb-8">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href={WSP_GLOBAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex md:inline-flex items-center justify-center px-6 md:px-10 py-4 md:py-5 bg-[#00C853] text-black rounded-full font-black italic text-[13px] md:text-lg tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#00C853]/30 w-full md:w-auto max-w-[90vw] mx-auto"
              >
                <span className="mr-2 md:mr-3 uppercase whitespace-nowrap md:whitespace-normal">EMPEZAR MI TRANSFORMACIÓN</span>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Zap className="w-4 h-4 text-[#00C853] fill-[#00C853]" />
                </div>
              </a>
            </div>

            {/* MOCKUP IMAGE OPTIMIZED */}
            <div className="hero-img-container group">
              <div className="absolute -inset-4 bg-[#00C853]/10 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative aspect-[3/2] w-full shadow-[0_35px_60px_rgba(0,0,0,0.15)] rounded-2xl border-4 border-white shadow-2xl overflow-hidden group-hover:scale-[1.01]">
                <picture>
                  <source srcSet="/hero-mobile.webp" media="(max-width: 600px)" />
                  <img
                    src="/hero.webp"
                    alt="Plataforma Método Stack — App de hábitos y finanzas"
                    width={1200}
                    height={800}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </picture>
              </div>
            </div>
        </div>
      </section>

      {/* DYNAMIC SECTIONS LOADED WITHOUT SSR TO REDUCE BLOCKING */}
      <MainSections showFloatingCTA={showFloatingCTA} />
      
      {/* EXIT INTENT POPUP (LOADED DYNAMICALLY) */}
      <ExitIntentPopup />
    </div>
  );
}
