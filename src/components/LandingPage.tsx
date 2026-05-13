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
              <svg className="text-white w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z"/></svg>
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">MÉTODO STACK</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
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

      {/* HERO SECTION - ZERO-DELAY RENDER STRUCTURE */}
      <section id="hero" className="pt-24 sm:pt-32 pb-12 px-6 min-h-[70vh] flex flex-col justify-center bg-white">
        <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <svg className="w-3 h-3 fill-[#00C853]" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              {t('auth_tagline')}
            </div>
            
            <h1 className="hero-title text-[#111111] leading-[1.05] m-0 mb-6 font-black italic uppercase tracking-tighter">
              {t('hero_title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-[#111111]/70 font-medium max-w-3xl mx-auto mb-10">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <a 
                href={WSP_GLOBAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center px-10 py-5 bg-[#00C853] text-black rounded-full font-black italic text-lg tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#00C853]/30 w-full md:w-auto"
              >
                <span className="mr-3 uppercase">EMPEZAR MI TRANSFORMACIÓN</span>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-[#00C853] fill-[#00C853]" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
              </a>
            </div>

            {/* CRITICAL: Simplified Image - No 'picture', no 'aspect-ratio' delay, no transitions */}
            <div className="relative w-full max-w-4xl mx-auto rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-[#00C853]/5">
              <img
                src="/hero-mobile.webp"
                srcSet="/hero-mobile.webp 600w, /hero.webp 1200w"
                sizes="(max-width: 600px) 100vw, 1200px"
                alt="Plataforma Método Stack"
                width={1200}
                height={800}
                className="w-full h-auto block object-contain"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
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
