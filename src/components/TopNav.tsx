'use client';
import { useState } from 'react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { Wallet, Target, Layers, BookOpen, Component } from 'lucide-react';

interface Props {
  page: 'tracker' | 'dashboard' | 'planner' | 'finances' | 'recursos' | 'modulos';
  setPage: (p: 'tracker' | 'dashboard' | 'planner' | 'finances' | 'recursos' | 'modulos') => void;
  userEmail: string;
  userTier?: string;
  isPaid?: boolean;
}

import { useTranslation } from '@/hooks/useTranslation';

export default function TopNav({ page, setPage, userEmail, userTier, isPaid }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const tabs = [
    { id: 'tracker' as const, label: t('tracker_tab'), icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'planner' as const, label: t('planner_tab'), icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'finances' as const, label: t('finances_tab'), icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: 'recursos' as const, label: t('recursos_tab'), icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'modulos' as const, label: t('modulos_tab'), icon: <Component className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="sticky top-0 z-[999] bg-white/80 backdrop-blur-xl border-b border-emerald-100/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-emerald-900 hover:bg-emerald-50 rounded-xl sm:rounded-2xl transition-all duration-300 group"
            >
              <div className="space-y-1 sm:space-y-1.5">
                <div className={`w-5 sm:w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5 sm:translate-y-2' : ''}`}></div>
                <div className={`w-3 sm:w-4 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'group-hover:w-6'}`}></div>
                <div className={`w-5 sm:w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5 sm:translate-y-2' : ''}`}></div>
              </div>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-xl sm:rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-emerald-200 transition-transform group-hover:rotate-6">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-pulse" />
              </div>
              <span className="text-base sm:text-xl font-black tracking-tighter text-emerald-950 italic">MÉTODO <span className="text-emerald-600">STACK</span></span>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-emerald-100">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">{t('common_authorized_device')}</span>
                <span className="text-xs font-bold text-emerald-950">{userEmail}</span>
              </div>
              {(!isPaid || userTier === 'trial' || userTier === 'free' || userTier === 'gratis') && (
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm animate-pulse flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Trial: 72h
                </div>
              )}
            </div>

            <button
              onClick={signOut}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-rose-50 text-rose-600 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg sm:rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all duration-300 active:scale-95 shadow-sm shadow-rose-100"
            >
              {t('logout_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-emerald-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-2xl mx-auto p-4 space-y-2">
            {tabs.map((tab) => {
              const { id, label, icon } = tab;
              let isLocked = false;
              const tier = (userTier || '').toLowerCase();
              const isTrialUser = !isPaid || ['trial', 'free', 'gratis'].includes(tier);
              
              if (isTrialUser) {
                if (id === 'recursos') isLocked = true;
              } else {
                const isFull = ['duo', 'max', 'plan_max', 'plan max', 'stack completo', 'completo'].includes(tier);
                if (!isFull) {
                  if (tier === 'habitos' && id !== 'tracker' && id !== 'recursos' && id !== 'modulos') isLocked = true;
                  if ((tier === 'tareas' || tier === 'enfoque') && id !== 'planner' && id !== 'recursos' && id !== 'modulos') isLocked = true;
                  if (tier === 'finanzas' && id !== 'finances' && id !== 'recursos' && id !== 'modulos') isLocked = true;
                }
              }

              return (
                <button
                  key={id}
                  onClick={() => { setPage(id); setIsMenuOpen(false); }}
                  className={`w-full group p-4 rounded-2xl flex items-center justify-between transition-all duration-200
                    ${page === id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                      : 'hover:bg-emerald-50 text-emerald-900'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-colors ${page === id ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600 group-hover:bg-white'}`}>
                      {icon}
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider">{label}</span>
                  </div>
                  {isLocked && <span className="text-lg opacity-50">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
