'use client';
import { useState } from 'react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { Wallet, Target, Layers, BookOpen } from 'lucide-react';

interface Props {
  page: 'tracker' | 'dashboard' | 'planner' | 'finances' | 'recursos';
  setPage: (p: 'tracker' | 'dashboard' | 'planner' | 'finances' | 'recursos') => void;
  userEmail: string;
  userTier?: string;
  isPaid?: boolean;
}

import { useTranslation } from '@/hooks/useTranslation';

export default function TopNav({ page, setPage, userEmail, userTier, isPaid }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useTranslation();
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
  ];

  return (
    <nav className="bg-app-surface border-b border-app-border sticky top-0 z-[999] pt-10 sm:pt-0 flex flex-col">
      <div className="px-3 sm:px-6 flex items-center w-full">
        {/* Sandwich Menu Button - Always Visible */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 -ml-2 mr-2 text-app-text hover:bg-app-surface2 rounded-lg transition-colors flex-shrink-0 -translate-y-3 sm:translate-y-0"
        >
          <div className="space-y-1">
            <div className={`w-5 h-0.5 bg-current transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-current transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-current transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-[14px] font-black tracking-tighter py-3.5 mr-2 sm:mr-6 shrink-0 -translate-y-3 sm:translate-y-0">
          <div className="w-2 h-2 bg-brand-green rounded-full" />
          <span className="hidden xs:inline">MÉTODO STACK</span>
        </div>

        {/* Desktop Tabs - Hidden as requested */}
        <div className="hidden">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setPage(tab.id)}>{tab.label}</button>
          ))}
        </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-5 -translate-y-3 sm:translate-y-0">
        {/* Language Selector */}
        <div className="relative group/lang z-[1000]">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as any)}
            className="appearance-none bg-app-surface2/50 border border-app-border rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-app-text2 cursor-pointer outline-none hover:bg-app-surface2 transition-all"
          >
            <option value="es">🇪🇸 ES</option>
            <option value="en">🇺🇸 EN</option>
            <option value="pt">🇧🇷 PT</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-app-text3 group-hover/lang:text-app-text transition-colors">▼</div>
        </div>

        <span className="text-[11px] text-app-text3 hidden sm:block font-medium">{userEmail}</span>
        <button
          onClick={signOut}
          className="text-[11px] text-app-text font-black uppercase tracking-widest px-4 py-1.5
                     border border-app-border rounded-lg hover:bg-brand-pink/5 hover:text-brand-pink hover:border-brand-pink/20 transition-all shadow-sm active:scale-95"
        >
          {t('logout_btn')}
        </button>
      </div>
      </div>

      {/* Sandwich Menu Dropdown */}
      {isMenuOpen && (
        <div className="w-full bg-app-surface border-t border-app-border shadow-lg absolute top-full left-0 animate-in slide-in-from-top-2 duration-200 z-[1001]">
          {tabs.map((tab) => {
            const { id, label, icon } = tab;
            const isLocked = isPaid && (
              (id === 'planner' && userTier === 'habitos') ||
              (id === 'tracker' && userTier === 'tareas')
            );

            return (
              <button
                key={id}
                onClick={() => { setPage(id); setIsMenuOpen(false); }}
                className={`w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b border-app-border last:border-0 flex items-center justify-between
                  ${page === id
                    ? 'text-brand-green bg-brand-green/5 border-l-4 border-l-brand-green'
                    : 'text-app-text3 border-l-4 border-l-transparent hover:bg-app-surface2'}`}
              >
                <div className="flex items-center gap-3">
                  {icon && icon}
                  <span>{label}</span>
                </div>
                {isLocked && <span>🔒</span>}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
