'use client';
import React from 'react';
import Link from 'next/link';
import ClientLandingLogic from './ClientLandingLogic';
import { I18nProvider, useTranslation } from '@/hooks/useTranslation';
import LocalPaymentModal from './LocalPaymentModal';
import USDModulePaymentModal from './USDModulePaymentModal';
import LocalModulePaymentModal from './LocalModulePaymentModal';
import { useState } from 'react';

export const WSP_GLOBAL_LINK = "https://wa.me/51914587375?text=Hola!%20Vengo%20de%20la%20p%C3%A1gina%20y%20quiero%20mi%20llave%20de%20acceso%20gratis%20por%203%20d%C3%ADas%20al%20M%C3%A9todo%20STACK.%20%F0%9F%8C%BF";

export default function LandingPage() {
  return (
    <I18nProvider>
      <LandingPageContent />
    </I18nProvider>
  );
}

function LandingPageContent() {
  const { isPeru } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUSDModalOpen, setIsUSDModalOpen] = useState(false);
  const [usdSelectedModule, setUsdSelectedModule] = useState('');
  const [isLocalModuleOpen, setIsLocalModuleOpen] = useState(false);
  const [localSelectedModule, setLocalSelectedModule] = useState('');
  const [selectedPlan, setSelectedPlan] = useState({ name: '', price: '' });
  
  const HOTMART_LINK = isPeru 
    ? "https://pay.hotmart.com/I93345386S?checkoutMode=10&bid=1731613271708" 
    : "https://pay.hotmart.com/P105923727L?checkoutMode=10";

  const openPayment = (name: string, price: string) => {
    if (name === 'PLANES INDIVIDUALES' || name.startsWith('MÓDULO')) {
      if (isPeru) {
        setLocalSelectedModule(name);
        setIsLocalModuleOpen(true);
      } else {
        setUsdSelectedModule(name);
        setIsUSDModalOpen(true);
      }
    } else {
      setSelectedPlan({ name, price });
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#00C853]/20">
      
      {/* NAVBAR - RENDERED WITH CLIENT LOGIC FOR GEO-LINKS */}
      <nav>
        <div className="nav-container">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center">
              <svg className="text-white w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z"/></svg>
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">MÉTODO STACK</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#hero" className="text-sm font-bold hover:text-[#00C853] transition-colors">Inicio</a>
            <a href="#beneficios" className="text-sm font-bold hover:text-[#00C853] transition-colors">Beneficios</a>
            <a href="#precios" className="text-sm font-bold hover:text-[#00C853] transition-colors">Precios</a>
            <Link 
              href="/login" 
              className="px-6 py-2.5 border-2 border-black rounded-full text-sm font-black uppercase hover:bg-black hover:text-white transition-all"
            >
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="max-w-5xl">
          <div className="hero-badge">
            <svg className="w-3 h-3 fill-[#00C853]" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Empiezas con energía. A la semana, ya abandonaste.
          </div>
          
          <h1 className="hero-title">
            Esto lo resuelve.
          </h1>
          
          <p className="hero-p">
            Método STACK es el sistema que convierte tus intenciones en rutinas reales — con seguimiento de hábitos, planeador semanal y control financiero en un solo lugar.
          </p>

          <Link 
            href="/register"
            className="btn-primary"
          >
            <span className="uppercase">EMPEZAR MI TRANSFORMACIÓN</span>
            <div className="btn-icon">
              <svg className="w-4 h-4 text-[#00C853] fill-[#00C853]" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
          </Link>

          {/* CRITICAL LCP IMAGE: NO JS REQUIRED TO RENDER */}
          <div className="hero-img-container">
            <img
              src="/hero-mobile.webp"
              srcSet="/hero-mobile.webp 767w, /hero.webp 1200w"
              sizes="(max-width: 767px) 100vw, 1024px"
              alt="Plataforma Método Stack"
              width={1200}
              height={800}
              loading="eager"
              fetchPriority="high"
            />
          </div>
      </section>

      {/* CLIENT BOUNDARY STARTS HERE - DEFERRED INITIALIZATION */}
      <ClientLandingLogic onOpenPayment={openPayment} />

      <LocalPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        planName={selectedPlan.name} 
        price={selectedPlan.price} 
      />

      <USDModulePaymentModal
        isOpen={isUSDModalOpen}
        onClose={() => setIsUSDModalOpen(false)}
        defaultModuleName={usdSelectedModule}
      />

      <LocalModulePaymentModal
        isOpen={isLocalModuleOpen}
        onClose={() => setIsLocalModuleOpen(false)}
        defaultModuleName={localSelectedModule}
      />
    </div>
  );
}
