'use client';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { daysInMonth, toISODate } from '@/lib/dateUtils';
import type { Habit } from '@/lib/types';
import { getHabitIcon } from '@/lib/habitIcons';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  habits: Habit[];
  month: number;
  year: number;
  completionMap: Map<string, Set<string>>;
  moodMap: Map<string, { mood: number | null; motivation: number | null }>;
  userId: string;
  onToggle: (habitId: string, date: string, userId: string) => void;
  onDelete: (id: string, month: number, year: number) => void;
  onMoodChange: (date: string, field: 'mood' | 'motivation', value: number | null, userId: string) => void;
  onRename?: (id: string, name: string) => void;
  selectedDay?: number;
}

export default function TrackerTable({
  habits, month, year, completionMap, moodMap,
  userId, onToggle, onDelete, onMoodChange, onRename, selectedDay
}: Props) {
  const { t, lang } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const diaHoy = new Date().getDate();
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const isCM = month === new Date().getMonth() && year === new Date().getFullYear();

  const days  = daysInMonth(month, year);
  const dr    = Array.from({ length: days }, (_, i) => i + 1);

  useEffect(() => {
    const dayToScroll = selectedDay || diaHoy;
    if (scrollContainerRef.current) {
      const targetEl = document.getElementById(`day-${dayToScroll}`);
      if (targetEl) {
        const container = scrollContainerRef.current;
        const stickyWidth = 280;
        const scrollOffset = targetEl.offsetLeft - stickyWidth - 20; // Extra padding
        container.scrollTo({
          left: Math.max(0, scrollOffset),
          behavior: 'smooth'
        });
      }
    }
  }, [month, year, isCM, diaHoy, selectedDay]);

  const firstDow = new Date(year, month, 1).getDay();
  const weeks: { label: string; start: number; end: number }[] = [];
  let currDay = 1;
  while (currDay <= days) {
    const end = Math.min(currDay === 1 ? (7 - firstDow) % 7 || 7 : currDay + 6, days);
    const weekLabel = t('week_label') || 'W';
    weeks.push({ label: `${t('months')[month].slice(0,3).toUpperCase()} - ${weekLabel}${weeks.length + 1}`, start: currDay, end });
    currDay = end + 1;
  }

  const isT = (d: number) => isCM && d === diaHoy;
  const isW = (d: number) => {
    const dObj = new Date(year, month, d).getDay();
    return dObj === 0 || dObj === 6;
  };
  const isS = (d: number) => d === selectedDay;

  const TH2 = 'sticky left-0 z-40 bg-white w-[240px] sm:w-[280px] min-w-[240px] sm:min-w-[280px] max-w-[240px] sm:max-w-[280px] border-r-2 border-b border-app-border shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)] text-left px-3 sm:px-5 font-black uppercase text-brand-green tracking-wider';
  const TD2 = 'sticky left-0 z-30 w-[240px] sm:w-[280px] min-w-[240px] sm:min-w-[280px] max-w-[240px] sm:max-w-[280px] border-r-2 border-b border-app-border shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)] bg-white px-3 sm:px-5 py-2 sm:py-3.5 font-bold text-app-text overflow-hidden';

  const dayCell = 'w-[40px] sm:w-[46px] min-w-[40px] sm:min-w-[46px] max-w-[40px] sm:max-w-[46px] border-r border-b border-app-border text-center';

  return (
    <div className="bg-app-surface border border-app-border rounded-xl shadow-sm overflow-hidden text-[10px] sm:text-[11px] text-app-text relative">
      <div className="sm:hidden absolute top-0 right-0 bg-brand-green text-white text-[7px] font-black px-2 py-0.5 rounded-bl-lg z-[50] animate-pulse uppercase tracking-tighter">Desliza →</div>
      <div className="p-3 sm:p-4 border-b border-app-border bg-app-bg/30">
         <h2 className="text-base sm:text-lg font-black uppercase text-app-text2 tracking-tighter">
           {isCM && <span className="mr-2 text-brand-green">{String(diaHoy).padStart(2, '0')}</span>}
           {new Date(year, month).toLocaleDateString(
             lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-ES', 
             { month: 'long', year: 'numeric' }
           )}
         </h2>
      </div>
      <div ref={scrollContainerRef} className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-100 scrollbar-track-transparent">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-40 bg-white w-[240px] sm:w-[280px] min-w-[240px] sm:min-w-[280px] max-w-[240px] sm:max-w-[280px] border-r-2 border-b border-app-border shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)]"></th>
              {weeks.map((w, wi) => (
                <th key={wi} colSpan={w.end - w.start + 1} className="text-[9px] sm:text-[10px] font-black text-app-text3 border-b border-app-border uppercase text-center border-r bg-app-bg/20 py-2 tracking-widest">
                  {w.label}
                </th>
              ))}
            </tr>
            <tr>
              <th className={TH2}>{t('my_habits')}</th>
              {dr.map(d => {
                const today = isT(d);
                const weekend = isW(d);
                const selected = isS(d);
                return (
                  <th
                    key={d}
                    id={`day-${d}`}
                    className={`${dayCell} h-10 sm:h-12 font-mono text-center transition-all duration-300 relative
                      ${selected ? 'bg-brand-green/20 border-l-2 border-r-2 border-brand-green text-brand-green z-20 font-black text-[11px] sm:text-[13px] scale-105 shadow-md' : 
                        today ? 'bg-green-50 border-l-2 border-r-2 border-green-600 text-green-700 font-black text-[12px] sm:text-[13px] z-20 ring-2 ring-green-100' : 
                        weekend ? 'bg-brand-pink-light text-brand-pink font-black' : 'bg-app-bg/10 text-app-text3'}`}
                  >
                    {today && <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] font-black bg-white text-brand-green px-1 rounded-sm shadow-sm border border-brand-green uppercase tracking-tighter">Hoy</div>}
                    {d}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {habits.map((hab: Habit, idx: number) => (
              <tr key={hab.id} className="group hover:bg-app-bg transition-colors">
                <td className={TD2} title={hab.name}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-app-text3 font-mono text-[9px] sm:text-[10px] w-3 sm:w-4 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="shrink-0">{getHabitIcon(hab.name)}</span>
                    
                    {editingHabitId === hab.id ? (
                      <div className="flex items-center gap-1 sm:gap-2 flex-1">
                        <input
                          autoFocus
                          className="w-full bg-app-bg border border-brand-green rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] outline-none"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              onRename?.(hab.id, editName);
                              setEditingHabitId(null);
                            } else if (e.key === 'Escape') {
                              setEditingHabitId(null);
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            onRename?.(hab.id, editName);
                            setEditingHabitId(null);
                          }}
                          className="text-brand-green font-bold text-[12px] sm:text-[14px]"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 break-words line-clamp-2">{hab.name}</span>
                        <div className="flex gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => {
                              setEditingHabitId(hab.id);
                              setEditName(hab.name);
                            }}
                            title={t('edit_habit_title')}
                            className="p-1 rounded-lg text-app-text3 hover:bg-app-bg hover:text-brand-green transition-colors cursor-pointer text-[10px]"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t('delete_confirm'))) onDelete(hab.id, month, year);
                            }}
                            title={t('delete_habit_title')}
                            className="p-1 rounded-lg text-brand-pink hover:bg-brand-pink-light transition-colors cursor-pointer text-[10px]"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
                {dr.map(d => {
                  const on = completionMap.get(hab.id)?.has(toISODate(year, month, d));
                  const today = isT(d);
                  const weekend = isW(d);
                  const selected = isS(d);
                  return (
                    <td key={d} className={`${dayCell} transition-all duration-300 ${selected ? 'bg-brand-green/10 border-l-2 border-r-2 border-brand-green' : today ? 'bg-green-50 border-l-2 border-r-2 border-green-500 z-10' : weekend ? 'bg-brand-pink-light/30' : ''}`}>
                      <div className="flex items-center justify-center p-2 h-full w-full">
                        <span onClick={() => onToggle(hab.id, toISODate(year, month, d), userId)} className={`habit-cb cursor-pointer ${on ? 'checked' : ''} ${selected ? 'border-brand-green ring-2 ring-brand-green/30' : today ? 'border-green-600 ring-2 ring-green-100 scale-110' : 'border-app-border'}`} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr className="bg-app-surface2">
              <td className={`${TD2} h-2 bg-app-surface2`} />
              <td colSpan={dr.length} className="border-b border-app-border h-2 bg-app-surface2" />
            </tr>

            <StatsRow label={t('completion_pct')} type="pct"     dr={dr} isT={isT} habits={habits} completionMap={completionMap} year={year} month={month} TD2={TD2} dayCell={dayCell} />
            <StatsRow label={t('total_done')}     type="done"    dr={dr} isT={isT} habits={habits} completionMap={completionMap} year={year} month={month} TD2={TD2} dayCell={dayCell} />
            <StatsRow label={t('total_not_done')} type="notdone" dr={dr} isT={isT} habits={habits} completionMap={completionMap} year={year} month={month} TD2={TD2} dayCell={dayCell} />

            {/* Spacer before Estado Mental */}
            <tr>
              <td className={`${TD2} h-4 bg-app-bg`} />
              <td colSpan={dr.length} className="border-b border-app-border h-4 bg-app-bg" />
            </tr>

            <tr>
                <th className={TH2}>{t('daily_mood_header')}</th>
               {dr.map(d => {
                 const today = isT(d);
                 return (
                   <td key={d} className={`${dayCell} h-12 font-mono text-center transition-all duration-300 font-black text-[12px] relative
                     ${isS(d) ? 'bg-brand-green text-white z-20 border-brand-green' : 
                       today ? 'bg-brand-green text-white z-30 border-l-2 border-r-2 border-green-700 shadow-lg scale-105' : 
                       isW(d) ? 'bg-brand-pink-light text-brand-pink' : 'bg-app-surface text-app-text3'}`}>
                     {today && <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] font-black bg-white text-brand-green px-1 rounded-sm shadow-sm border border-brand-green uppercase tracking-tighter">Hoy</div>}
                     {d}
                   </td>
                 );
               })}
            </tr>

            <MoodEntry label={t('mood_btn')} field="mood" color="text-brand-pink" dr={dr} isT={isT} isW={isW} moodMap={moodMap} onMoodChange={onMoodChange} year={year} month={month} userId={userId} TD2={TD2} dayCell={dayCell} />
            <MoodEntry label={t('motivation_btn')} field="motivation" color="text-brand-blue" dr={dr} isT={isT} isW={isW} moodMap={moodMap} onMoodChange={onMoodChange} year={year} month={month} userId={userId} TD2={TD2} dayCell={dayCell} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsRow({ label, dr, isT, habits, completionMap, type, month, year, TD2, dayCell }: any) {
  const isDone    = type === 'done';
  const isNotDone = type === 'notdone';
  const isPct     = type === 'pct';

  const rowBg    = isDone ? 'bg-brand-green/5' : isNotDone ? 'bg-brand-pink/5' : 'bg-app-bg/5';
  const labelCls = isPct
    ? 'text-app-text font-black text-[11px] tracking-widest'
    : isDone
    ? 'text-brand-green font-black'
    : 'text-brand-pink font-black';

  // Append % symbol to the pct label
  const displayLabel = isPct ? `% ${label}` : label;

  return (
    <tr className={`${rowBg} hover:brightness-95 transition-colors`}>
      <td className={`${TD2} uppercase ${labelCls}`}>{displayLabel}</td>
      {dr.map((d: number) => {
        const date = toISODate(year, month, d);
        const done = habits.filter((h: any) => completionMap.get(h.id)?.has(date)).length;
        const notDone = habits.length - done;

        let val: string | number;
        let colorCls = '';

        if (isPct) {
          val = habits.length ? Math.min(100, Math.round(done / habits.length * 100)) + '%' : '0%';
          colorCls = 'text-app-text font-black';
        } else if (isDone) {
          val = done;
          colorCls = done === habits.length && habits.length > 0 ? 'text-brand-green font-black' : 'text-brand-green';
        } else {
          val = notDone;
          colorCls = notDone === 0 ? 'text-app-text3' : 'text-brand-pink font-black';
        }

        return (
          <td key={d} className={`${dayCell} font-mono font-bold text-[11px] ${isT(d) ? 'bg-green-50/30 border-l-2 border-r-2 border-green-500 text-green-700' : colorCls || 'text-app-text3'}`}>
            {val}
          </td>
        );
      })}
    </tr>
  );
}

function MoodEntry({ label, field, color, dr, isT, isW, moodMap, onMoodChange, year, month, userId, TD2, dayCell }: any) {
  const getMoodConfig = (val: number | null) => {
    if (!val) return { bg: '', text: '', emoji: '' };
    switch (val) {
      case 1: return { bg: 'bg-[#fecaca]', text: 'text-red-900', emoji: '😫' }; 
      case 2: return { bg: 'bg-[#fed7aa]', text: 'text-orange-900', emoji: '😕' }; 
      case 3: return { bg: 'bg-[#fef08a]', text: 'text-yellow-900', emoji: '😐' }; 
      case 4: return { bg: 'bg-[#d9f99d]', text: 'text-lime-900', emoji: '🙂' }; 
      case 5: return { bg: 'bg-[#4ade80]', text: 'text-green-950 font-black', emoji: '🤩' }; 
      default: return { bg: '', text: '', emoji: '' };
    }
  };

  const moodOptions = [
    { v: 1, e: '😫' },
    { v: 2, e: '😕' },
    { v: 3, e: '😐' },
    { v: 4, e: '🙂' },
    { v: 5, e: '🤩' },
  ];

  return (
    <tr className="bg-white hover:bg-[#f6f6f4] transition-colors">
      <td className={`${TD2} uppercase ${color}`}>
        <div className="flex items-center gap-2">
           <span className="text-app-text3 font-mono text-[10px] w-4 shrink-0">{field === 'mood' ? '01' : '02'}</span>
           <span>{label}</span>
        </div>
      </td>
      {dr.map((d: number) => {
        const date = toISODate(year, month, d);
        const val = moodMap.get(date)?.[field] ?? '';
        const config = getMoodConfig(val ? Number(val) : null);
        
        return (
          <td key={d} className={`${dayCell} p-0.5 transition-all duration-300 ${isT(d) ? 'bg-green-50/30 border-l-2 border-r-2 border-green-500' : isW(d) ? 'bg-[#f8e7eb]/10' : ''} ${config.bg || ''}`}>
             <div className="flex items-center justify-center h-full w-full">
               <select 
                 className={`mood-select cursor-pointer w-[44px] h-[34px] text-center bg-transparent border-0 rounded-md appearance-none focus:ring-0 text-[11px] leading-tight ${val ? `font-black ${config.text}` : 'text-[#888]'} ${isT(d) && !val ? 'text-[#3a7bc8]' : ''}`} 
                 value={val} 
                 onChange={e => onMoodChange(date, field, e.target.value ? +e.target.value : null, userId)}
               >
                 <option value="" className="text-gray-400">—</option>
                 {moodOptions.map(opt => (
                   <option key={opt.v} value={opt.v} className="text-black bg-white">
                     {opt.e} {opt.v}
                   </option>
                 ))}
               </select>
             </div>
          </td>
        );
      })}
    </tr>
  );
}
