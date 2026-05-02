'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  ChevronDown, 
  LayoutDashboard, 
  Zap, 
  CreditCard,
  MessageSquare,
  Globe,
  ArrowRight,
  Activity,
  Target,
  ShieldCheck,
  Plus,
  Wallet
} from 'lucide-react';

import { useTranslation } from '@/hooks/useTranslation';

export default function LandingPage() {
  const { lang, setLang, t, currency } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = Array.from({ length: 7 }, (_, i) => ({
    q: t(`faq_${i + 1}_q`),
    a: t(`faq_${i + 1}_a`)
  }));

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
      <section id="hero" className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in slide-in-from-top duration-700">
              <Zap className="w-3 h-3 fill-[#00C853]" />
              {t('auth_tagline')}
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-[#111111] mb-8 animate-in slide-in-from-bottom duration-700 delay-100 uppercase">
              {t('hero_title').split(' ').map((word: string, i: number) => (
                <span key={i} className={i >= t('hero_title').split(' ').length - 2 ? 'text-[#00C853]' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            
            <p className="text-xl md:text-2xl text-[#111111]/70 font-medium max-w-3xl mx-auto mb-12 animate-in slide-in-from-bottom duration-700 delay-200">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom duration-700 delay-300">
              <Link 
                href="/register" 
                className="group relative px-10 py-5 bg-[#00C853] text-white rounded-2xl font-black italic text-lg tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#00C853]/30"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t('hero_cta')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* MOCKUP IMAGE */}
            <div className="mt-20 relative group max-w-4xl mx-auto">
              <div className="absolute -inset-4 bg-[#00C853]/10 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative aspect-[16/10] w-full drop-shadow-[0_35px_60px_rgba(0,0,0,0.15)] rounded-2xl border-4 border-white shadow-2xl overflow-hidden transition-all duration-700 group-hover:scale-[1.01]">
                <Image 
                  src="/metodo_stack_mockup_clinical.png" 
                  alt="Plataforma Método Stack Real App" 
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="beneficios" className="py-24 bg-[#F9F9F9] px-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-[#111111] mb-6 uppercase">
              {t('pilares_title')}
            </h2>
            <div className="w-24 h-1.5 bg-[#00C853] mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Activity className="w-10 h-10 text-[#00C853]" />, 
                title: t('habitos_title'), 
                desc: t('habitos_desc'),
                benefit: t('habitos_benefit')
              },
              { 
                icon: <Target className="w-10 h-10 text-[#00C853]" />, 
                title: t('tareas_title'), 
                desc: t('tareas_desc'),
                benefit: t('tareas_benefit')
              },
              { 
                icon: <Wallet className="w-10 h-10 text-[#00C853]" />, 
                title: t('finanzas_title'), 
                desc: t('finanzas_desc'),
                benefit: t('finanzas_benefit')
              },
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:border-[#00C853]/30 transition-all group">
                <div className="mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-2xl font-black uppercase italic mb-4">{f.title}</h3>
                <p className="text-lg font-medium text-[#111111]/60 leading-snug mb-6">{f.desc}</p>
                <div className="flex items-center gap-2 pt-4 border-t border-black/5">
                  <div className="w-2 h-2 rounded-full bg-[#00C853]"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#111111]/40">{f.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHORITY & GIFT */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#00C853] rounded-[48px] p-10 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-block px-4 py-1.5 bg-white text-[#00C853] text-[10px] font-black uppercase tracking-widest rounded-full mb-8">
                {t('gift_tag')}
              </span>
              <h2 className="text-4xl md:text-6xl font-black italic text-white mb-4 leading-tight uppercase">
                {t('gift_title')} <br />
                <span className="text-white/80">{t('gift_subtitle')}</span>
              </h2>
              <p className="text-white/60 text-lg md:text-xl font-bold mb-12 uppercase tracking-widest">
                {t('gift_format')}
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#00C853] rounded-2xl font-black italic text-lg tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                {t('pricing_start_free')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TABLE */}
      <section id="precios" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-[#111111] mb-6 uppercase">
              {t('pricing_title')}
            </h2>
            <div className="w-24 h-1.5 bg-[#00C853] mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: t('pricing_basic'), price: "0", period: t('pricing_per_year'), features: t('features_basic'), cta: t('pricing_start_free'), popular: false },
              { name: t('pricing_habitos'), price: "7.90", period: t('pricing_per_year'), features: t('features_habitos'), cta: t('pricing_activate'), popular: false },
              { name: t('pricing_enfoque'), price: "7.90", period: t('pricing_per_year'), features: t('features_enfoque'), cta: t('pricing_activate'), popular: false },
              { name: t('pricing_finanzas'), price: "7.90", period: t('pricing_per_year'), features: t('features_finanzas'), cta: t('pricing_activate'), popular: false },
              { name: t('pricing_max'), price: "14.90", period: t('pricing_per_year'), features: t('features_max'), cta: t('pricing_activate'), popular: true },
            ].map((plan, i) => (
              <div key={i} className={`p-6 rounded-[32px] border flex flex-col transition-all duration-500 ${plan.popular ? 'border-[#00C853] shadow-2xl scale-[1.02] bg-white' : 'border-black/5 bg-white/50'}`}>
                <h3 className="text-xs font-black uppercase italic mb-2">{plan.name}</h3>
                <div className="text-2xl font-black mb-6 italic">
                  {plan.price === '0' ? 'FREE' : `$ ${plan.price}`} 
                  <span className="text-[8px] font-bold text-black/30 not-italic uppercase tracking-widest ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-[10px] font-bold text-[#111111]/60 leading-tight">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`w-full py-3 rounded-full text-center text-[10px] font-black uppercase transition-all ${plan.popular ? 'bg-[#00C853] text-white hover:scale-105' : 'border-2 border-black hover:bg-black hover:text-white'}`}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-[#F9F9F9] px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">{t('faq_title')}</h2>
            <p className="text-sm font-bold text-black/30 uppercase tracking-[0.3em]">{t('faq_subtitle')}</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
                >
                  <span className="font-black uppercase italic text-sm tracking-tight">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-6 text-[#111111]/60 font-medium leading-relaxed text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111111] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#00C853] rounded-lg flex items-center justify-center text-white text-xs font-black -rotate-12 shadow-lg shadow-[#00C853]/30">S</div>
                <span className="font-fraunces text-2xl font-black italic text-white tracking-tighter uppercase">MÉTODO STACK</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs font-medium uppercase tracking-widest">
                {t('footer_tagline')}
              </p>
              <div className="flex gap-4">
                {[LayoutDashboard, Globe, Zap, Target].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-[#00C853] hover:text-white hover:border-[#00C853] transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">{t('footer_platform')}</h4>
              <ul className="space-y-4">
                {[
                  { key: 'nav_home', href: '#hero' },
                  { key: 'nav_benefits', href: '#beneficios' },
                  { key: 'nav_pricing', href: '#precios' }
                ].map((item) => (
                  <li key={item.key}>
                    <a href={item.href} className="text-white/40 text-xs font-bold hover:text-[#00C853] transition-colors uppercase tracking-widest">
                      {t(item.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">{t('footer_legal')}</h4>
              <ul className="space-y-4">
                {[
                  { key: 'auth_terms', href: '/terminos' },
                  { key: 'auth_privacy', href: '/privacidad' },
                  { key: 'auth_cookies', href: '/cookies' }
                ].map((link) => (
                  <li key={link.key}>
                    <Link href={link.href} className="text-white/40 text-xs font-bold hover:text-[#00C853] transition-colors uppercase tracking-widest">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">{t('footer_support')}</h4>
              <div className="space-y-6">
                <div className="flex gap-3 grayscale opacity-30">
                  <CreditCard className="w-6 h-6" />
                  <Globe className="w-6 h-6" />
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <a href="https://wa.me/51989078285" target="_blank" className="flex items-center gap-2 text-sm font-black text-[#00C853] hover:underline uppercase tracking-widest">
                    <MessageSquare className="w-4 h-4" />
                    {t('footer_contact')}
                  </a>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">soporte@metodostack.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
              {t('footer_copyright')}
            </p>
            <p className="text-white/40 text-[10px] font-medium max-w-2xl text-center md:text-right leading-relaxed uppercase tracking-wider">
              {t('footer_disclaimer')}
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING CTA */}
      <div className={`fixed bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-auto z-[999] transition-all duration-500 transform ${showFloatingCTA ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <Link 
          href="/register" 
          className="flex items-center justify-center bg-[#00C853] text-white py-4 md:py-3 px-8 rounded-full font-black uppercase text-[11px] md:text-[10px] tracking-widest shadow-[0_20px_40px_rgba(0,200,83,0.4)] hover:scale-105 transition-all group border-2 border-white/20 w-full md:w-auto"
        >
          <span className="mr-3 italic">{t('hero_cta')}</span>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-[#00C853] fill-[#00C853]" />
          </div>
        </Link>
      </div>
    </div>
  );
}
