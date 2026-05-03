'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';

import TopNav from '@/components/TopNav';
import MonthHeader from '@/components/MonthHeader';
import AddHabitRow from '@/components/AddHabitRow';
import TrackerTable from '@/components/TrackerTable';
import AnalysisCard from '@/components/AnalysisCard';
import ProgressChart from '@/components/ProgressChart';
import MoodChart from '@/components/MoodChart';
import DashboardPage from '@/components/DashboardPage';
import PlannerClient from '@/app/planner/PlannerClient';
import FinanceClient from '@/app/finanzas/FinanceClient';
import NotificationBanner from '@/components/NotificationBanner';
import RecursosClient from '@/components/RecursosClient';
import Link from 'next/link';
import { useHabits, useCompletions, useMoodLogs } from '@/hooks/useTracker';
import { daysInMonth, toISODate } from '@/lib/dateUtils';
import { I18nProvider, useTranslation } from '@/hooks/useTranslation';
import CalendarView from '@/components/CalendarView';

interface Props { userId: string; userEmail: string; }

export default function TrackerClient(props: Props) {
  return (
    <TrackerContent {...props} />
  );
}

function TrackerContent({ userId, userEmail }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useTranslation();
  const now = new Date();
  
  const formatName = (email: string) => {
    const part = email.split('@')[0];
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  };
  const userName = formatName(userEmail);

  const [page, setPage]   = useState<'tracker' | 'dashboard' | 'planner' | 'finances' | 'recursos'>('tracker');
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear]   = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userTier, setUserTier] = useState<string>('trial');
  const [isPaid, setIsPaid] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState<'tracker' | 'planner' | null>(null);

  useEffect(() => {
    async function initUser() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, is_paid')
        .eq('id', userId)
        .single();
      
      if (profile) {
        setUserTier(profile.tier || 'trial');
        setIsPaid(profile.is_paid || false);
        
        // Redirección inicial por plan
        if (profile.is_paid && profile.tier === 'tareas') {
          setPage('planner');
        }

        // Lógica de Onboarding Refinada
        const isNew = new URLSearchParams(window.location.search).get('new');
        const isPaidMember = profile.is_paid || (profile.tier && profile.tier !== 'trial');

        if (isPaidMember) {
          // Usuarios con suscripción NUNCA ven el onboarding
          setShowOnboarding(false);
        } else if (isNew === 'true') {
          // Recién registrados
          setShowOnboarding(true);
        } else {
          // Usuarios recurrentes o en trial
          const hasShown = localStorage.getItem(`stack_onboarding_${userId}`);
          if (!hasShown && profile.tier === 'trial') {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        }
      }
    }
    initUser();
  }, [userId, supabase]);

  const { habits, loading, add, remove, archiveFromMonth, rename } = useHabits();
  const { completions, toggle }          = useCompletions(year, month);
  const { logs, upsert }                 = useMoodLogs(year, month);
  
  // LOGICA DE SEGURIDAD Y DISPOSITIVOS
  const [sessionCount, setSessionCount] = useState(1);
  const [isSecurityTooltipOpen, setIsSecurityTooltipOpen] = useState(false);


  useEffect(() => {
    async function checkSessions() {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId);
      
      if (!error && sessions) {
        const count = sessions.length;
        setSessionCount(count);
        if (count > 3) {
          window.location.href = '/limite-alcanzado';
        }
      }
    }
    checkSessions();
    // Suscribirse a cambios en sesiones para tiempo real
    const channel = supabase
      .channel('session_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions', filter: `user_id=eq.${userId}` }, 
        () => checkSessions()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);


  const completionMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    completions.forEach(c => {
      if (!map.has(c.habit_id)) map.set(c.habit_id, new Set());
      map.get(c.habit_id)!.add(c.date);
    });
    return map;
  }, [completions]);

  const moodMap = useMemo(() => {
    const map = new Map<string, { mood: number | null; motivation: number | null }>();
    logs.forEach(l => map.set(l.date, { mood: l.mood, motivation: l.motivation }));
    return map;
  }, [logs]);

  const displayHabits = habits.filter(h => {
    const created = new Date(h.created_at);
    const monthStart = new Date(year, month, 1);
    const monthEnd   = new Date(year, month + 1, 0, 23, 59, 59);
    if (created > monthEnd) return false;
    if (!h.archived_at) return true;
    const archived = new Date(h.archived_at);
    if (archived <= monthStart) return false;
    return archived > monthEnd;
  });

  const days = daysInMonth(month, year);
  
  const dayProgress = useMemo(() => Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    if (!displayHabits.length) return 0;
    const date = toISODate(year, month, d);
    const done = displayHabits.filter(h => completionMap.get(h.id)?.has(date)).length;
    return Math.min(100, Math.round(done / displayHabits.length * 100));
  }), [days, displayHabits, completionMap, year, month]);

  const headerHabits    = displayHabits.length;
  const headerCompleted = completions.filter(c => {
    const h = habits.find(h => h.id === c.habit_id);
    return !!h && displayHabits.some(dh => dh.id === h.id);
  }).length;
  
  let monthlyGoal = 0;
  displayHabits.forEach(h => {
    if (!h.archived_at) { monthlyGoal += days; } else {
      const arch = new Date(h.archived_at);
      const mS = new Date(year, month, 1);
      const mE = new Date(year, month + 1, 0);
      const effectiveEnd = arch > mE ? mE : arch;
      if (arch >= mS) {
        const daysActive = Math.ceil((effectiveEnd.getTime() - mS.getTime()) / (1000 * 60 * 60 * 24));
        monthlyGoal += Math.max(0, Math.min(days, daysActive));
      }
    }
  });
  const headerPct = monthlyGoal ? Math.min(100, Math.round(headerCompleted / monthlyGoal * 100)) : 0;

  const isTrackerSection = page === 'tracker' || page === 'dashboard';

  const handlePageChange = (p: 'tracker' | 'dashboard' | 'planner' | 'finances' | 'recursos') => {
    if (p === 'finances' || p === 'recursos') {
      setPage(p);
      return;
    }
    
    // Si es trial o duo, permitir todo
    if (!isPaid || userTier === 'duo' || userTier === 'trial') {
      setPage(p);
      return;
    }

    // Restricciones por plan
    if (p === 'planner' && userTier === 'habitos') {
      setShowLockedModal('planner');
      return;
    }
    if ((p === 'tracker' || p === 'dashboard') && userTier === 'tareas') {
      setShowLockedModal('tracker');
      return;
    }

    setPage(p);
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <TopNav 
        page={page === 'dashboard' ? 'tracker' : page} 
        setPage={handlePageChange} 
        userEmail={userEmail}
        userTier={userTier}
        isPaid={isPaid}
      />

      <NotificationBanner streak={0} />

      {isTrackerSection && (
        <div className="px-6 py-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text3 mb-2">
                {t('tracker_header')}
              </h5>
            </div>
            
            <div className="flex flex-col items-start sm:items-end gap-3">
              {/* SECURITY BADGE */}
              <div className="relative">
                <div 
                  onMouseEnter={() => setIsSecurityTooltipOpen(true)}
                  onMouseLeave={() => setIsSecurityTooltipOpen(false)}
                  onClick={() => setIsSecurityTooltipOpen(!isSecurityTooltipOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm border border-app-border rounded-full cursor-help hover:bg-white transition-all shadow-sm"
                >
                  <div className={`w-2 h-2 rounded-full animate-pulse ${sessionCount >= 3 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-brand-green shadow-[0_0_10px_rgba(45,159,108,0.5)]'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-app-text2">
                    {t('common_authorized_device')}
                  </span>
                  <svg className={`w-3 h-3 ${sessionCount >= 3 ? 'text-orange-500' : 'text-brand-green'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.333 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>

                {isSecurityTooltipOpen && (
                  <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 p-4 bg-white border border-app-border rounded-xl shadow-2xl z-[110] animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[11px] font-bold text-app-text mb-2 uppercase tracking-tight">{t('common_security_access')}</p>
                    <p className="text-[10px] text-app-text3 leading-relaxed">
                      {t('common_active_sessions', { count: String(sessionCount), total: '3' })}
                      <br /><br />
                      {t('common_security_disclaimer')}
                    </p>
                    <div className="mt-3 pt-3 border-t border-app-border/50">
                      <p className="text-[9px] text-brand-pink/80 italic leading-snug">
                        {t('common_sharing_forbidden')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SUB-TABS */}
              <div className="flex bg-white/60 backdrop-blur-md border border-app-border rounded-2xl p-1.5 w-fit shadow-sm">
                <button 
                  onClick={() => handlePageChange('tracker')}
                  className={`px-8 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2
                    ${page === 'tracker' ? 'bg-[#2d5a3d] text-white shadow-lg scale-105' : 'text-app-text3 hover:text-app-text hover:bg-white/50'}`}
                >
                  {t('tracker_tab')}
                  {isPaid && userTier === 'tareas' && <span>🔒</span>}
                </button>
                <button 
                  onClick={() => handlePageChange('dashboard')}
                  className={`px-8 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2
                    ${page === 'dashboard' ? 'bg-[#2d5a3d] text-white shadow-lg scale-105' : 'text-app-text3 hover:text-app-text hover:bg-white/50'}`}
                >
                  {t('dashboard_tab')}
                  {isPaid && userTier === 'tareas' && <span>🔒</span>}
                </button>
              </div>
            </div>
          </div>

          {page === 'tracker' ? (
            <div className="animate-in fade-in duration-700">
              <div className="mb-6">
                <MonthHeader
                  month={month} year={year}
                  habitCount={headerHabits}
                  completed={headerCompleted}
                  pct={headerPct}
                  isCurrentMonth={year === now.getFullYear() && month === now.getMonth()}
                  onNavigate={(delta) => {
                    let m = month + delta, y = year;
                    if (m < 0) { m = 11; y--; }
                    if (m > 11) { m = 0; y++; }
                    const maxDays = daysInMonth(m, y);
                    if (selectedDay > maxDays) setSelectedDay(maxDays);
                    setMonth(m); setYear(y);
                  }}
                  onDateChange={(m, y) => {
                    const maxDays = daysInMonth(m, y);
                    if (selectedDay > maxDays) setSelectedDay(maxDays);
                    setMonth(m); setYear(y);
                  }}
                  onOpenCalendar={() => setIsCalendarOpen(true)}
                />
              </div>

              {/* CALENDAR MODAL */}
              {isCalendarOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-4 border-b border-app-border flex items-center justify-between bg-app-bg/10">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-app-text uppercase text-[11px] tracking-widest mr-2">
                          {t('common_select_day')}
                        </h3>
                        <div className="flex items-center gap-1">
                          <select 
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-white border border-app-border rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none focus:border-brand-green transition-colors"
                          >
                            {t('months').map((m: string, i: number) => (
                              <option key={i} value={i}>{m}</option>
                            ))}
                          </select>
                          <select 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-white border border-app-border rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none focus:border-brand-green transition-colors"
                          >
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsCalendarOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-app-text2"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6">
                      <CalendarView 
                        month={month} 
                        year={year} 
                        selectedDay={selectedDay} 
                        onSelectDay={(d) => {
                          setSelectedDay(d);
                          setIsCalendarOpen(false);
                        }} 
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 -z-10" onClick={() => setIsCalendarOpen(false)} />
                </div>
              )}

              <div className="mb-4">
                 <AddHabitRow onAdd={add} month={month} year={year} />
              </div>

              <div className="flex flex-col gap-4">
                {loading ? (
                  <div className="bg-app-surface border border-app-border rounded shadow-card p-8 text-center text-xs text-app-text3">
                    {t('loading')}
                  </div>
                ) : (
                  <TrackerTable
                    habits={displayHabits}
                    month={month} year={year}
                    completionMap={completionMap}
                    moodMap={moodMap}
                    userId={userId}
                    onToggle={toggle}
                    onDelete={archiveFromMonth}
                    onMoodChange={upsert}
                    onRename={rename}
                    selectedDay={selectedDay}
                  />
                )}

                <div className="bg-app-surface border border-app-border rounded-xl shadow-card p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-app-text3 mb-3">{t('mood_scale_title')}</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1,2,3,4,5].map(v => (
                       <div key={v} className="bg-[#f4faf6] border border-[#d8eadb] rounded-lg p-1.5 text-center">
                          <span className="text-lg block mb-1">{v === 1 ? '😫' : v === 2 ? '😕' : v === 3 ? '😐' : v === 4 ? '🙂' : '🤩'}</span>
                          <span className="text-[7px] sm:text-[9px] font-black text-[#2d5a3d] uppercase tracking-tighter">{t('level_label')} {v}</span>
                       </div>
                    ))}
                  </div>
                </div>

                <AnalysisCard habits={displayHabits} month={month} year={year} completionMap={completionMap} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-app-surface border border-app-border rounded-xl shadow-card p-5">
                      <p className="text-[10px] font-black tracking-wider uppercase text-app-text2 mb-4">{t('daily_progress')}</p>
                      <div className="h-28"><ProgressChart data={dayProgress} days={days} /></div>
                   </div>
                   <div className="bg-app-surface border border-app-border rounded-xl shadow-card p-5">
                      <p className="text-[10px] font-black tracking-wider uppercase text-app-text2 mb-4">{t('mood_status')}</p>
                      <div className="h-28"><MoodChart moodMap={moodMap} month={month} year={year} /></div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              <DashboardPage 
                year={year} 
                habits={habits} 
                currentMonth={month} 
                onMonthClick={(m) => { setMonth(m); setPage('tracker'); }}
              />
            </div>
          )}
        </div>
      )}

      {page === 'planner' && (
        <div className="animate-in fade-in duration-500">
           <PlannerClient userId={userId} userEmail={userEmail} asEmbedded />
        </div>
      )}

      {page === 'finances' && (
        <div className="animate-in fade-in duration-500">
           <FinanceClient userId={userId} userEmail={userEmail} onPageChange={setPage} />
        </div>
      )}

      {page === 'recursos' && (
        <div className="animate-in fade-in duration-500">
           <RecursosClient 
             userId={userId} 
             userEmail={userEmail} 
             userTier={userTier}
             isPaid={isPaid}
           />
        </div>
      )}

      {/* MODAL DE MÓDULO BLOQUEADO */}
      {showLockedModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-app-border p-8 sm:p-12 rounded-[40px] w-full max-w-md shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-black text-app-text mb-4 uppercase tracking-tight">Módulo Bloqueado</h2>
            <p className="text-app-text2 text-sm leading-relaxed mb-8">
              Este módulo no está incluido en tu plan actual (**Plan {userTier.toUpperCase()}**). 
              Pásate al **Plan Dúo** para activarlo y desbloquear todo el potencial del MÉTODO STACK.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  const msg = `Hola Orlando, quiero mi Plan Dúo. Mi correo es: ${userEmail}`;
                  window.open(`https://wa.me/51989078285?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-4 bg-brand-green text-white rounded-2xl font-black uppercase text-xs hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2"
              >
                <span>🚀 Quiero mi Plan Dúo (Upgrade)</span>
              </button>
              <button 
                onClick={() => setShowLockedModal(null)}
                className="w-full py-4 bg-app-surface text-app-text3 rounded-2xl font-black uppercase text-xs hover:bg-app-surface2 transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP BIENVENIDA MÉTODO STACK - MODO CLARO */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-700">
          <div className="bg-white border border-[#EBEDF0] p-10 sm:p-14 rounded-[48px] w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] text-center animate-in zoom-in-95 duration-500">
            <h2 className="text-5xl font-black italic uppercase text-emerald-600 mb-8 tracking-tighter">{t('onboarding_title')}</h2>
            <p className="text-[#4B4F56] text-sm sm:text-base leading-relaxed mb-10 px-4 font-medium">
              "{t('onboarding_desc')}"
            </p>
            <button 
              onClick={() => {
                setShowOnboarding(false);
                localStorage.setItem(`stack_onboarding_${userId}`, 'true');
              }}
              className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs sm:text-sm hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
            >
              {t('onboarding_cta')}
            </button>
            <p className="text-[10px] font-bold text-[#8D949E] uppercase tracking-[0.2em] mt-10">{t('onboarding_footer')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
